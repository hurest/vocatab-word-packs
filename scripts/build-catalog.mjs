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
const outputDirectory = resolve(rootDirectory, "dist");
const catalogPath = resolve(outputDirectory, "catalog.json");

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
    language: pack.language,
    name: pack.name,
    category: categoryParts.join("/"),
    wordCount: pack.words.length,
    path,
    sha256: createHash("sha256").update(contents).digest("hex"),
  });
}

packs.sort((left, right) => left.id.localeCompare(right.id, "en"));

const revision = createHash("sha256")
  .update(JSON.stringify(packs))
  .digest("hex");
const catalog = `${JSON.stringify(
  {
    schemaVersion: 1,
    revision,
    license: "CC-BY-4.0",
    repository: "https://github.com/hurest/vocatab-word-packs",
    packs,
  },
  null,
  2,
)}\n`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(packsDirectory, resolve(outputDirectory, "packs"), {
  recursive: true,
});
await writeFile(catalogPath, catalog);
console.log(`Built Pages artifact with ${packs.length} packs.`);

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
