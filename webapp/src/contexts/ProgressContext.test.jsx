import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import {
  ProgressProvider,
  useProgress,
  MODULE_IDS,
  STORAGE_KEY,
  loadProgressFromStorage,
  createDefaultProgress,
} from './ProgressContext.jsx';

function wrapper({ children }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

describe('ProgressContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('초기화', () => {
    it('localStorage 비어있을 때 모든 모듈을 미완료로 초기화한다', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.completedCount).toBe(0);
      expect(result.current.totalCount).toBe(9);
      expect(result.current.percentage).toBe(0);
      for (const id of MODULE_IDS) {
        expect(result.current.progress[id]).toEqual({ completed: false, completedAt: null });
      }
    });

    it('localStorage에 저장된 데이터를 복원한다', () => {
      const stored = createDefaultProgress();
      stored['M00-CourseIntro_Summary'] = { completed: true, completedAt: '2025-01-15T09:30:00Z' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.progress['M00-CourseIntro_Summary'].completed).toBe(true);
      expect(result.current.progress['M00-CourseIntro_Summary'].completedAt).toBe('2025-01-15T09:30:00Z');
      expect(result.current.completedCount).toBe(1);
    });

    it('localStorage 파싱 실패 시 기본 상태로 초기화하고 에러 없이 동작한다', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.completedCount).toBe(0);
      expect(result.current.totalCount).toBe(9);
      expect(warnSpy).toHaveBeenCalled();
    });

    it('localStorage 접근 불가 시 기본 상태로 초기화하고 에러 없이 동작한다', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: localStorage is not available');
      });

      const progress = loadProgressFromStorage();

      expect(progress).toEqual(createDefaultProgress());
      expect(warnSpy).toHaveBeenCalled();
    });

    it('스키마 불일치 시 누락 필드를 기본값으로 보정한다', () => {
      const partial = {
        'M00-CourseIntro_Summary': { completed: true },
        'M01-Foundations_Summary': { completedAt: '2025-01-15T09:30:00Z' },
        'M02-Runtime_Summary': 'invalid',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(partial));

      const { result } = renderHook(() => useProgress(), { wrapper });

      // completed만 있고 completedAt 누락 → completedAt: null로 보정
      expect(result.current.progress['M00-CourseIntro_Summary']).toEqual({ completed: true, completedAt: null });
      // completedAt만 있고 completed 누락 → completed: false로 보정
      expect(result.current.progress['M01-Foundations_Summary']).toEqual({ completed: false, completedAt: '2025-01-15T09:30:00Z' });
      // 유효하지 않은 타입 → 기본값
      expect(result.current.progress['M02-Runtime_Summary']).toEqual({ completed: false, completedAt: null });
    });

    it('저장된 데이터가 배열인 경우 기본 상태로 초기화한다', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.completedCount).toBe(0);
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('toggleModule', () => {
    it('미완료 모듈을 완료로 토글하면 completed: true, completedAt이 ISO 타임스탬프로 설정된다', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.toggleModule('M00-CourseIntro_Summary');
      });

      expect(result.current.progress['M00-CourseIntro_Summary'].completed).toBe(true);
      expect(result.current.progress['M00-CourseIntro_Summary'].completedAt).not.toBeNull();
      // ISO 8601 형식 검증
      expect(new Date(result.current.progress['M00-CourseIntro_Summary'].completedAt).toISOString())
        .toBe(result.current.progress['M00-CourseIntro_Summary'].completedAt);
    });

    it('완료 모듈을 미완료로 토글하면 completed: false, completedAt: null로 설정된다', () => {
      const stored = createDefaultProgress();
      stored['M01-Foundations_Summary'] = { completed: true, completedAt: '2025-01-15T09:30:00Z' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.toggleModule('M01-Foundations_Summary');
      });

      expect(result.current.progress['M01-Foundations_Summary']).toEqual({ completed: false, completedAt: null });
    });

    it('토글 후 localStorage에 상태를 저장한다', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.toggleModule('M00-CourseIntro_Summary');
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(saved['M00-CourseIntro_Summary'].completed).toBe(true);
    });

    it('존재하지 않는 moduleId로 토글하면 상태가 변경되지 않는다', () => {
      const { result } = renderHook(() => useProgress(), { wrapper });

      act(() => {
        result.current.toggleModule('NON_EXISTENT_MODULE');
      });

      expect(result.current.completedCount).toBe(0);
    });
  });

  describe('계산된 값', () => {
    it('completedCount가 완료된 모듈 수를 정확히 반영한다', () => {
      const stored = createDefaultProgress();
      stored['M00-CourseIntro_Summary'] = { completed: true, completedAt: '2025-01-15T09:30:00Z' };
      stored['M01-Foundations_Summary'] = { completed: true, completedAt: '2025-01-16T10:00:00Z' };
      stored['M02-Runtime_Summary'] = { completed: true, completedAt: '2025-01-17T11:00:00Z' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.completedCount).toBe(3);
      expect(result.current.totalCount).toBe(9);
      expect(result.current.percentage).toBe(33); // Math.round(3/9*100) = 33
    });

    it('percentage가 Math.round로 올바르게 계산된다', () => {
      const stored = createDefaultProgress();
      // 1/9 = 11.11... → Math.round → 11
      stored['M00-CourseIntro_Summary'] = { completed: true, completedAt: '2025-01-15T09:30:00Z' };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

      const { result } = renderHook(() => useProgress(), { wrapper });

      expect(result.current.percentage).toBe(11);
    });
  });

  describe('useProgress outside provider', () => {
    it('ProgressProvider 외부에서 useProgress 호출 시 에러를 던진다', () => {
      expect(() => {
        renderHook(() => useProgress());
      }).toThrow('useProgress must be used within a ProgressProvider');
    });
  });
});
