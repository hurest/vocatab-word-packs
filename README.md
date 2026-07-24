# vocatab word packs

A public repository for creating and reviewing community word packs used by
[vocatab](https://www.vocatab.com).

## Using word packs

Install a pack from vocatab's public word-pack list. Installed packs and study
settings stay in the user's browser.

Approved packs are organized by language direction under [`packs/`](packs/).
For example, `packs/ko-ja/` contains packs for Korean speakers learning
Japanese. Start with [`examples/word-pack.json`](examples/word-pack.json) when
creating a pack.

The public catalog is generated and deployed to GitHub Pages after changes are
merged into `main`. The root `catalog.json` indexes language directions, while
each direction has its own catalog, such as `catalogs/ko-ja/catalog.json`.
Contributors do not edit these files directly. To build them locally, run:

```sh
node scripts/build-catalog.mjs
```

## JSON format

```json
{
  "sourceLanguage": "ko",
  "targetLanguage": "ja",
  "name": "Japanese Greetings",
  "description": "Everyday Japanese greetings for first-time learners.",
  "thumbnailUrl": "https://example.com/images/japanese-greetings.webp",
  "tags": ["basics", "greetings"],
  "localizations": {
    "ko": {
      "name": "일본어 인사말",
      "description": "처음 배우는 사람을 위한 일상 일본어 인사말 모음입니다."
    },
    "ja": {
      "name": "日本語のあいさつ",
      "description": "初めて学ぶ人のための日常的な日本語のあいさつ集です。"
    }
  },
  "words": [
    {
      "term": "こんにちは",
      "reading": "こんにちは",
      "meaning": "안녕하세요",
      "example": "こんにちは、はじめまして。"
    }
  ]
}
```

- `sourceLanguage` is the language the learner already understands.
- `targetLanguage` is the language being learned.
- `name` is required and uses English as the default language.
- `description`, `thumbnailUrl`, `tags`, and `localizations` are optional.
- `thumbnailUrl`, when present, must be an HTTPS URL.
- Tags are unique English kebab-case identifiers such as `daily-life`.
- Korean and Japanese names and descriptions can be added under
  `localizations.ko` and `localizations.ja`.
- Every word requires `term`, `reading`, and `meaning`; `example` is optional.
- Files must be UTF-8 JSON and no larger than 5MB.

See the [JSON Schema](schema/word-pack.schema.json) and
[contribution guide](CONTRIBUTING.md) for the complete rules.

## Contributing

Word-pack additions, translation fixes, and duplicate reports are welcome. All
changes go through a Pull Request and automated validation.

- Add or update a pack: [Contributing](CONTRIBUTING.md)
- Review a change: [Reviewing](REVIEWING.md)
- Roles and permissions: [Governance](GOVERNANCE.md)
- Report errors or rights concerns:
  [Open an issue](https://github.com/hurest/vocatab-word-packs/issues/new/choose)

## License

- Word-pack data and documentation:
  [Creative Commons Attribution 4.0 International](LICENSE)
- Validation scripts and workflow code: [MIT License](LICENSE-CODE)

When reusing a word pack, credit `vocatab word packs contributors` and link to
this repository.
