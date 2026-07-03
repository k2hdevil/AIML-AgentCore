# 구현 계획: Learning App Enhancements

## 개요

React 18 + Vite 6 기반 AgentCore 학습 앱에 8개 기능 개선을 구현한다. 구현 순서는 (1) 기반 인프라(테스트 프레임워크, Context), (2) 핵심 기능(진도 추적, 코드 블록), (3) 외부 연동(D2 렌더링), (4) UI/레이아웃 개선, (5) Mermaid→D2 전환 및 mermaid 의존성 제거, (6) UI 리디자인(다크모드, TreeNavigation, 브레드크럼, 태그 뱃지, 풋터) 순으로 진행하며, 각 단계에서 기존 코드와의 통합을 점진적으로 수행한다.

## 태스크

- [x] 1. 테스트 프레임워크 설정 및 ProgressContext 구현
  - [x] 1.1 Vitest + Testing Library + fast-check 설정
    - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, `jsdom` devDependencies 추가
    - `vitest.config.js` 생성 (jsdom 환경, globals, setupFiles 설정)
    - `src/test/setup.js` 생성 (@testing-library/jest-dom import)
    - package.json에 `"test": "vitest --run"` 스크립트 추가
    - _요구사항: 전체 테스트 인프라_

  - [x] 1.2 ProgressContext 및 useProgress Hook 구현
    - `src/contexts/ProgressContext.jsx` 생성
    - `ProgressProvider` 컴포넌트 구현: localStorage에서 초기 상태 로드, `toggleModule(moduleId)` 함수 제공
    - `useProgress()` 커스텀 Hook 구현: `progress`, `toggleModule`, `completedCount`, `totalCount`, `percentage` 반환
    - localStorage 키: `agentcore-learning-progress`
    - localStorage 접근 불가/파싱 실패 시 모든 모듈을 미완료로 초기화하고 에러 없이 동작
    - 스키마 불일치 시 누락 필드 기본값 보정
    - _요구사항: 2.1, 2.2, 2.3, 2.5, 2.6, 2.8_

  - [x] 1.3 Property test: Progress persistence round-trip
    - **속성 1: 진도 영속성 왕복 검증(Progress persistence round-trip)**
    - fast-check로 임의의 progress state 생성 → serialize → localStorage mock에 저장 → deserialize → 동일성 검증
    - **검증 대상: 요구사항 2.1, 2.6**

  - [x] 1.4 Property test: Completion toggle preserves data integrity
    - **속성 2: 완료 토글 데이터 무결성 보존(Completion toggle preserves data integrity)**
    - 임의의 moduleId와 초기 상태에서 toggle 1회 → completed/completedAt 검증, toggle 2회 → 원래 completed 상태 복원 검증
    - **검증 대상: 요구사항 2.2, 2.3**

  - [x] 1.5 Property test: Progress calculation correctness
    - **속성 3: 진도 계산 정확성(Progress calculation correctness)**
    - 0~9개 임의 모듈 완료 설정 → completedCount === K, percentage === Math.round((K/N)*100) 검증
    - **검증 대상: 요구사항 2.4, 2.5**

- [x] 2. ProgressSummary 및 ModuleCompletionToggle 구현
  - [x] 2.1 ProgressSummary 컴포넌트 구현
    - `src/components/ProgressSummary.jsx` 생성
    - Cloudscape `ProgressBar` 컴포넌트를 활용하여 완료 수/전체 수 및 백분율 표시
    - `useProgress()` Hook으로 데이터 소비
    - _요구사항: 2.4, 2.5_

  - [x] 2.2 ModuleCompletionToggle 컴포넌트 구현
    - `src/components/ModuleCompletionToggle.jsx` 생성
    - Cloudscape `Toggle` 또는 `Checkbox` 컴포넌트 사용
    - props: `moduleId`, `completed`, `onToggle`
    - 각 모듈 콘텐츠 뷰 상단에 배치
    - _요구사항: 2.7_

  - [x] 2.3 App.jsx에 ProgressProvider 및 진도 UI 통합
    - App을 `ProgressProvider`로 감싸기
    - SideNavigation 상단에 `ProgressSummary` 배치
    - SideNavigation 각 항목에 완료 상태 아이콘(체크 표시) 추가
    - ContentLayout 내 `ModuleCompletionToggle` 배치
    - _요구사항: 1.3, 2.4, 2.7_

  - [x] 2.4 단위 테스트: ProgressSummary 및 ModuleCompletionToggle
    - ProgressSummary가 올바른 카운트와 퍼센트를 렌더링하는지 검증
    - ModuleCompletionToggle 클릭 시 onToggle 호출 검증
    - localStorage 손상 시 초기화 동작 검증
    - _요구사항: 2.4, 2.5, 2.7, 2.8_

