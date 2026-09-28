# 3D 아바타: GLB·VRM 조사와 PoC

2026-09-28의 Zeus 인수인계 기록을 OWO 저장소에 옮겨 정리했다. 목표는 무료 여성형 아바타에서 웃음·울음·춤과 얼굴 표정 강도를 웹에서 제어할 수 있는지 확인하는 것이다. 실행 가능한 파일은 [3D 아바타 실험](../experiments/avatar-glb/)에 보존했다.

## 직접 확인한 것

| PoC | 파일과 구현 | 브라우저에서 확인한 범위 | 남은 제약 |
| --- | --- | --- | --- |
| [직접 만든 얼굴 GLB](../experiments/avatar-glb/custom-face/) | `mina-face.glb`, Three.js 뷰어, 생성 스크립트, 기본·웃음·슬픔 화면 | `happy`·`sad` 모프 타깃 로딩, 버튼 전환, 강도 조절 | 외형은 기술 시안 수준. 전신·춤·눈물 메시 없음 |
| [VRoid 공식 샘플](../experiments/avatar-glb/vroid-sample/) | `Sendagaya_Shino.vrm`, Three.js·three-vrm 뷰어, 화면 기록 | `happy`·`sad` 표정, 눈물 오버레이, 뼈 회전으로 만든 춤 | VRM 형식이며 GLB가 아님. 눈물과 춤은 모델 내 애니메이션이 아님 |

인수인계 세션에서 두 뷰어의 기본 동작을 확인했다. 저장소에 옮긴 뒤 두 예제 모두 `npm ci`와 `npm run build`를 통과했고, 브라우저에서 모델 로딩과 표정 전환을 다시 확인했다. 직접 만든 GLB의 `happy`·`sad` 값은 버튼 전환에 따라 바뀌었고, VRoid 샘플의 `happy`·`sad` 값과 춤 상태도 전환됐다.

모델 파일 SHA-256: `mina-face.glb` = `9e1a130ccae99fcec7f3545a3c521c2641692ffaaf8c32e50ee7698306a8e1ee`, `Sendagaya_Shino.vrm` = `1e177c1a7b14f783a9c48395831db8616260d3bddd4154cb2784b779adca49b5`.

## 외부 후보

| 후보 | 출처에서 확인한 점 | 직접 확인하지 않은 점 |
| --- | --- | --- |
| [TalkingHead `mpfb.glb`](https://github.com/met4citizen/TalkingHead/tree/main/avatars) | [프로젝트 README](https://github.com/met4citizen/TalkingHead/blob/main/README.md)는 이 예제 아바타를 CC0라고 명시한다. TalkingHead에는 `setMood`와 얼굴 값 제어 API가 있다. | 이 GLB의 실제 모프 목록·외형·OWO 적합성 |
| [Jess](https://sketchfab.com/3d-models/jess-woman-head-with-blendshapes-e84c054a88de495a80b031e87d27f68e), [Kelly](https://sketchfab.com/3d-models/kelly-woman-head-with-blendshapes-938d50fda06c46109d6877c85c6ec3d2), [Shannon](https://sketchfab.com/3d-models/shannon-woman-head-with-blendshapes-cf6dbd737d7a4c10b9f341ed49818a5f) | 인수인계 당시 제작자 설명은 입·눈 블렌드셰이프와 CC BY 조건을 제시했다. | 원본 파일·실제 모프 이름·표정 품질·현재 다운로드 조건은 재확인 필요 |
| [Kenney Mini Characters](https://kenney.nl/assets/mini-characters) | 공식 페이지는 3D 캐릭터 팩, 애니메이션과 CC0를 표시한다. | 얼굴 모프·감정 표현 데이터 |

TalkingHead README는 `brunette.glb`를 **비상업용**으로 명시하므로 CC0인 `mpfb.glb`와 혼동하면 안 된다. Sketchfab 후보는 CC BY 출처 표기와 파일 확인을 거친 뒤에만 도입할 수 있다.

## 구현 판단

- GLB는 3D 모델 형식이다. `happy` 같은 감정 이름이나 춤·눈물 동작을 자동으로 제공하지 않는다.
- 얼굴은 선택한 모델의 **실제 모프 타깃 목록**을 읽고 입·눈썹·눈의 값을 조합해 제어한다.
- 춤에는 몸 뼈대와 애니메이션이 필요하다. 눈물은 별도의 메시·입자·화면 효과로 구현할 수 있다.
- [Mimic Face](https://mimicfaces.com/)는 내장 여성 얼굴 Lisa와 GLB 끌어놓기를 지원하므로, 후보의 얼굴 모프를 빠르게 살펴볼 수 있다. 춤 검증 도구는 아니다.

다음 실험은 OWO에 넣을 후보 모델 하나를 골라 모프 목록과 모바일 성능을 직접 확인하고, 필요한 반응을 값으로 저장하는 것이다. 이 조사만으로 제품 아바타를 확정하지 않는다.
