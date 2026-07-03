import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * 모듈 ID 목록 (App.jsx PAGES 배열과 동기화)
 */
const MODULE_IDS = [
  'M00-CourseIntro_Summary',
  'M01-Foundations_Summary',
  'M02-Runtime_Summary',
  'M03-SecurityAndIdentity_Summary',
  'M04-ToolsAndGateway_Summary',
  'M05-Memory_Summary',
  'M06-DeploymentObservability_Summary',
  'M07-NewFeatures_Summary',
  'L01-AgentCore_Lab',
];

const STORAGE_KEY = 'agentcore-learning-progress';

/**
 * 모든 모듈을 미완료 상태로 초기화한 기본 상태를 생성한다.
 * @returns {Record<string, {completed: boolean, completedAt: string|null}>}
 */
function createDefaultProgress() {
  const progress = {};
  for (const id of MODULE_IDS) {
    progress[id] = { completed: false, completedAt: null };
  }
  return progress;
}

/**
 * localStorage에서 저장된 진도 데이터를 로드한다.
 * - localStorage 접근 불가 시 기본 상태 반환 (console.warn)
 * - JSON 파싱 실패 시 기본 상태 반환 (console.warn)
 * - 스키마 불일치(누락 필드) 시 기본값으로 보정
 */
function loadProgressFromStorage() {
  const defaultProgress = createDefaultProgress();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return defaultProgress;
    }

    const parsed = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      console.warn('[ProgressContext] localStorage 데이터가 유효한 객체가 아닙니다. 초기 상태로 리셋합니다.');
      return defaultProgress;
    }

    // 각 모듈에 대해 스키마 보정 수행
    const result = {};
    for (const id of MODULE_IDS) {
      const stored = parsed[id];
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
        result[id] = {
          completed: typeof stored.completed === 'boolean' ? stored.completed : false,
          completedAt: typeof stored.completedAt === 'string' ? stored.completedAt : null,
        };
      } else {
        result[id] = { completed: false, completedAt: null };
      }
    }

    return result;
  } catch (error) {
    console.warn('[ProgressContext] localStorage 접근/파싱 실패. 초기 상태로 시작합니다.', error);
    return defaultProgress;
  }
}

/**
 * 진도 상태를 localStorage에 저장한다.
 * 저장 실패 시 console.warn만 출력하고 에러를 던지지 않는다.
 */
function saveProgressToStorage(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('[ProgressContext] localStorage 저장 실패.', error);
  }
}

const ProgressContext = createContext(null);

/**
 * ProgressProvider 컴포넌트
 * - localStorage에서 초기 상태 로드
 * - toggleModule(moduleId) 함수 제공
 */
export function ProgressProvider({ children }) {
  const [progress, setProgress] = useState(loadProgressFromStorage);

  const toggleModule = useCallback((moduleId) => {
    setProgress((prev) => {
      const current = prev[moduleId];
      if (!current) return prev;

      const updated = { ...prev };
      if (current.completed) {
        updated[moduleId] = { completed: false, completedAt: null };
      } else {
        updated[moduleId] = { completed: true, completedAt: new Date().toISOString() };
      }

      saveProgressToStorage(updated);
      return updated;
    });
  }, []);

  const completedCount = Object.values(progress).filter((m) => m.completed).length;
  const totalCount = MODULE_IDS.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const value = {
    progress,
    toggleModule,
    completedCount,
    totalCount,
    percentage,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

/**
 * useProgress 커스텀 Hook
 * @returns {{ progress, toggleModule, completedCount, totalCount, percentage }}
 */
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}

export { MODULE_IDS, STORAGE_KEY, createDefaultProgress, loadProgressFromStorage, saveProgressToStorage };
export default ProgressContext;
