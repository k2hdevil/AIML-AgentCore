import './AppFooter.css';

/**
 * AppFooter - 페이지 하단 저작권 및 브랜딩 정보 표시 영역
 * ContentLayout 하단에 배치되는 footer 엘리먼트
 */
export default function AppFooter() {
  return (
    <footer className="app-footer">
      <p className="app-footer-text">
        &copy; 2025 콘텐츠로 활용 가능하도록 AWS T&amp;C 공식 교육 자료가 아닙니다.
        감사가 🤖 Kiro 를 활용하여 빌드 제작하였습니다. 일부 오류가 있을 수 있습니다.
      </p>
    </footer>
  );
}