- [x] 3. 체크포인트 - 진도 추적 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 문제가 발생하면 사용자에게 질문합니다.

- [x] 4. CodeBlockWrapper 및 CopyButton 구현
  - [x] 4.1 CopyButton 컴포넌트 구현
    - `src/components/CopyButton.jsx` 생성
    - `navigator.clipboard.writeText(text)` 시도, 실패 시 임시 textarea + execCommand('copy') fallback
    - 성공 시 "복사됨" 상태 2초 유지 후 원래 상태 복원
    - `aria-label="코드 복사"` 접근성 속성 적용
    - 호버/포커스 시에만 표시되는 CSS 처리
    - _요구사항: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.2 CodeBlockWrapper 컴포넌트 구현
    - `src/components/CodeBlockWrapper.jsx` 생성
    - props: `code`, `language`
    - language가 `mermaid` 또는 `d2`인 경우 → 다이어그램 렌더러에 위임 (구문 강조 미적용, 복사 버튼 미표시)
    - language가 지원 언어인 경우 → `react-syntax-highlighter` Prism + dark theme 적용
    - language가 없는 경우 → plain text 렌더링
    - 모든 비-다이어그램 코드 블록에 CopyButton 포함
    - 지원 언어: Python, JavaScript, TypeScript, JSON, YAML, Bash, HCL (최소)
    - _요구사항: 3.1, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 속성 테스트: Copy preserves code content
    - **속성 4: 복사 시 코드 내용 보존(Copy preserves code content)**
    - 임의의 문자열(유니코드 포함)을 copy 함수에 전달 → clipboard mock 내용과 동일성 검증
    - **검증 대상: 요구사항 3.2**

  - [x] 4.4 속성 테스트: Syntax highlighting tokenization
    - **속성 5: 구문 강조 토큰화(Syntax highlighting tokenization)**
    - 지원 언어 중 임의 선택 + 임의 비-공백 코드 문자열 → 하이라이터 출력에 styled span 존재 검증
    - **검증 대상: 요구사항 4.1**

  - [x] 4.5 단위 테스트: CopyButton 및 CodeBlockWrapper
    - CopyButton 클릭 후 2초 "복사됨" 상태 확인 (타이머 mock)
    - 클립보드 API 미지원 시 fallback 동작 검증
    - mermaid 언어 코드 블록이 구문 강조되지 않는 검증
    - language 미지정 시 plain text 렌더링 검증
    - _요구사항: 3.2, 3.3, 3.4, 4.4, 4.5_

- [x] 5. D2Renderer 구현
  - [x] 5.1 D2Renderer 컴포넌트 구현
    - `src/components/D2Renderer.jsx` 생성
    - Kroki API 연동: `POST https://kroki.io/d2/svg`, Content-Type: `text/plain`, body: D2 텍스트 원본
    - 로딩 상태: 스피너 또는 placeholder 표시
    - 성공 시: SVG를 Diagram_Container 내에 렌더링 (light 배경, 16px padding, 8px border-radius, 중앙 정렬, max-width 100%)
    - 에러 시: 원본 코드 블록 유지 + 좌측 4px `#e74c3c` 보더
    - timeout: 10초
    - 768px 이하 viewport에서 수평 스크롤 허용
    - _요구사항: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 5.2 속성 테스트: D2 encoding round-trip
    - **속성 6: D2 인코딩 왕복 검증(D2 encoding round-trip)**
    - 임의의 비-공백 D2 텍스트 → POST body 인코딩 → 원본 동일성 검증 (POST 방식이므로 encoding은 identity이지만 trim/whitespace 처리 검증)
    - **검증 대상: 요구사항 6.2**

  - [x] 5.3 단위 테스트: D2Renderer
    - Kroki 서비스 응답 성공 시 SVG 삽입 검증 (fetch mock)
    - Kroki 서비스 에러 시 원본 코드 블록 + 에러 보더 검증
    - mermaid 코드 블록이 D2Renderer에 의해 처리되지 않는 검증
    - _요구사항: 6.1, 6.7, 6.8_

