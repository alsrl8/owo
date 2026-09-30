# 3D 아바타 실험

OWO에서 표정과 몸짓을 제어할 수 있는 3D 모델을 비교한 PoC입니다. 아래 두 예제는 독립 실행 뷰어이며, [OWO 메인 화면](../../index.html)의 아바타 선택기는 [`avatar-viewer/`](avatar-viewer/)의 소스를 빌드해 사용합니다. 조사 내용과 확인 범위는 [GLB 아바타 조사 노트](../../docs/avatar-glb-research.md)에 있습니다.

| 예제 | 모델 | 확인한 동작 | 실행 |
| --- | --- | --- | --- |
| [직접 만든 얼굴](custom-face/) | `mina-face.glb` | `happy`·`sad` 모프 타깃과 강도 조절 | `cd experiments/avatar-glb/custom-face && npm ci && npm run dev` → <http://127.0.0.1:8767/> |
| [VRoid 공식 샘플](vroid-sample/) | `Sendagaya_Shino.vrm` | 웃음·슬픔 표정, 화면 눈물, 코드로 만든 춤 | `cd experiments/avatar-glb/vroid-sample && npm ci && npm run dev` → <http://127.0.0.1:8766/> |

두 예제 모두 Node.js 20.19 이상 또는 22.12 이상이 필요합니다. 각 디렉터리에서 `npm run build`로 정적 빌드를 확인할 수 있습니다. 첫 번째 모델만 GLB이며, VRM 파일은 glTF 계열 바이너리지만 `.glb` 파일은 아닙니다.

OWO용 3D 번들을 다시 빌드하려면 `cd experiments/avatar-glb/avatar-viewer && npm ci && npm run build`를 실행합니다. Vite가 `assets/viewer/avatar-viewer.js`를 갱신합니다. 메인 화면의 외부 GLB는 [TalkingHead MPFB 모델](../../assets/models/README.md)입니다.
