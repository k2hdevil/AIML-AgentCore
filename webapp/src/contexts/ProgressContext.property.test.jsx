import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  MODULE_IDS,
  STORAGE_KEY,
  loadProgressFromStorage,
} from './ProgressContext.jsx';

/**
 * **Validates: Requirements 2.1, 2.6**
 *
 * Property 1: Progress persistence round-trip
 *
 * For any valid progress state (a mapping of module IDs to completion statuses
 * with optional ISO 8601 timestamps), serializing the state to localStorage and
 * then deserializing it via loadProgressFromStorage SHALL produce an identical
 * progress state.
 */
describe('Property 1: Progress persistence round-trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * Arbitrary generator for a single module's progress entry.
   * Generates { completed: boolean, completedAt: string|null } where
   * completedAt is an ISO 8601 timestamp when present.
   */
  const moduleProgressArb = fc.record({
    completed: fc.boolean(),
    completedAt: fc.option(
      fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).map(
        (d) => d.toISOString()
      ),
      { nil: null }
    ),
  });

  /**
   * Arbitrary generator for a full progress state object containing all 9 MODULE_IDS.
   */
  const progressStateArb = fc.tuple(
    ...MODULE_IDS.map(() => moduleProgressArb)
  ).map((entries) => {
    const state = {};
    MODULE_IDS.forEach((id, idx) => {
      state[id] = entries[idx];
    });
    return state;
  });

  it('serialize → localStorage → deserialize produces identical state (100+ iterations)', () => {
    fc.assert(
      fc.property(progressStateArb, (progressState) => {
        // Serialize and store in localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressState));

        // Deserialize via loadProgressFromStorage
        const loaded = loadProgressFromStorage();

        // Verify equality for each module
        for (const id of MODULE_IDS) {
          expect(loaded[id].completed).toBe(progressState[id].completed);
          expect(loaded[id].completedAt).toBe(progressState[id].completedAt);
        }
      }),
      { numRuns: 100 }
    );
  });
});
