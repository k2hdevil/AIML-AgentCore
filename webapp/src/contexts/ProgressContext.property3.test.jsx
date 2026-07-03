import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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
 * **Validates: Requirements 2.4, 2.5**
 *
 * Property 3: Progress calculation correctness
 *
 * For any set of N total modules where K modules are marked as completed (0 <= K <= N),
 * the progress tracker SHALL report completedCount equal to K and percentage equal to
 * Math.round((K / N) * 100).
 */

function wrapper({ children }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}

describe('Property 3: Progress calculation correctness', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('completedCount === K and percentage === Math.round((K/N)*100) for any K completed modules', () => {
    const N = MODULE_IDS.length; // 9

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: N }).chain((k) =>
          fc.tuple(
            fc.constant(k),
            fc.shuffledSubarray([...MODULE_IDS], { minLength: k, maxLength: k })
          )
        ),
        ([k, completedModuleIds]) => {
          // Set up localStorage with K modules completed
          const progress = createDefaultProgress();
          for (const id of completedModuleIds) {
            progress[id] = { completed: true, completedAt: new Date().toISOString() };
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

          // Render useProgress in ProgressProvider
          const { result } = renderHook(() => useProgress(), { wrapper });

          // Assert: completedCount === K
          expect(result.current.completedCount).toBe(k);

          // Assert: totalCount === 9
          expect(result.current.totalCount).toBe(N);

          // Assert: percentage === Math.round((K / N) * 100)
          const expectedPercentage = Math.round((k / N) * 100);
          expect(result.current.percentage).toBe(expectedPercentage);

          // Clean up for next iteration
          localStorage.clear();
        }
      ),
      { numRuns: 100 }
    );
  });
});
