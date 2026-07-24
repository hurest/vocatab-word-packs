# vocatab word packs

[vocatab](https://www.vocatab.com)에서 사용할 수 있는 일본어 → 한국어 단어팩을 함께 만들고 검토하는 공개 저장소입니다.

## 단어팩 사용

vocatab의 공개 단어팩 목록에서 원하는 팩을 바로 설치할 수 있습니다. 설치한
단어팩과 학습 설정은 사용자의 브라우저에 저장됩니다.

단어팩은 [`packs/ja/`](packs/ja/)에서 확인할 수 있습니다. 새 단어팩을 만들 때는 [`examples/word-pack.json`](examples/word-pack.json)을 참고하세요.

앱이 읽는 공개 카탈로그는 `main`에 변경이 병합된 뒤 GitHub Pages 배포
작업에서 자동으로 생성됩니다. 기여자는 카탈로그 파일을 따로 수정하지 않아도
됩니다. 로컬에서 배포 결과를 만들려면 아래 명령을 실행합니다.

```sh
node scripts/build-catalog.mjs
```

## JSON 형식

```json
{
  "language": "ja",
  "name": "여행 일본어",
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

- `language`은 현재 `ja`만 지원합니다.
- `name`과 `words`는 필수입니다.
- 각 단어의 `term`, `reading`, `meaning`은 필수입니다.
- `example`은 선택 사항입니다.
- 파일은 UTF-8 JSON이며 최대 5MB입니다.

자세한 규칙은 [JSON Schema](schema/word-pack.schema.json)와 [기여 안내](CONTRIBUTING.md)를 확인하세요.

## 기여

단어팩 추가, 오역 수정과 중복 제보를 환영합니다. 모든 변경은 Pull Request와 자동 검증을 거칩니다.

- 새 단어팩 또는 수정: [기여 안내](CONTRIBUTING.md)
- 검토 방법: [검토 안내](REVIEWING.md)
- 운영과 권한: [거버넌스](GOVERNANCE.md)
- 오류 및 권리 침해 신고: [Issue 열기](https://github.com/hurest/vocatab-word-packs/issues/new/choose)

## 라이선스

- 단어팩 데이터와 문서: [Creative Commons Attribution 4.0 International](LICENSE)
- 검증 스크립트와 workflow 코드: [MIT License](LICENSE-CODE)

단어팩을 재사용할 때는 `vocatab word packs contributors`와 이 저장소의 URL을 표시해 주세요.
