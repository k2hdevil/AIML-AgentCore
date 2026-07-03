# 요구사항 문서

## 소개

Amazon Bedrock AgentCore 학습 앱의 사용자 경험 향상을 위한 기능 개선 사항을 정의한다. 현재 앱은 기본적인 Markdown 콘텐츠 뷰어로 동작하며, 이번 개선을 통해 (1) 최신 UI 트렌드를 반영한 시각적 개선, (2) 학습 진도 추적 기능 추가, (3) 코드 블록 복사 기능 추가, (4) D2 다이어그램 렌더링 지원, (5) 스크린샷 기반 UI 리디자인을 통한 모던 학습 플랫폼 경험 구현, (6) 기존 Mermaid 다이어그램 및 ASCII 아트 다이어그램의 D2 포맷 전환을 구현한다.

## 용어집

- **Learning_App**: React 18 + Vite 6 기반의 Amazon Bedrock AgentCore 학습 자료 뷰어 웹 애플리케이션
- **Module**: 학습 콘텐츠의 논리적 단위 (M00~M07 모듈 + L01 실습 가이드, 총 9개 항목)
- **Progress_Tracker**: 사용자의 학습 진도를 추적하고 시각적으로 표시하는 기능 컴포넌트
- **Code_Block**: Markdown 콘텐츠 내에 포함된 프로그래밍 코드 영역 (`<pre><code>` 요소)
- **Copy_Button**: 코드 블록 상단에 표시되어 클릭 시 해당 코드를 클립보드에 복사하는 UI 버튼
- **Sidebar**: Cloudscape SideNavigation 기반의 좌측 모듈 탐색 패널
- **Completion_Status**: 개별 모듈의 학습 완료 여부 (완료/미완료)
- **Local_Storage**: 브라우저의 localStorage API를 활용한 클라이언트 측 데이터 저장소
- **Syntax_Highlighter**: 코드 블록에 프로그래밍 언어별 구문 강조를 적용하는 기능
- **D2_Renderer**: Markdown 콘텐츠 내 ```d2 코드 블록을 감지하여 D2 다이어그램 이미지로 렌더링하는 기능 컴포넌트
- **D2_Code_Block**: Markdown 콘텐츠에서 언어 식별자가 "d2"로 지정된 코드 블록 (`<pre><code class="language-d2">` 요소)
- **Diagram_Container**: 렌더링된 다이어그램을 감싸는 UI 래퍼 요소로, 배경색, 패딩, 라운드 모서리 등 일관된 스타일을 적용한다
- **Kroki_Service**: D2 텍스트를 SVG 이미지로 변환하는 외부 렌더링 서비스 엔드포인트 (https://kroki.io)
- **Sticky_Header**: 스크롤 시에도 화면 상단에 고정되어 표시되는 TopNavigation 영역
- **Sticky_Sidebar**: 스크롤 시에도 화면 좌측에 고정되어 독립적으로 스크롤 가능한 SideNavigation 영역
- **Content_Area**: 모듈 콘텐츠가 렌더링되는 메인 영역으로, Sidebar와 독립적으로 스크롤된다
- **Viewport**: 사용자의 브라우저 화면 영역으로, 디바이스 및 브라우저 크기에 따라 달라진다
- **Dark_TopNavigation**: AWS 스타일의 어두운 배경 헤더 영역으로, 로고, 사용자 아바타, 언어 선택기, 다크모드 토글을 포함한다
- **Tree_Navigation**: 계층적 구조의 사이드바 내비게이션으로, 확장/축소 가능한 섹션과 하위 항목을 트리 형태로 표시한다
- **Breadcrumb**: 현재 페이지의 계층 경로를 표시하는 상단 내비게이션 요소 (예: 🏠 > Agent 기초 > Strands로 에이전트 만들기)
- **Tag_Badge**: 콘텐츠와 관련된 기술 키워드를 색상이 있는 라벨로 표시하는 UI 요소 (예: "Strands Agents SDK", "Amazon Bedrock")
- **Footer**: 페이지 하단에 위치하는 저작권 및 브랜딩 정보 표시 영역
- **Dark_Mode_Toggle**: 앱의 라이트 모드/다크 모드 전환을 위한 토글 버튼
- **NEW_Badge**: 새로 추가된 콘텐츠 항목에 표시되는 시각적 배지 인디케이터
- **Mermaid_Code_Block**: Markdown 콘텐츠에서 언어 식별자가 "mermaid"로 지정된 코드 블록
- **Mermaid_Renderer**: Mermaid 코드를 SVG 다이어그램으로 변환하는 기존 렌더링 컴포넌트 (제거 대상)
- **ASCII_Art_Diagram**: 언어 식별자 없는 코드 블록 내에 Unicode 박스 드로잉 문자(┌, ─, │, └, ├, →)로 아키텍처, 흐름, 구조적 관계를 표현한 텍스트 기반 다이어그램

## 요구사항

### 요구사항 1: 최신 트렌드 반영 UI 개선

**사용자 스토리:** 나는 학습자로서, 깔끔하고 최신 디자인 트렌드가 반영된 UI를 사용하고 싶다. 그래서 학습 콘텐츠에 더 집중할 수 있고 시각적 피로감이 줄어든다.

#### 인수 조건

1. THE Learning_App SHALL Cloudscape Design System 토큰을 사용하여 인터페이스 전체에 일관된 간격과 타이포그래피를 적용한다
2. THE Learning_App SHALL 모듈 간 탐색 시 부드러운 전환 효과를 표시한다
3. THE Sidebar SHALL 각 모듈 옆에 Completion_Status를 나타내는 시각적 인디케이터를 표시한다
4. THE Learning_App SHALL 320px~1920px 너비의 뷰포트에서 수평 오버플로나 콘텐츠 잘림 없이 반응형으로 렌더링한다
5. THE Learning_App SHALL 제목, 테두리, 강조 요소에 Cloudscape 디자인 토큰과 조화를 이루는 모던 색상 스킴을 적용한다
6. WHEN 사용자가 인터랙티브 요소 위에 마우스를 올리면, THE Learning_App SHALL 100ms 이내에 미묘한 시각적 피드백을 표시한다
7. WHILE Viewport 너비가 768px 이하인 경우, THE Learning_App SHALL Sidebar를 토글 가능한 드로어로 축소하여 Content_Area 공간을 최대화한다
8. WHILE Viewport 너비가 768px를 초과하는 경우, THE Sidebar SHALL Content_Area와 겹침 없이 함께 표시된다

### 요구사항 2: 학습 진도 추적

**사용자 스토리:** 나는 학습자로서, 각 모듈의 학습 완료 여부를 추적하고 전체 진도를 확인하고 싶다. 그래서 어디까지 학습했는지 한눈에 파악하고 남은 학습량을 관리할 수 있다.

#### 인수 조건

1. THE Progress_Tracker SHALL Completion_Status 데이터를 Local_Storage에 영속한다
2. WHEN 사용자가 Module을 완료로 표시하면, THE Progress_Tracker SHALL Completion_Status를 완료로 업데이트하고 타임스탬프를 저장한다
3. WHEN 사용자가 완료된 Module을 미완료로 표시하면, THE Progress_Tracker SHALL Completion_Status를 미완료로 되돌린다
4. THE Sidebar SHALL 전체 모듈 수 대비 완료된 모듈 수를 보여주는 진도 요약을 표시한다
5. THE Progress_Tracker SHALL (완료 모듈 수 / 전체 모듈 수) × 100으로 계산된 전체 진도 백분율을 표시한다
6. WHEN Learning_App이 로드되면, THE Progress_Tracker SHALL Local_Storage에서 이전에 저장된 Completion_Status를 복원한다
7. THE Learning_App SHALL 각 모듈 뷰 내에 해당 모듈을 완료로 표시할 수 있는 토글 또는 체크박스를 제공한다
8. IF Local_Storage를 사용할 수 없거나 손상된 경우, THEN THE Progress_Tracker SHALL 모든 모듈을 미완료로 초기화하고 에러 없이 동작을 계속한다

### 요구사항 3: 코드 블록 복사 기능

**사용자 스토리:** 나는 학습자로서, 코드 블록의 내용을 한 번의 클릭으로 클립보드에 복사하고 싶다. 그래서 실습 시 코드를 빠르게 재사용할 수 있다.

#### 인수 조건

1. THE Learning_App SHALL 각 Code_Block의 우측 상단에 Copy_Button을 표시한다
2. WHEN 사용자가 Copy_Button을 클릭하면, THE Learning_App SHALL 해당 Code_Block의 전체 텍스트 내용을 시스템 클립보드에 복사한다
3. WHEN 복사 작업이 성공하면, THE Copy_Button SHALL "복사됨" 확인 상태를 2초간 표시한 후 기본 상태로 복원한다
4. IF 클립보드 API를 사용할 수 없는 경우, THEN THE Learning_App SHALL 레거시 텍스트 선택 복사 방식으로 폴백한다
5. THE Copy_Button SHALL 사용자가 Code_Block 위에 마우스를 올리거나 포커스할 때에만 표시된다
6. THE Copy_Button SHALL 키보드로 접근 가능하며 "코드 복사" aria-label을 갖는다

### 요구사항 4: 코드 구문 강조

**사용자 스토리:** 나는 학습자로서, 코드 블록에 프로그래밍 언어별 구문 강조가 적용되기를 원한다. 그래서 코드의 구조를 쉽게 파악하고 학습 효율을 높일 수 있다.

#### 인수 조건

1. WHEN Code_Block에 언어 식별자가 지정된 경우, THE Syntax_Highlighter SHALL 언어별 색상 코딩을 코드 내용에 적용한다
2. THE Syntax_Highlighter SHALL 최소한 Python, JavaScript, TypeScript, JSON, YAML, Bash, HCL 언어를 지원한다
3. THE Syntax_Highlighter SHALL 기존 Code_Block 배경 색상 스킴과 일관된 다크 테마를 사용한다
4. WHEN Code_Block에 언어 식별자가 지정되지 않은 경우, THE Syntax_Highlighter SHALL 구문 강조 없이 코드를 일반 텍스트로 렌더링한다
5. THE Syntax_Highlighter SHALL "mermaid" 언어 식별자가 있는 코드 블록의 Mermaid 다이어그램 렌더링을 방해하지 않는다

### 요구사항 5: 스크롤 시 레이아웃 안정성

**사용자 스토리:** 나는 학습자로서, 콘텐츠를 스크롤할 때 헤더와 사이드바가 안정적으로 유지되기를 원한다. 그래서 긴 문서를 읽을 때도 네비게이션을 바로 사용할 수 있고 레이아웃이 깨지지 않는다.

#### 인수 조건

1. THE Sticky_Header SHALL 사용자가 Content_Area를 스크롤하는 동안 Viewport 상단에 고정된다
2. THE Sticky_Sidebar SHALL 위치가 고정되며 Content_Area와 독립적으로 스크롤된다
3. WHILE 사용자가 Content_Area를 스크롤하는 동안, THE Sidebar SHALL 이동, 겹침 또는 레이아웃에서 분리되지 않는다
4. WHILE 사용자가 Content_Area를 스크롤하는 동안, THE Sticky_Header SHALL 깜빡임, 크기 변경 또는 리플로우가 발생하지 않는다
5. THE Content_Area SHALL Viewport에 수평 스크롤바가 나타나지 않도록 수직으로 스크롤된다
6. WHEN Content_Area에 Viewport보다 높은 콘텐츠가 있는 경우, THE Learning_App SHALL 레이아웃 끊김이나 리페인트 아티팩트 없이 부드러운 수직 스크롤을 허용한다
7. WHILE Viewport 너비가 768px 이하인 경우, THE Content_Area SHALL Viewport 전체 너비를 차지하며 Sidebar에 의해 차단되지 않고 독립적으로 스크롤된다
8. THE Learning_App SHALL 모바일 뷰포트에서 Sidebar 드로어가 열려 있을 때 body 레벨 스크롤 잠금을 방지한다

### 요구사항 6: D2 다이어그램 렌더링

**사용자 스토리:** 나는 학습자로서, Markdown 콘텐츠 내 D2 코드 블록이 시각적 다이어그램으로 렌더링되기를 원한다. 그래서 텍스트 기반 다이어그램 코드 대신 직관적인 시각 자료로 학습 내용을 이해할 수 있다.

#### 인수 조건

1. WHEN Markdown 콘텐츠에서 D2_Code_Block이 감지되면, THE D2_Renderer SHALL D2 텍스트를 렌더링된 다이어그램 이미지(SVG 형식)로 변환한다
2. THE D2_Renderer SHALL D2 텍스트를 인코딩하여 Kroki_Service에 렌더링을 요청한다
3. THE Diagram_Container SHALL 렌더링된 D2 다이어그램을 밝은 배경색, 16px 패딩, 8px 보더 반경으로 감싸며 기존 Mermaid 다이어그램 스타일과 일관되게 한다
4. THE Diagram_Container SHALL 렌더링된 다이어그램을 Content_Area 내에서 수평 중앙 정렬한다
5. THE Diagram_Container SHALL 최대 너비 100%를 적용하고 수평 오버플로를 방지하기 위해 다이어그램을 비율에 맞게 축소한다
6. WHILE Viewport 너비가 768px 이하인 경우, THE Diagram_Container SHALL 사용 가능한 너비를 초과하는 다이어그램에 대해 수평 스크롤을 허용한다
7. IF Kroki_Service에 접근할 수 없거나 에러를 반환하는 경우, THEN THE D2_Renderer SHALL 원본 코드 블록을 유지하고 에러 색상의 4px 좌측 보더를 표시한다
8. THE D2_Renderer SHALL "mermaid" 언어 식별자가 있는 코드 블록의 기존 Mermaid 다이어그램 렌더링을 방해하지 않는다
9. THE Syntax_Highlighter SHALL 대기 중이거나 다이어그램 렌더링이 완료된 D2_Code_Block 요소에 구문 강조를 적용하지 않는다

### 요구사항 7: UI 리디자인 (모던 학습 플랫폼)

**사용자 스토리:** 나는 학습자로서, 모던 학습 플랫폼 스타일의 재설계된 UI를 사용하고 싶다. 그래서 계층적 콘텐츠 구조를 직관적으로 탐색하고 전문적인 학습 환경에서 몰입할 수 있다.

#### 인수 조건

1. THE Dark_TopNavigation SHALL 어두운 배경색으로 렌더링하며 애플리케이션 로고, 사용자 아바타 영역, 언어 선택기("한국어"), Dark_Mode_Toggle을 단일 수평 행에 표시한다
2. THE Tree_Navigation SHALL 평면 SideNavigation 목록을 최소 3단계 중첩을 지원하는 계층적 트리 구조로 대체한다 (시리즈 > 카테고리 > 개별 항목)
3. WHEN 사용자가 Tree_Navigation 섹션의 확장 화살표를 클릭하면, THE Learning_App SHALL 해당 섹션을 확장하여 부드러운 애니메이션과 함께 하위 항목을 표시한다
4. WHEN 사용자가 확장된 Tree_Navigation 섹션의 축소 화살표를 클릭하면, THE Learning_App SHALL 해당 섹션을 축소하여 하위 항목을 숨긴다
5. THE Tree_Navigation SHALL 최근 추가된 콘텐츠 항목 옆에 NEW_Badge를 표시한다
6. THE Tree_Navigation 헤더 SHALL "SKT - AX BootCamp" 타이틀과 축소 버튼 및 "Welcome" 링크를 표시한다
7. THE Breadcrumb SHALL Dark_TopNavigation 아래에 "🏠 > [카테고리] > [현재 페이지]" 형식으로 현재 페이지의 계층 경로를 표시한다
8. WHEN 사용자가 Breadcrumb 세그먼트를 클릭하면, THE Learning_App SHALL 해당 페이지 또는 섹션으로 내비게이션한다
9. THE Content_Area SHALL 모듈 제목과 부제목 설명 및 관련 기술 키워드를 보여주는 Tag_Badge 요소를 표시한다
10. THE Tag_Badge 요소 SHALL 카테고리별 구분된 배경색으로 색상 라벨로 렌더링된다 (예: SDK는 파란색, 서비스는 주황색)
11. THE Content_Area SHALL 각 모듈 상단에 명확히 구분된 "학습 목표"와 "핵심 개념" 섹션으로 렌더링된 콘텐츠를 구성한다
12. THE Footer SHALL Content_Area 하단에 Kiro 브랜딩이 포함된 저작권 공지를 표시한다
13. WHEN Dark_Mode_Toggle이 활성화되면, THE Learning_App SHALL 전체 인터페이스를 다크 색상 스킴으로 전환하고 설정을 Local_Storage에 영속한다
14. WHEN Dark_Mode_Toggle이 비활성화되면, THE Learning_App SHALL 인터페이스를 라이트 색상 스킴으로 되돌린다
15. THE Learning_App SHALL 로드 시 Local_Storage에서 이전에 저장된 다크 모드 설정을 복원한다
16. WHILE Viewport 너비가 768px 이하인 경우, THE Tree_Navigation SHALL 햄버거 메뉴 트리거가 있는 토글 가능한 드로어로 축소된다
17. WHILE Viewport 너비가 768px를 초과하는 경우, THE Tree_Navigation SHALL Content_Area와 함께 확장된 상태로 유지된다

### 요구사항 8: Mermaid 및 ASCII 아트 다이어그램을 D2로 전환

**사용자 스토리:** 나는 개발자로서, 기존 Mermaid 다이어그램과 ASCII 아트 다이어그램을 모두 D2 포맷으로 전환하고 Mermaid 의존성을 제거하고 싶다. 그래서 단일 다이어그램 렌더링 엔진(Kroki + D2)으로 통일하여 번들 크기를 줄이고 유지보수를 간소화하며 모든 다이어그램을 시각적으로 렌더링할 수 있다.

#### 인수 조건

1. THE Learning_App SHALL M02-Runtime_Summary.md의 5개 Mermaid_Code_Block 인스턴스를 동등한 D2_Code_Block 구문으로 변환한다
2. WHEN 변환된 D2_Code_Block이 렌더링되면, THE D2_Renderer SHALL 원본 Mermaid 다이어그램과 동일한 논리적 구조와 관계를 보존하는 다이어그램을 생성한다
3. THE Learning_App SHALL 콘텐츠 파일(Contents/ 및 webapp/public/content/ 디렉토리)의 모든 ```mermaid 코드 펜스 식별자를 ```d2 식별자로 교체한다
4. THE Learning_App SHALL MarkdownRenderer.jsx에서 Mermaid_Renderer 컴포넌트를 제거한다
5. THE Learning_App SHALL package.json에서 mermaid 패키지 의존성을 제거한다
6. THE MarkdownRenderer SHALL 변환 후 mermaid 라이브러리에 대한 import 문이나 참조를 포함하지 않는다
7. WHEN D2_Code_Block이 감지되면, THE MarkdownRenderer SHALL 렌더링을 위해 D2_Renderer 컴포넌트로 라우팅한다
8. THE MarkdownRenderer SHALL "mermaid" 언어 식별자를 가진 코드 블록을 다이어그램으로 렌더링하지 않는다 (모두 변환되었으므로)
9. IF 변환 후 레거시 ```mermaid 코드 블록이 존재하는 경우, THEN THE MarkdownRenderer SHALL 구문 강조가 적용된 일반 코드 블록으로 렌더링한다
10. THE Syntax_Highlighter SHALL D2_Renderer가 처리하는 D2_Code_Block 요소에 구문 강조를 적용하지 않는다
11. THE Learning_App SHALL 콘텐츠 파일(Contents/ 및 webapp/public/content/ 디렉토리)의 모든 ASCII_Art_Diagram 인스턴스를 동등한 D2_Code_Block 구문으로 변환한다
12. WHEN 변환된 ASCII_Art_Diagram이 D2_Code_Block으로 렌더링되면, THE D2_Renderer SHALL 원본 ASCII 아트와 동일한 논리적 구조, 노드 및 관계를 보존하는 다이어그램을 생성한다
13. THE Learning_App SHALL ASCII_Art_Diagram 콘텐츠를 포함하는 모든 일반 ``` 코드 펜스를 콘텐츠 파일에서 ```d2 코드 펜스로 교체한다
