import { createHash } from "node:crypto";
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const rootDirectory = resolve(import.meta.dirname, "..");
const packsDirectory = resolve(rootDirectory, "packs");
const thumbnailsDirectory = resolve(rootDirectory, "thumbnails");
const outputDirectory = resolve(rootDirectory, "dist");
const catalogPath = resolve(outputDirectory, "catalog.json");
const catalogsDirectory = resolve(outputDirectory, "catalogs");

const packPaths = await collectJsonFiles(packsDirectory);
const packs = [];

for (const absolutePath of packPaths) {
  const path = relative(rootDirectory, absolutePath).split(sep).join("/");
  const contents = await readFile(absolutePath);
  const pack = JSON.parse(contents.toString("utf8"));
  const pathParts = path.split("/");
  const fileName = pathParts.at(-1);
  const categoryParts = pathParts.slice(2, -1);

  packs.push({
    id: [...pathParts.slice(1, -1), fileName.replace(/\.json$/u, "")].join(
      "/",
    ),
    sourceLanguage: pack.sourceLanguage,
    targetLanguage: pack.targetLanguage,
    name: pack.name,
    ...(pack.description === undefined
      ? {}
      : { description: pack.description }),
    ...(pack.thumbnailUrl === undefined
      ? {}
      : { thumbnailUrl: pack.thumbnailUrl }),
    ...(pack.tags === undefined ? {} : { tags: pack.tags }),
    ...(pack.localizations === undefined
      ? {}
      : { localizations: pack.localizations }),
    category: categoryParts.join("/"),
    wordCount: pack.words.length,
    path,
    sha256: createHash("sha256").update(contents).digest("hex"),
  });
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await mkdir(catalogsDirectory, { recursive: true });
await cp(packsDirectory, resolve(outputDirectory, "packs"), {
  recursive: true,
});
await cp(thumbnailsDirectory, resolve(outputDirectory, "thumbnails"), {
  recursive: true,
});

const packsByDirection = new Map();
for (const pack of packs) {
  const direction = `${pack.sourceLanguage}-${pack.targetLanguage}`;
  const directionPacks = packsByDirection.get(direction) ?? [];
  directionPacks.push(pack);
  packsByDirection.set(direction, directionPacks);
}
const directions = [];

for (const [direction, directionPacks] of packsByDirection) {
  directionPacks.sort((left, right) => left.id.localeCompare(right.id, "en"));
  const revision = createHash("sha256")
    .update(JSON.stringify(directionPacks))
    .digest("hex");
  const directionCatalog = {
    schemaVersion: 2,
    sourceLanguage: directionPacks[0].sourceLanguage,
    targetLanguage: directionPacks[0].targetLanguage,
    revision,
    license: "CC-BY-4.0",
    repository: "https://github.com/hurest/vocatab-word-packs",
    packs: directionPacks,
  };

  const directionDirectory = resolve(catalogsDirectory, direction);
  await mkdir(directionDirectory, { recursive: true });
  await writeFile(
    resolve(directionDirectory, "catalog.json"),
    `${JSON.stringify(directionCatalog, null, 2)}\n`,
  );
  directions.push({
    sourceLanguage: directionPacks[0].sourceLanguage,
    targetLanguage: directionPacks[0].targetLanguage,
    packCount: directionPacks.length,
    path: `catalogs/${direction}/catalog.json`,
    revision,
  });
}

directions.sort((left, right) => left.path.localeCompare(right.path, "en"));
const manifest = {
  schemaVersion: 1,
  revision: createHash("sha256")
    .update(JSON.stringify(directions))
    .digest("hex"),
  directions,
};
await writeFile(catalogPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  `Built Pages artifact with ${packs.length} packs in ${directions.length} language directions.`,
);

async function collectJsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      paths.push(...(await collectJsonFiles(entryPath)));
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      paths.push(entryPath);
    }
  }

  return paths;
}
