import { useDarkMode } from '../contexts/DarkModeContext';
import './DarkModeToggle.css';

/**
 * DarkModeToggle - 다크 모드/라이트 모드 전환 토글 버튼
 * useDarkMode() hook을 직접 사용하여 props 없이 동작한다.
 * TopNavigation utilities 내에 배치되며 해/달 아이콘으로 현재 모드를 표시한다.
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      type="button"
      className="dark-mode-toggle"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
}
