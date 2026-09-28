# 직접 만든 여성형 얼굴 GLB

외부 캐릭터 자산 없이 생성한 스타일화된 얼굴입니다. `public/models/mina-face.glb`에는 `happy`와 `sad` 모프 타깃이 있습니다. 뷰어에서 기본·웃기·울기 버튼과 표정 강도 슬라이더를 조절할 수 있습니다. 이 모델은 외형 품질을 평가하기 위한 제품 자산이 아니라 모프 타깃 제어를 확인한 기술 PoC입니다.

저장소 루트에서 실행:

```sh
cd experiments/avatar-glb/custom-face
npm ci
npm run dev
```

<http://127.0.0.1:8767/>에서 확인합니다. 모델을 재생성하려면 같은 디렉터리에서 `npm run model`을 실행합니다.

- `scripts/build-model.mjs`: 얼굴 형상과 모프 타깃을 생성하는 코드
- `public/models/mina-face.glb`: 웹앱에 넣을 수 있는 모델
- `src/main.js`: Three.js로 모델을 불러와 표정 값을 조절하는 뷰어
- `neutral.png`, `happy.png`, `sad.png`: 이전 브라우저 확인 당시의 화면 기록

전신 뼈대와 춤 동작은 없습니다. `sad` 표정은 눈물 메시를 포함하지 않습니다.