- [x] 6. MarkdownRenderer 통합 리팩터링
  - [x] 6.1 MarkdownRenderer에 components prop 기반 코드 블록 라우팅 적용
    - ReactMarkdown의 `components={{ code }}` prop 활용
    - inline code → 기존 스타일 유지
    - block code + language=mermaid → 기존 Mermaid 렌더링 유지 (useEffect 기반 또는 컴포넌트 전환)
    - block code + language=d2 → D2Renderer로 위임
    - block code + 기타 language → CodeBlockWrapper로 위임
    - block code + language 없음 → CodeBlockWrapper (plain text 모드)로 위임
    - 기존 mermaid useEffect 후처리 로직 제거 또는 컴포넌트 기반으로 전환
    - _요구사항: 4.5, 6.8, 6.9_

  - [x] 6.2 통합 테스트: MarkdownRenderer 통합
    - mermaid 코드 블록이 기존처럼 다이어그램으로 렌더링되는 검증
    - d2 코드 블록이 D2Renderer로 위임되는 검증
    - python/js 코드 블록에 구문 강조 + 복사 버튼 표시 검증
    - _요구사항: 4.5, 6.8, 6.9_

- [x] 7. 체크포인트 - 코드 블록 및 다이어그램 기능 검증
  - 모든 테스트가 통과하는지 확인하고, 문제가 발생하면 사용자에게 질문합니다.

- [x] 8. UI 개선 및 레이아웃 안정성
  - [x] 8.1 Cloudscape 디자인 토큰 기반 스타일링 통일
    - `MarkdownRenderer.css` 및 `global.css` 개선
    - Cloudscape 디자인 토큰(spacing, typography, color) 활용하여 일관된 스타일 적용
    - 헤딩, 보더, 액센트 요소에 모던 색상 스킴 적용
    - 인터랙티브 요소 호버 시 100ms 이내 시각적 피드백 트랜지션
    - 모듈 전환 시 부드러운 콘텐츠 트랜지션 효과 추가
    - _요구사항: 1.1, 1.2, 1.5, 1.6_

  - [x] 8.2 반응형 레이아웃 및 스크롤 안정성 확보
    - Cloudscape AppLayout이 기본 제공하는 sticky 헤더/사이드바 동작 활용
    - 320px~1920px viewport 범위에서 수평 오버플로 없이 반응형 렌더링 확인
    - 768px 이하에서 사이드바 토글 가능 drawer로 동작 확인 (기존 navOpen 로직 활용)
    - Content_Area 독립 수직 스크롤, 수평 스크롤바 미발생 보장
    - 모바일에서 사이드바 drawer 열림 시 body scroll lock 방지
    - _요구사항: 1.4, 1.7, 1.8, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [x] 8.3 단위 테스트: 반응형 breakpoint 및 레이아웃
    - 768px 이하에서 사이드바가 drawer로 전환되는 검증
    - 스크롤 시 헤더/사이드바 위치 고정 검증 (scroll event 시뮬레이션)
    - _요구사항: 1.7, 5.1, 5.2_

- [x] 9. 최종 체크포인트 - 전체 기능 통합 검증
  - 모든 테스트가 통과하는지 확인하고, 문제가 발생하면 사용자에게 질문합니다.

---

## 신규 태스크 (요구사항 7 & 8)

