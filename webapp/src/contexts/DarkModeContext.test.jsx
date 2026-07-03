import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, act } from '@testing-library/react';
import {
  DarkModeProvider,
  useDarkMode,
  DARK_MODE_STORAGE_KEY,
  loadModeFromStorage,
  getSystemPrefersDark,
  getInitialDarkMode,
  saveModeToStorage,
  applyThemeMode,
} from './DarkModeContext.jsx';

// @cloudscape-design/global-styles mock
vi.mock('@cloudscape-design/global-styles', () => ({
  applyMode: vi.fn(),
  Mode: { Dark: 'dark', Light: 'light' },
}));

import { applyMode, Mode } from '@cloudscape-design/global-styles';

/**
 * useDarkMode Hook 소비용 테스트 컴포넌트
 */
function TestConsumer({ onRender }) {
  const ctx = useDarkMode();
  onRender(ctx);
  return null;
}

describe('DarkModeContext', () => {
  let mockStorage;

  beforeEach(() => {
    // localStorage mock 설정
    mockStorage = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockStorage[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      mockStorage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete mockStorage[key];
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('DARK_MODE_STORAGE_KEY', () => {
    it('올바른 키 값을 가진다', () => {
      expect(DARK_MODE_STORAGE_KEY).toBe('agentcore-dark-mode');
    });
  });

  describe('loadModeFromStorage', () => {
    it('localStorage에 "dark" 저장 시 "dark" 반환', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'dark';
      expect(loadModeFromStorage()).toBe('dark');
    });

    it('localStorage에 "light" 저장 시 "light" 반환', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'light';
      expect(loadModeFromStorage()).toBe('light');
    });

    it('localStorage에 잘못된 값 저장 시 null 반환', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'invalid';
      expect(loadModeFromStorage()).toBeNull();
    });

    it('localStorage에 값이 없을 때 null 반환', () => {
      expect(loadModeFromStorage()).toBeNull();
    });

    it('localStorage 접근 실패 시 null 반환 (에러 무시)', () => {
      Storage.prototype.getItem.mockImplementation(() => {
        throw new Error('접근 불가');
      });
      expect(loadModeFromStorage()).toBeNull();
    });
  });

  describe('saveModeToStorage', () => {
    it('isDarkMode=true 시 "dark" 저장', () => {
      saveModeToStorage(true);
      expect(mockStorage[DARK_MODE_STORAGE_KEY]).toBe('dark');
    });

    it('isDarkMode=false 시 "light" 저장', () => {
      saveModeToStorage(false);
      expect(mockStorage[DARK_MODE_STORAGE_KEY]).toBe('light');
    });

    it('localStorage 저장 실패 시 에러 미발생', () => {
      Storage.prototype.setItem.mockImplementation(() => {
        throw new Error('쓰기 불가');
      });
      expect(() => saveModeToStorage(true)).not.toThrow();
    });
  });

  describe('applyThemeMode', () => {
    it('isDarkMode=true 시 applyMode(Mode.Dark) 호출', () => {
      applyThemeMode(true);
      expect(applyMode).toHaveBeenCalledWith(Mode.Dark);
    });

    it('isDarkMode=false 시 applyMode(Mode.Light) 호출', () => {
      applyThemeMode(false);
      expect(applyMode).toHaveBeenCalledWith(Mode.Light);
    });

    it('applyMode 호출 실패 시 에러 미발생', () => {
      applyMode.mockImplementation(() => {
        throw new Error('applyMode 실패');
      });
      expect(() => applyThemeMode(true)).not.toThrow();
    });
  });

  describe('getInitialDarkMode', () => {
    it('localStorage에 "dark" 저장 시 true 반환', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'dark';
      expect(getInitialDarkMode()).toBe(true);
    });

    it('localStorage에 "light" 저장 시 false 반환', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'light';
      expect(getInitialDarkMode()).toBe(false);
    });

    it('localStorage에 값 없음 + 시스템 다크 모드 시 true 반환', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({ matches: true }),
      });
      expect(getInitialDarkMode()).toBe(true);
    });

    it('localStorage에 값 없음 + 시스템 라이트 모드 시 false 반환', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({ matches: false }),
      });
      expect(getInitialDarkMode()).toBe(false);
    });
  });

  describe('DarkModeProvider + useDarkMode', () => {
    it('초기 상태가 localStorage에서 복원된다 (dark)', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'dark';
      let result;
      render(
        <DarkModeProvider>
          <TestConsumer onRender={(ctx) => { result = ctx; }} />
        </DarkModeProvider>
      );
      expect(result.isDarkMode).toBe(true);
      expect(typeof result.toggleDarkMode).toBe('function');
    });

    it('초기 상태가 localStorage에서 복원된다 (light)', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'light';
      let result;
      render(
        <DarkModeProvider>
          <TestConsumer onRender={(ctx) => { result = ctx; }} />
        </DarkModeProvider>
      );
      expect(result.isDarkMode).toBe(false);
    });

    it('toggleDarkMode 호출 시 모드 전환 및 localStorage 저장', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'light';
      let result;
      render(
        <DarkModeProvider>
          <TestConsumer onRender={(ctx) => { result = ctx; }} />
        </DarkModeProvider>
      );

      expect(result.isDarkMode).toBe(false);

      act(() => {
        result.toggleDarkMode();
      });

      expect(result.isDarkMode).toBe(true);
      expect(mockStorage[DARK_MODE_STORAGE_KEY]).toBe('dark');
      expect(applyMode).toHaveBeenCalledWith(Mode.Dark);
    });

    it('toggleDarkMode 두 번 호출 시 원래 모드로 복원', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'light';
      let result;
      render(
        <DarkModeProvider>
          <TestConsumer onRender={(ctx) => { result = ctx; }} />
        </DarkModeProvider>
      );

      act(() => {
        result.toggleDarkMode();
      });
      expect(result.isDarkMode).toBe(true);

      act(() => {
        result.toggleDarkMode();
      });
      expect(result.isDarkMode).toBe(false);
      expect(mockStorage[DARK_MODE_STORAGE_KEY]).toBe('light');
    });

    it('마운트 시 applyMode가 호출된다', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'dark';
      render(
        <DarkModeProvider>
          <div />
        </DarkModeProvider>
      );
      expect(applyMode).toHaveBeenCalledWith(Mode.Dark);
    });

    it('잘못된 localStorage 값 시 light 기본값 적용', () => {
      mockStorage[DARK_MODE_STORAGE_KEY] = 'invalid-value';
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({ matches: false }),
      });
      let result;
      render(
        <DarkModeProvider>
          <TestConsumer onRender={(ctx) => { result = ctx; }} />
        </DarkModeProvider>
      );
      expect(result.isDarkMode).toBe(false);
    });
  });

  describe('useDarkMode - Provider 없이 사용 시 에러', () => {
    it('DarkModeProvider 없이 useDarkMode 호출 시 에러 발생', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        render(<TestConsumer onRender={() => {}} />);
      }).toThrow('useDarkMode must be used within a DarkModeProvider');
      consoleSpy.mockRestore();
    });
  });
});
