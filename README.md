# LearningApp-AgentCore

Amazon Bedrock AgentCore 교육 과정을 위한 인터랙티브 학습 웹 애플리케이션입니다.

## 개요

"Building Agentic AI with Amazon Bedrock AgentCore" 과정의 학습 콘텐츠를 웹 기반으로 열람할 수 있는 SPA(Single Page Application)입니다. 마크다운으로 작성된 교육 자료를 계층적 네비게이션과 함께 제공하며, AWS 콘솔 스타일의 UI를 통해 일관된 학습 경험을 전달합니다.

## 주요 기능

- **마크다운 기반 콘텐츠 렌더링** — GFM(GitHub Flavored Markdown) 지원, 코드 구문 강조, 이미지/테이블 렌더링
- **계층적 SideNavigation** — Cloudscape SideNavigation 컴포넌트 기반 모듈 목차
- **다크 모드** — 시스템 설정 감지 + 수동 토글, localStorage 영속
- **반응형 레이아웃** — 768px 기준 사이드바 drawer 자동 전환
- **D2 다이어그램 렌더링** — Kroki 서비스를 통한 D2 언어 다이어그램 시각화
- **브레드크럼 네비게이션** — 현재 위치의 계층 경로 표시
- **콘텐츠 태그** — 모듈별 기술 키워드를 카테고리 색상 Badge로 표시

## 기술 스택

| 영역 | 기술 |
|------|------|
| UI 프레임워크 | React 18 |
| 디자인 시스템 | [Cloudscape Design System](https://cloudscape.design/) |
| 빌드 도구 | Vite 6 |
| 마크다운 | react-markdown + remark-gfm + rehype-raw |
| 코드 하이라이팅 | react-syntax-highlighter |
| 테스트 | Vitest + Testing Library + fast-check (property-based) |

## 프로젝트 구조

```
LearningApp-AgentCore/
├── Contents/              # 교육 콘텐츠 원본 (마크다운 + 이미지)
├── webapp/                # 웹 애플리케이션
│   ├── public/content/    # 빌드 시 서빙되는 콘텐츠 (Contents와 동일)
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── contexts/      # Context (DarkMode, Progress)
│   │   ├── data/          # 네비게이션 트리 데이터
│   │   ├── App.jsx        # 메인 레이아웃
│   │   └── main.jsx       # 엔트리 포인트
│   ├── package.json
│   └── index.html
└── .kiro/                 # Kiro IDE 스펙 및 설정
```

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- npm 9 이상

### 설치 및 실행

```bash
# 의존성 설치
cd webapp
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 빌드

```bash
npm run build
```

빌드 결과물은 `webapp/dist/` 에 생성됩니다.

### 테스트

```bash
npm run test
```

## 학습 콘텐츠 모듈

| 모듈 | 주제 |
|------|------|
| M00 | 과정 소개 |
| M01 | Foundations (기반 개념) |
| M02 | Runtime (런타임) |
| M03 | Security and Identity (보안 및 자격 증명) |
| M04 | Tools and Gateway (도구 및 게이트웨이) |
| M05 | Memory (메모리) |
| M06 | Deployment and Observability (배포 및 관찰성) |
| M07 | New Features (신규 기능) |

## 콘텐츠 추가 방법

1. `Contents/` 디렉토리에 마크다운 파일을 추가합니다.
2. `webapp/public/content/`에 동일 파일을 복사합니다.
3. `webapp/src/data/navigationTree.js`에 항목을 추가합니다.
   ```js
   {
     id: 'M08-NewModule',
     title: '모듈 8: 새 모듈 제목',
     type: 'item',
     contentFile: 'M08-NewModule.md',
     tags: [{ label: '태그명', category: 'concept' }],
   }
   ```

## 라이선스

이 프로젝트는 내부 교육 목적으로 제작되었습니다.