- [x] 10. Mermaid → D2 전환 (요구사항 8)
  - [x] 10.1 M02-Runtime_Summary.md의 5개 Mermaid 다이어그램을 D2 구문으로 변환
    - `Contents/M02-Runtime_Summary.md`에서 모든 ```mermaid 코드 블록을 ```d2로 변환
    - Mermaid graph TD/LR, subgraph, stateDiagram-v2 등을 D2 동등 구문으로 변환
    - 원본 다이어그램의 논리적 구조와 관계를 동일하게 유지
    - _요구사항: 8.1, 8.2, 8.3_

  - [x] 10.2 변환된 콘텐츠를 webapp/public/content/에 복사
    - `webapp/public/content/M02-Runtime_Summary.md`에도 동일한 D2 변환 적용
    - 두 파일의 다이어그램 내용 동기화 확인
    - _요구사항: 8.3_

  - [x] 10.2a 콘텐츠 파일의 ASCII art 다이어그램을 D2로 변환
    - M00-CourseIntro_Summary.md: 타임라인 다이어그램 (1개)
    - M01-Foundations_Summary.md: 기존 AI vs 에이전틱 AI 아키텍처 비교 다이어그램 (1개)
    - M03-SecurityAndIdentity_Summary.md: 에이전트 보안 과제 맵 다이어그램 (1개)
    - M04-ToolsAndGateway_Summary.md: 도구 선택 의사결정 트리 (1개)
    - M05-Memory_Summary.md: AgentCore Memory 아키텍처 다이어그램 (1개)
    - M06-DeploymentObservability_Summary.md: 서비스 아키텍처 + 세션 구조 다이어그램 (2개)
    - M07-NewFeatures_Summary.md: Managed Harness 아키텍처 다이어그램 (1개)
    - 각 ASCII art의 논리적 구조, 노드, 관계를 동일하게 유지하는 D2 구문으로 변환
    - 기존 plain ``` 코드 펜스를 ```d2 코드 펜스로 교체
    - Contents/ 및 webapp/public/content/ 양쪽 디렉토리에 적용
    - _요구사항: 8.11, 8.12, 8.13_

  - [x] 10.2b 변환된 ASCII art D2 다이어그램을 webapp/public/content/에 동기화
    - Contents/ 디렉토리의 변환 결과를 webapp/public/content/에 복사
    - 모든 파일의 D2 다이어그램 내용 동기화 확인
    - _요구사항: 8.11, 8.13_

  - [x] 10.3 MarkdownRenderer에서 MermaidRenderer 제거
    - `MermaidRenderer` 컴포넌트 정의 삭제
    - `import mermaid from 'mermaid'` 문 삭제
    - `mermaid.initialize(...)` 호출 삭제
    - `language === 'mermaid'` 분기를 CodeBlockWrapper로 위임하도록 변경
    - _요구사항: 8.4, 8.6, 8.8, 8.9_

  - [x] 10.4 CodeBlockWrapper에서 mermaid 코드 블록 처리 업데이트
    - 기존 `if (language === 'mermaid') return null` 또는 다이어그램 위임 로직 제거
    - mermaid 언어 코드 블록을 일반 구문 강조된 코드로 렌더링
    - CodeBlockWrapper가 mermaid를 다른 언어와 동일하게 처리하도록 변경
    - _요구사항: 8.8, 8.9_

  - [x] 10.5 mermaid 패키지 의존성 제거
    - `package.json`에서 `"mermaid": "^11.4.0"` 제거
    - `npm install` 실행하여 node_modules에서 mermaid 삭제
    - _요구사항: 8.5_

  - [x] 10.6 Mermaid 관련 테스트 업데이트
    - 기존 mermaid mock 및 mermaid 렌더링 테스트 제거
    - mermaid 코드 블록이 plain code로 렌더링되는 테스트 추가
    - MarkdownRenderer 통합 테스트에서 mermaid 다이어그램 렌더링 검증 제거
    - 소스 코드에 `import mermaid` 또는 `require('mermaid')` 문이 없음을 검증하는 테스트 추가
    - _요구사항: 8.6, 8.8, 8.9_

  - [ ]* 10.7 속성 테스트: Legacy mermaid blocks render as plain code
    - **속성 11: 레거시 mermaid 블록 일반 코드 렌더링(Legacy mermaid blocks render as plain code)**
    - 임의의 코드 문자열 + language="mermaid" → MarkdownRenderer → 결과에 SVG 없음 + 원본 코드 텍스트 포함 검증
    - **검증 대상: 요구사항 8.8, 8.9**

