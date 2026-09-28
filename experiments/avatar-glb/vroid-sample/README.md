# VRoid 공식 샘플 아바타

pixiv의 VRoid Studio 공식 샘플 **Sendagaya Shino**를 Three.js와 `@pixiv/three-vrm`으로 표시한 PoC입니다. 이 캐릭터는 이 저장소에서 새로 디자인한 모델이 아닙니다.

저장소 루트에서 실행:

```sh
cd experiments/avatar-glb/vroid-sample
npm ci
npm run dev
```

<http://127.0.0.1:8766/>에서 웃기·울기·춤추기를 선택할 수 있습니다. `window.avatarDemo.setMood('dance')`로도 상태를 바꿀 수 있습니다.

- 모델: `public/models/Sendagaya_Shino.vrm` (약 15 MB)
- 공식 [샘플 소개와 CC0 조건](https://vroid.pixiv.help/hc/en-us/articles/360013482714-Sendagaya-Shino)
- [다운로드에 사용한 파일](https://github.com/madjin/vrm-samples/blob/master/vroid/beta/Sendagaya_Shino.vrm)
- 웃음과 슬픔: 모델의 `happy`, `sad` 표현값
- 눈물: `sad` 표정과 별도의 화면 오버레이
- 춤: `happy` 표정과 웹 코드에서 만든 뼈 회전

`screenshot.png`은 이전 브라우저 확인 당시의 화면 기록입니다. VRM은 glTF 계열이지만 GLB 파일은 아닙니다.
