# 우주 타일 매치 (Jelly Match: Cosmic Odyssey)

실제 천체 47종으로 하는 3-타일 매치 퍼즐 게임. React + Vite + TypeScript + Tailwind CSS.

## 배포 (Vercel)
- Framework Preset: **Vite** / Build Command: `npm run build` / Output Directory: `dist`
- 빌드할 때 `scripts/fetch-backgrounds.mjs`가 1~100레벨 배경 사진(ESA/Hubble, ESA/Webb, ESO · CC BY 4.0)을
  자동으로 받아 `public/backgrounds/`에 넣습니다. 사진을 못 받으면 그 레벨은 코드로 그린 우주 배경이 나옵니다.
- 사진 받기를 끄려면 환경변수 `SKIP_BACKGROUNDS=1`

## 배경 사진 확인
배포 주소 뒤에 `?bg-gallery` 를 붙이면 100장과 출처를 한눈에 볼 수 있습니다.
사람이 알아볼 수 있게 찍힌 사진은 상업적으로 쓸 수 없으니, 있으면 `src/data/backgrounds.ts`에서 빼 주세요.

© 2026 아이디어믹스랩. All rights reserved.
(배경 사진은 각 사진에 표시된 출처의 CC BY 4.0 이미지)