- [x] 11. DarkModeContext 구현 (요구사항 7)
  - [x] 11.1 DarkModeContext 및 useDarkMode Hook 구현
    - `src/contexts/DarkModeContext.jsx` 생성
    - `DarkModeProvider` 컴포넌트 구현: localStorage에서 초기 모드 로드, `toggleDarkMode()` 함수 제공
    - `useDarkMode()` 커스텀 Hook 구현: `isDarkMode`, `toggleDarkMode` 반환
    - localStorage 키: `agentcore-dark-mode`, 값: `'dark'` 또는 `'light'`
    - 초기화: localStorage 값 → 없으면 `prefers-color-scheme` media query 참조 → 기본 light
    - Cloudscape `applyMode(Mode.Dark)` / `applyMode(Mode.Light)` 호출로 테마 적용
    - localStorage 접근 불가 시 light 모드 기본값, 에러 무시
    - _요구사항: 7.13, 7.14, 7.15_

  - [ ]* 11.2 속성 테스트: Dark mode persistence round-trip
    - **속성 7: 다크 모드 영속성 왕복 검증(Dark mode persistence round-trip)**
    - 임의의 모드 값("dark"/"light") → localStorage 저장 → 읽기 → 동일 모드 복원 검증
    - **검증 대상: 요구사항 7.13, 7.14, 7.15**

  - [ ]* 11.3 단위 테스트: DarkModeContext
    - DarkModeProvider 초기화 시 localStorage에서 모드 복원 검증
    - toggleDarkMode 호출 시 모드 전환 및 localStorage 저장 검증
    - 잘못된 localStorage 값('dark'/'light' 외) 시 light 기본값 검증
    - applyMode 호출 검증 (Cloudscape global-styles mock)
    - _요구사항: 7.13, 7.14, 7.15_

- [x] 12. TreeNavigation 구현 (요구사항 7)
  - [x] 12.1 NAVIGATION_TREE 데이터 구조 정의
    - `src/data/navigationTree.js` 생성
    - 계층적 NavigationNode[] 배열 정의 (시리즈 > 카테고리 > 개별 항목)
    - 각 항목에 id, title, type, contentFile, tags, isNew 속성 포함
    - 기존 PAGES 배열의 모듈 ID와 호환되도록 leaf 항목 id 유지
    - TAG_COLORS 상수 정의 (sdk: 파란, service: 주황, concept: 녹색, tool: 보라, default: 회색)
    - _요구사항: 7.2, 7.5, 7.9, 7.10_

  - [x] 12.2 TreeNavigation 컴포넌트 구현
    - `src/components/TreeNavigation.jsx` 생성
    - Cloudscape `ExpandableSection` 중첩으로 3단계 트리 구조 구현
    - props: `navigationTree`, `activeItemId`, `onItemSelect`
    - 확장/축소 상태 로컬 state 관리
    - `isNew` 항목에 Cloudscape `Badge` "NEW" 표시
    - 헤더에 "SKT - AX BootCamp" 타이틀 표시
    - `TreeNavigation.css` 스타일링
    - _요구사항: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 12.3 속성 테스트: NEW badge rendering
    - **속성 10: NEW 뱃지 렌더링(NEW badge rendering)**
    - 임의의 내비게이션 항목(isNew true/false) → 렌더링 → NEW 뱃지 존재 여부가 isNew와 일치 검증
    - **검증 대상: 요구사항 7.5**

  - [ ]* 12.4 단위 테스트: TreeNavigation
    - 3단계 중첩 렌더링 검증
    - 확장/축소 토글 동작 검증
    - 헤더 타이틀 "SKT - AX BootCamp" 표시 검증
    - NEW 뱃지 렌더링 검증
    - 768px 이하에서 drawer 전환 검증
    - _요구사항: 7.2, 7.3, 7.4, 7.5, 7.6, 7.16_

