# Contributing

## Before contributing

- Submit only work you created or have the right to publish under CC BY 4.0.
- Do not copy content from books, paid courses, dictionaries, or other services
  without permission.
- Do not include personal information, advertising, hate speech, or harmful
  content unrelated to language learning.
- Contributions are distributed under this repository's CC BY 4.0 license.

## Adding a word pack

1. Copy [`examples/word-pack.json`](examples/word-pack.json).
2. Use a lowercase kebab-case file name.
3. Save it under `packs/<source>-<target>/<category>/<file-name>.json`.
   Supported language codes are `en`, `ja`, `ko`, `fr`, and `de`. Source and
   target languages must differ.
4. Write the default `name` and optional `description` in English. Add
   translations for supported languages under `localizations` when available.
5. Use English kebab-case values for optional `tags`.
6. Run `node scripts/validate-packs.mjs`.
7. Open a Pull Request and complete its source and rights checklist.

The four baseline packs in every language direction are generated from
`scripts/generate-multilingual-packs.mjs`. Update the aligned translations and
run that script instead of editing a generated baseline file in isolation.

New category directories may be proposed in the same Pull Request. Directory
and file names may contain lowercase English letters, numbers, and hyphens.

## Updating a word pack

- Explain the reason and evidence for the change.
- Link to an authoritative source when correcting a meaning or reading.
- Keep unrelated changes in separate Pull Requests.
- Explain path or name changes because they may affect existing users.

## Pull Request review

- Automated validation must pass.
- A repository maintainer currently approves changes.
- New commits may require reviewers to check the change again.
- Reviewers may request source details, content corrections, or pack splitting.

See [Reviewing](REVIEWING.md) for the full criteria.

## License agreement

By submitting a Pull Request, you confirm that you may provide the contribution
and agree to publish word-pack data and documentation under [CC BY 4.0](LICENSE)
and code under [MIT](LICENSE-CODE).
