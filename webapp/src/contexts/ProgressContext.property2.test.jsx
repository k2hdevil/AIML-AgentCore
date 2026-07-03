import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import * as fc from 'fast-check';
import {
  ProgressProvider,
  useProgress,
  MODULE_IDS,
  STORAGE_KEY,
  createDefaultProgress,
} from './ProgressContext.jsx';

/**
 * **Validates: Requirements 2.2, 2.3**
 *
 * Property 2: Completion toggle preserves data integrity
 * - 임의의 moduleId와 초기 상태에서 toggle 1회 → completed/completedAt 검증
 * - toggle 2회 → 원래 completed 상태 복원 검증
 */

function wrapper({ children }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

describe('Property 2: Completion toggle preserves data integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggle once flips state correctly and toggle twice restores original completed state', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...MODULE_IDS),
        fc.boolean(),
        (moduleId, initialCompleted) => {
          // Set up initial state in localStorage
          localStorage.clear();
          const initialProgress = createDefaultProgress();
          if (initialCompleted) {
            initialProgress[moduleId] = {
              completed: true,
              completedAt: '2025-01-15T09:30:00.000Z',
            };
          } else {
            initialProgress[moduleId] = {
              completed: false,
              completedAt: null,
            };
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProgress));

          // Render the hook
          const { result } = renderHook(() => useProgress(), { wrapper });

          // Verify initial state loaded correctly
          expect(result.current.progress[moduleId].completed).toBe(initialCompleted);

          // Toggle once
          act(() => {
            result.current.toggleModule(moduleId);
          });

          const afterFirstToggle = result.current.progress[moduleId];

          if (initialCompleted) {
            // Was complete → should now be incomplete
            expect(afterFirstToggle.completed).toBe(false);
            expect(afterFirstToggle.completedAt).toBeNull();
          } else {
            // Was incomplete → should now be complete
            expect(afterFirstToggle.completed).toBe(true);
            expect(afterFirstToggle.completedAt).not.toBeNull();
            // Verify completedAt is a valid ISO 8601 string
            const parsed = new Date(afterFirstToggle.completedAt);
            expect(parsed.toISOString()).toBe(afterFirstToggle.completedAt);
          }

          // Toggle twice (back to original)
          act(() => {
            result.current.toggleModule(moduleId);
          });

          const afterSecondToggle = result.current.progress[moduleId];

          // completed value should match the original state
          expect(afterSecondToggle.completed).toBe(initialCompleted);

          if (initialCompleted) {
            // Restored to complete → completedAt should be a valid ISO timestamp
            expect(afterSecondToggle.completedAt).not.toBeNull();
            const parsed = new Date(afterSecondToggle.completedAt);
            expect(parsed.toISOString()).toBe(afterSecondToggle.completedAt);
          } else {
            // Restored to incomplete → completedAt should be null
            expect(afterSecondToggle.completedAt).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