- [x] 13. TopNavigation 리디자인 (요구사항 7)
  - [x] 13.1 DarkModeToggle 컴포넌트 구현
    - `src/components/DarkModeToggle.jsx` 생성
    - props: `darkMode`, `onToggle`
    - 아이콘 기반 토글 버튼 (해/달 아이콘)
    - TopNavigation utilities 내에 배치 가능한 구조
    - _요구사항: 7.13, 7.14_

  - [x] 13.2 App.jsx TopNavigation 리디자인
    - TopNavigation을 dark 배경 스타일로 변경
    - identity에 로고 및 앱 타이틀 배치
    - utilities에 언어 선택기("한국어"), DarkModeToggle, 사용자 아바타 영역 배치
    - _요구사항: 7.1_

  - [ ]* 13.3 단위 테스트: TopNavigation 리디자인
    - Dark TopNavigation이 모든 필수 요소(로고, 아바타, 언어 선택기, 다크 모드 토글) 렌더링 검증
    - _요구사항: 7.1_

- [x] 14. BreadcrumbNav, TagBadges, AppFooter 구현 (요구사항 7)
  - [x] 14.1 BreadcrumbNav 컴포넌트 구현
    - `src/components/BreadcrumbNav.jsx` 생성
    - Cloudscape `BreadcrumbGroup` 컴포넌트 활용
    - props: `activeItemId`, `navigationTree`, `onNavigate`
    - `buildBreadcrumbPath(tree, targetId)` 함수로 계층 경로 역추적
    - 포맷: 🏠 > [카테고리] > [현재 페이지]
    - 각 세그먼트 클릭 시 해당 레벨로 내비게이션
    - _요구사항: 7.7, 7.8_

  - [ ]* 14.2 속성 테스트: Breadcrumb path computation
    - **속성 8: 브레드크럼 경로 계산(Breadcrumb path computation)**
    - 임의의 트리 항목 선택 → buildBreadcrumbPath → 경로 세그먼트가 실제 조상 경로와 일치 검증
    - **검증 대상: 요구사항 7.7**

  - [x] 14.3 TagBadges 컴포넌트 구현
    - `src/components/TagBadges.jsx` 생성
    - props: `tags` (Tag[] 배열)
    - TAG_COLORS 매핑 기반 카테고리별 색상 렌더링
    - Cloudscape `SpaceBetween` + styled `<span>` 활용
    - _요구사항: 7.9, 7.10_

  - [ ]* 14.4 속성 테스트: Tag badges correct colors
    - **속성 9: 태그 뱃지 카테고리별 정확한 색상(Tag badges render with correct category colors)**
    - 임의의 태그 배열(카테고리 포함) → 렌더링 → 각 뱃지의 색상이 TAG_COLORS 매핑과 일치 검증
    - **검증 대상: 요구사항 7.9, 7.10**

  - [x] 14.5 AppFooter 컴포넌트 구현
    - `src/components/AppFooter.jsx` 생성
    - 고정 콘텐츠: "© 2025 Kiro - Amazon Bedrock AgentCore Learning"
    - ContentLayout 하단에 배치되는 `<footer>` 엘리먼트
    - _요구사항: 7.12_

  - [ ]* 14.6 단위 테스트: BreadcrumbNav, TagBadges, AppFooter
    - BreadcrumbNav 세그먼트가 올바른 계층 경로를 표시하는지 검증
    - BreadcrumbNav 세그먼트 클릭 시 onNavigate 호출 검증
    - TagBadges가 카테고리별 올바른 색상으로 렌더링 검증
    - AppFooter 저작권 텍스트 표시 검증
    - _요구사항: 7.7, 7.8, 7.9, 7.10, 7.12_

