# StayFlow 배포 가이드

정적 파일(HTML/JS/CSS/SVG)만 있으면 되는 프론트엔드 목업이라 서버·DB·환경변수가 전혀 필요 없습니다.
아래 세 가지 중 하나를 고르면 됩니다. 과제 제출 목적이면 **Vercel**이 가장 빠릅니다.

## 1. Vercel (권장 · 5분)

무료 플랜으로 충분하고, `vercel.json`이 이미 들어 있어 설정할 것이 없습니다.

### 방법 A — GitHub 연결 (이후 수정할 때 push만 하면 자동 재배포)
1. 이 폴더(`stayflow-standalone`)를 GitHub 저장소로 올립니다. `node_modules`, `dist`는 `.gitignore`로 제외됩니다.
2. https://vercel.com → **Add New → Project** → 방금 올린 저장소 Import.
3. Framework Preset이 **Vite**로 자동 감지되는지 확인하고 **Deploy**. Build Command `npm run build`, Output `dist`가 자동으로 잡힙니다.
4. 1~2분 뒤 `https://<프로젝트명>.vercel.app` 주소가 나옵니다. 이 주소를 제출하면 됩니다.

### 방법 B — CLI로 바로 올리기 (GitHub 없이)
```sh
npm i -g vercel
cd stayflow-standalone
vercel            # 로그인 → 질문은 전부 기본값(Enter) → 미리보기 URL
vercel --prod     # 정식 URL로 배포
```

Node 22.13 이상이 필요한데 Vercel 기본 Node 버전이 22.x라 별도 설정이 필요 없습니다.
(Settings → General → Node.js Version에서 22.x인지만 확인)

## 2. Azure Static Web Apps (이미 Azure 구독이 있다면)

무료(Free) 플랜으로 배포할 수 있고, GitHub Actions로 빌드됩니다.
1. Azure Portal → **Static Web Apps → 만들기**. 플랜 Free, 배포 원본 GitHub 선택 후 저장소·브랜치 지정.
2. 빌드 세부 정보: Build Presets **Vite**, App location `/` (저장소 루트가 이 폴더일 때), Api location 비움, Output location `dist`.
3. 만들기를 누르면 저장소에 `.github/workflows/azure-static-web-apps-*.yml`이 자동 커밋되고 첫 배포가 돌아갑니다.
4. 주소는 `https://<임의이름>.azurestaticapps.net` 형태로 발급됩니다.

Azure 쪽 주의점: 워크플로가 Node 20을 기본으로 쓸 수 있으므로 빌드 실패 시 워크플로 yml의 빌드 step 앞에
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 22
```
를 추가하세요. 라우팅 규칙(`staticwebapp.config.json`)은 이 앱이 URL 경로를 쓰지 않으므로 필요 없습니다.

GitHub 없이 올리고 싶다면 `npm run build` 후 SWA CLI로 가능합니다.
```sh
npm i -g @azure/static-web-apps-cli
swa deploy ./dist --deployment-token <포털에서 복사한 토큰> --env production
```

## 3. 아무 정적 웹호스팅 (사내 서버, Nginx, 카페24 등)

`npm run build` 결과인 `dist/` 폴더의 **내용물**(index.html, favicon.svg, assets/, covers/)을 그대로 업로드합니다.
`base: './'`로 빌드되어 도메인 루트든 `/stayflow/` 같은 하위 폴더든 동작합니다. 하위 폴더는 마지막 `/`를 붙여 접속하세요.
`file://`로 더블클릭 실행은 되지 않으니 반드시 HTTP로 열어야 합니다.

## 제출 전 확인

```sh
npm ci
npm run typecheck   # 타입 오류 없음
npm test            # 테스트 11개 통과
npm run build       # dist/ 생성
npm run preview     # http://localhost:4173 에서 최종 확인
```

## 데이터 관련 안내

입력한 내용은 방문자 브라우저(localStorage)에만 저장되고 서버로 가지 않습니다. 배포 주소가 바뀌면 저장 공간도 분리되므로,
기존 주소에서 **데이터 내보내기**로 JSON을 받고 새 주소에서 **데이터 불러오기**로 옮기면 됩니다.
