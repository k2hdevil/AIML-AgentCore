import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { applyMode, Mode } from '@cloudscape-design/global-styles';

/**
 * localStorage에 다크 모드 설정을 저장하는 키
 */
export const DARK_MODE_STORAGE_KEY = 'agentcore-dark-mode';

/**
 * localStorage에서 다크 모드 설정을 로드한다.
 * - localStorage 접근 불가 시 null 반환 (에러 무시)
 * - 저장된 값이 'dark'/'light' 이외인 경우 null 반환
 * @returns {'dark'|'light'|null}
 */
function loadModeFromStorage() {
  try {
    const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return null;
  } catch {
    // localStorage 접근 불가 시 에러 무시
    return null;
  }
}

/**
 * 시스템 기본 색상 모드를 확인한다.
 * prefers-color-scheme media query를 사용하여 시스템 다크 모드 여부를 판단한다.
 * @returns {boolean} 시스템이 다크 모드인지 여부
 */
function getSystemPrefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    // matchMedia 접근 불가 시 false 반환 (light 기본값)
    return false;
  }
}

/**
 * 초기 다크 모드 상태를 결정한다.
 * 우선순위: localStorage 값 → 시스템 prefers-color-scheme → 기본 light
 * @returns {boolean} isDarkMode 초기값
 */
function getInitialDarkMode() {
  const stored = loadModeFromStorage();
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  // localStorage에 값이 없으면 시스템 설정 참조
  return getSystemPrefersDark();
}

/**
 * 다크 모드 설정을 localStorage에 저장한다.
 * 저장 실패 시 에러를 무시한다.
 * @param {boolean} isDarkMode - 다크 모드 활성 여부
 */
function saveModeToStorage(isDarkMode) {
  try {
    localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
  } catch {
    // localStorage 저장 불가 시 에러 무시
  }
}

/**
 * Cloudscape 테마 모드를 적용한다.
 * @param {boolean} isDarkMode - 다크 모드 활성 여부
 */
function applyThemeMode(isDarkMode) {
  try {
    applyMode(isDarkMode ? Mode.Dark : Mode.Light);
  } catch {
    // applyMode 호출 실패 시 에러 무시
  }
}

const DarkModeContext = createContext(null);

/**
 * DarkModeProvider 컴포넌트
 * - 마운트 시 localStorage에서 모드를 로드하고 Cloudscape 테마를 적용한다.
 * - toggleDarkMode() 함수를 통해 모드 전환을 제공한다.
 */
export function DarkModeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  // 마운트 시 초기 테마 적용
  useEffect(() => {
    applyThemeMode(isDarkMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const next = !prev;
      saveModeToStorage(next);
      applyThemeMode(next);
      return next;
    });
  }, []);

  const value = {
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}

/**
 * useDarkMode 커스텀 Hook
 * DarkModeContext로부터 isDarkMode 상태와 toggleDarkMode 함수를 반환한다.
 * @returns {{ isDarkMode: boolean, toggleDarkMode: () => void }}
 */
export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

// 테스트를 위한 내부 함수 export
export { loadModeFromStorage, getSystemPrefersDark, getInitialDarkMode, saveModeToStorage, applyThemeMode };
export default DarkModeContext;