- [x] 15. App.jsx 통합 및 최종 검증 (요구사항 7)
  - [x] 15.1 App.jsx에 새 컴포넌트 통합
    - 기존 flat SideNavigation을 TreeNavigation으로 교체
    - BreadcrumbNav를 ContentLayout 상단에 배치
    - TagBadges를 모듈 타이틀 하단에 배치 (activeItemId로부터 tags 조회)
    - AppFooter를 ContentLayout 하단에 배치
    - 기존 PAGES 배열에서 NAVIGATION_TREE로 데이터 소스 전환
    - contentFile 기반 콘텐츠 로딩 로직 업데이트
    - _요구사항: 7.2, 7.7, 7.9, 7.11, 7.12_

  - [x] 15.2 DarkModeProvider 통합
    - App 최상위에 `DarkModeProvider`로 감싸기
    - TopNavigation의 DarkModeToggle과 DarkModeContext 연결
    - 다크 모드 전환 시 Cloudscape applyMode 호출 확인
    - _요구사항: 7.13, 7.14, 7.15_

  - [ ]* 15.3 통합 테스트: 전체 통합 검증
    - 다크 모드 전환 시 applyMode 호출 및 UI 테마 변경 검증
    - 모바일(≤768px) 뷰포트에서 TreeNavigation 드로어 전환 검증
    - mermaid 의존성 제거 확인: 소스에 mermaid import 없음 검증
    - _요구사항: 7.13, 7.16_

  - [x] 15.4 최종 체크포인트 - 전체 기능 통합 검증
    - 모든 테스트가 통과하는지 확인하고, 문제가 발생하면 사용자에게 질문합니다.
    - 빌드 성공 확인 (`npm run build`)
    - mermaid 패키지가 node_modules에 없음 확인

## 참고 사항

- `*` 표시된 태스크는 선택 사항이며 빠른 MVP를 위해 건너뛸 수 있습니다
- 각 태스크는 추적성을 위해 특정 요구사항을 참조합니다
- 체크포인트는 점진적 검증을 보장합니다
- 속성 테스트(Property test)는 설계 문서의 보편적 정확성 속성을 검증합니다
- 단위 테스트는 특정 예시와 엣지 케이스를 검증합니다
- 기존 `react-syntax-highlighter` 의존성이 package.json에 이미 존재하므로 추가 설치 불필요
- Cloudscape AppLayout이 sticky 헤더/사이드바를 기본 지원하므로 추가 CSS 구현 최소화
- D2 렌더링은 외부 Kroki 서비스에 의존하므로 네트워크 에러 처리 필수
- Tasks 10-15는 요구사항 7 (UI 리디자인) 및 8 (Mermaid→D2 전환)을 구현한다
- Task 10 (Mermaid→D2 전환)은 독립적으로 진행 가능하며, Tasks 11-15 (UI 리디자인)는 DarkModeContext부터 점진적으로 통합한다
- Mermaid 제거 후 mermaid 코드 블록은 구문 강조된 plain code로 렌더링된다 (레거시 호환)

## 태스크 의존성 그래프

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "1.5", "2.1", "2.2"] },
    { "id": 3, "tasks": ["2.3"] },
    { "id": 4, "tasks": ["2.4", "4.1"] },
    { "id": 5, "tasks": ["4.2", "5.1"] },
    { "id": 6, "tasks": ["4.3", "4.4", "4.5", "5.2", "5.3"] },
    { "id": 7, "tasks": ["6.1"] },
    { "id": 8, "tasks": ["6.2", "8.1"] },
    { "id": 9, "tasks": ["8.2"] },
    { "id": 10, "tasks": ["8.3"] },
    { "id": 11, "tasks": ["10.1", "10.2a", "11.1"] },
    { "id": 12, "tasks": ["10.2", "10.2b", "10.3", "11.2", "11.3", "12.1"] },
    { "id": 13, "tasks": ["10.4", "10.5", "12.2", "13.1"] },
    { "id": 14, "tasks": ["10.6", "10.7", "12.3", "12.4", "13.2"] },
    { "id": 15, "tasks": ["13.3", "14.1"] },
    { "id": 16, "tasks": ["14.2", "14.3", "14.5"] },
    { "id": 17, "tasks": ["14.4", "14.6", "15.1"] },
    { "id": 18, "tasks": ["15.2", "15.3"] },
    { "id": 19, "tasks": ["15.4"] }
  ]
}
```
