import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_WORDS = 10_000;
const ROOTS = ["packs", "examples"];
const FILE_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const DIRECTORY_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ALLOWED_PACK_KEYS = new Set([
  "sourceLanguage",
  "targetLanguage",
  "name",
  "description",
  "thumbnailUrl",
  "tags",
  "localizations",
  "words",
]);
const ALLOWED_LOCALIZATION_KEYS = new Set(["name", "description"]);
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
  errors.push("No JSON word packs were found.");
}

if (errors.length > 0) {
  console.error(`Word pack validation failed (${errors.length} errors)`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Word pack validation passed: ${validatedFiles} files, ${validatedWords} words`,
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
        errors.push(`${entryPath}: directory names must use kebab-case.`);
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
    errors.push(`${filePath}: file names must use kebab-case.json.`);
  }

  const fileStats = await stat(filePath);
  if (fileStats.size > MAX_FILE_SIZE) {
    errors.push(`${filePath}: file size exceeds 5MB.`);
    return;
  }

  const raw = await readFile(filePath, "utf8");
  let pack;

  try {
    pack = JSON.parse(raw);
  } catch (error) {
    errors.push(`${filePath}: invalid JSON (${error.message}).`);
    return;
  }

  const formatted = `${JSON.stringify(pack, null, 2)}\n`;
  if (raw !== formatted) {
    errors.push(
      `${filePath}: JSON must use two-space indentation and end with a newline.`,
    );
  }

  if (!isPlainObject(pack)) {
    errors.push(`${filePath}: the top-level value must be an object.`);
    return;
  }

  reportUnknownKeys(filePath, pack, ALLOWED_PACK_KEYS);

  if (pack.sourceLanguage !== "ko") {
    errors.push(`${filePath}: sourceLanguage must be "ko".`);
  }
  if (pack.targetLanguage !== "ja") {
    errors.push(`${filePath}: targetLanguage must be "ja".`);
  }
  if (
    filePath.startsWith(`packs${path.sep}`) &&
    !filePath.startsWith(
      `packs${path.sep}${pack.sourceLanguage}-${pack.targetLanguage}${path.sep}`,
    )
  ) {
    errors.push(
      `${filePath}: path must match sourceLanguage-targetLanguage.`,
    );
  }

  validateString(filePath, "name", pack.name, 100);
  if (pack.description !== undefined) {
    validateString(filePath, "description", pack.description, 1000);
  }
  if (pack.thumbnailUrl !== undefined) {
    validateHttpsUrl(filePath, "thumbnailUrl", pack.thumbnailUrl);
  }
  if (pack.tags !== undefined) {
    validateTags(filePath, pack.tags);
  }
  if (pack.localizations !== undefined) {
    validateLocalizations(filePath, pack.localizations);
  }

  if (!Array.isArray(pack.words) || pack.words.length === 0) {
    errors.push(`${filePath}: words must contain at least one word.`);
    return;
  }

  if (pack.words.length > MAX_WORDS) {
    errors.push(`${filePath}: words cannot exceed ${MAX_WORDS} items.`);
  }

  const seenInPack = new Set();

  pack.words.forEach((word, index) => {
    const location = `${filePath}: words[${index}]`;
    if (!isPlainObject(word)) {
      errors.push(`${location}: must be an object.`);
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
      errors.push(`${location}: the same word already exists in this pack.`);
      return;
    }
    seenInPack.add(key);

    const previous = seenAcrossPacks.get(key);
    if (previous !== undefined) {
      errors.push(`${location}: exactly duplicates ${previous}.`);
    } else {
      seenAcrossPacks.set(key, location);
    }
  });
}

function validateString(location, field, value, maxLength) {
  if (typeof value !== "string") {
    errors.push(`${location}: ${field} must be a string.`);
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    errors.push(`${location}: ${field} cannot be empty.`);
    return null;
  }
  if (value !== trimmed) {
    errors.push(`${location}: ${field} cannot have leading or trailing whitespace.`);
  }
  if (trimmed.length > maxLength) {
    errors.push(`${location}: ${field} cannot exceed ${maxLength} characters.`);
  }
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) {
    errors.push(`${location}: ${field} cannot contain control characters.`);
  }

  return trimmed;
}

function validateLocalizations(location, value) {
  if (!isPlainObject(value)) {
    errors.push(`${location}: localizations must be an object.`);
    return;
  }

  for (const language of Object.keys(value)) {
    if (language !== "ko" && language !== "ja") {
      errors.push(`${location}: unsupported localization "${language}".`);
      continue;
    }

    const localized = value[language];
    const localizedLocation = `${location}: localizations.${language}`;
    if (!isPlainObject(localized)) {
      errors.push(`${localizedLocation} must be an object.`);
      continue;
    }

    reportUnknownKeys(
      localizedLocation,
      localized,
      ALLOWED_LOCALIZATION_KEYS,
    );
    if (localized.name === undefined && localized.description === undefined) {
      errors.push(`${localizedLocation} must contain name or description.`);
    }
    if (localized.name !== undefined) {
      validateString(localizedLocation, "name", localized.name, 100);
    }
    if (localized.description !== undefined) {
      validateString(
        localizedLocation,
        "description",
        localized.description,
        1000,
      );
    }
  }
}

function validateHttpsUrl(location, field, value) {
  const validated = validateString(location, field, value, 2048);
  if (validated === null) {
    return;
  }

  try {
    if (new URL(validated).protocol !== "https:") {
      throw new Error();
    }
  } catch {
    errors.push(`${location}: ${field} must be a valid HTTPS URL.`);
  }
}

function validateTags(location, value) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 20) {
    errors.push(`${location}: tags must contain between 1 and 20 items.`);
    return;
  }

  const seen = new Set();
  value.forEach((tag, index) => {
    const tagLocation = `${location}: tags[${index}]`;
    const validated = validateString(tagLocation, "tag", tag, 50);
    if (
      validated !== null &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(validated)
    ) {
      errors.push(`${tagLocation}: tags must use English kebab-case.`);
    }
    if (validated !== null && seen.has(validated)) {
      errors.push(`${tagLocation}: duplicate tag "${validated}".`);
    }
    seen.add(validated);
  });
}

function reportUnknownKeys(location, value, allowedKeys) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      errors.push(`${location}: unknown field "${key}".`);
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
