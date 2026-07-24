import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WORDS = 10_000;
const ROOTS = ["packs", "examples"];
const FILE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const DIRECTORY_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_PACK_KEYS = new Set(["language", "name", "words"]);
const ALLOWED_WORD_KEYS = new Set([
  "term",
  "reading",
  "meaning",
  "example",
]);

const errors = [];
const seenAcrossPacks = new Map();
let validatedFiles = 0;
let validatedWords = 0;

for (const root of ROOTS) {
  for (const filePath of await collectJsonFiles(root)) {
    await validateFile(filePath);
  }
}

if (validatedFiles === 0) {
  errors.push("검증할 JSON 단어팩이 없습니다.");
}

if (errors.length > 0) {
  console.error(`단어팩 검증 실패 (${errors.length}개 오류)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `단어팩 검증 성공: ${validatedFiles}개 파일, ${validatedWords}개 단어`,
  );
}

async function collectJsonFiles(root) {
  const files = [];

  try {
    await walk(root, files);
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  return files.sort();
}

async function walk(directory, files) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!DIRECTORY_NAME_PATTERN.test(entry.name)) {
        errors.push(`${entryPath}: 폴더 이름은 kebab-case여야 합니다.`);
      }
      await walk(entryPath, files);
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(entryPath);
    }
  }
}

async function validateFile(filePath) {
  validatedFiles += 1;

  if (!FILE_NAME_PATTERN.test(path.basename(filePath))) {
    errors.push(`${filePath}: 파일 이름은 kebab-case.json이어야 합니다.`);
  }

  const fileStats = await stat(filePath);
  if (fileStats.size > MAX_FILE_SIZE) {
    errors.push(`${filePath}: 파일 크기가 5MB를 초과합니다.`);
    return;
  }

  const raw = await readFile(filePath, "utf8");
  let pack;

  try {
    pack = JSON.parse(raw);
  } catch (error) {
    errors.push(`${filePath}: 올바른 JSON이 아닙니다 (${error.message}).`);
    return;
  }

  const formatted = `${JSON.stringify(pack, null, 2)}\n`;
  if (raw !== formatted) {
    errors.push(`${filePath}: JSON은 2칸 들여쓰기와 마지막 줄바꿈이 필요합니다.`);
  }

  if (!isPlainObject(pack)) {
    errors.push(`${filePath}: 최상위 값은 객체여야 합니다.`);
    return;
  }

  reportUnknownKeys(filePath, pack, ALLOWED_PACK_KEYS);

  if (pack.language !== "ja") {
    errors.push(`${filePath}: language는 "ja"여야 합니다.`);
  }

  validateString(filePath, "name", pack.name, 100);

  if (!Array.isArray(pack.words) || pack.words.length === 0) {
    errors.push(`${filePath}: words에는 한 개 이상의 단어가 필요합니다.`);
    return;
  }

  if (pack.words.length > MAX_WORDS) {
    errors.push(`${filePath}: words는 ${MAX_WORDS}개를 초과할 수 없습니다.`);
  }

  const seenInPack = new Set();

  pack.words.forEach((word, index) => {
    const location = `${filePath}: words[${index}]`;
    if (!isPlainObject(word)) {
      errors.push(`${location}: 객체여야 합니다.`);
      return;
    }

    reportUnknownKeys(location, word, ALLOWED_WORD_KEYS);
    const term = validateString(location, "term", word.term, 200);
    const reading = validateString(location, "reading", word.reading, 200);
    const meaning = validateString(location, "meaning", word.meaning, 500);

    if (word.example !== undefined) {
      validateString(location, "example", word.example, 1000);
    }

    if (term === null || reading === null || meaning === null) {
      return;
    }

    validatedWords += 1;
    const key = [term, reading, meaning]
      .map((value) => value.normalize("NFKC").toLocaleLowerCase("ja"))
      .join("\u0000");

    if (seenInPack.has(key)) {
      errors.push(`${location}: 같은 단어가 이 팩에 이미 있습니다.`);
      return;
    }
    seenInPack.add(key);

    const previous = seenAcrossPacks.get(key);
    if (previous !== undefined) {
      errors.push(`${location}: ${previous}와 완전히 중복됩니다.`);
    } else {
      seenAcrossPacks.set(key, location);
    }
  });
}

function validateString(location, field, value, maxLength) {
  if (typeof value !== "string") {
    errors.push(`${location}: ${field}는 문자열이어야 합니다.`);
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    errors.push(`${location}: ${field}는 비어 있을 수 없습니다.`);
    return null;
  }
  if (value !== trimmed) {
    errors.push(`${location}: ${field} 앞뒤에 공백이 없어야 합니다.`);
  }
  if (trimmed.length > maxLength) {
    errors.push(`${location}: ${field}는 ${maxLength}자를 초과할 수 없습니다.`);
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) {
    errors.push(`${location}: ${field}에 제어 문자를 사용할 수 없습니다.`);
  }

  return trimmed;
}

function reportUnknownKeys(location, value, allowedKeys) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      errors.push(`${location}: 알 수 없는 필드 "${key}"가 있습니다.`);
    }
  }
}

function isPlainObject(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
