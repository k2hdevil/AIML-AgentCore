import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import D2Renderer from './D2Renderer.jsx';

/**
 * **Validates: Requirements 6.2**
 *
 * Property 6: D2 encoding round-trip
 *
 * For any non-empty D2 text string, the encoding function used to prepare the
 * Kroki API request SHALL produce output that, when decoded, yields the original
 * D2 text string unchanged.
 *
 * Since D2Renderer uses POST with Content-Type: text/plain and sends the body as-is,
 * this test validates that the text passed to fetch is identical to the code prop
 * (no trimming, encoding, or transformation).
 */
describe('Property 6: D2 encoding round-trip', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg></svg>'),
    });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Arbitrary generator for non-empty D2 text strings.
   * Generates strings containing printable characters, whitespace, and unicode
   * that represent plausible D2 diagram text inputs.
   */
  const nonEmptyD2TextArb = fc.string({ minLength: 1, maxLength: 200 }).filter(
    (s) => s.trim().length > 0
  );

  it('fetch body is identical to the input code string for any non-empty text (100+ iterations)', () => {
    fc.assert(
      fc.property(nonEmptyD2TextArb, (d2Text) => {
        mockFetch.mockClear();

        const { unmount } = render(<D2Renderer code={d2Text} />);

        // Verify fetch was called with the exact d2Text as body
        expect(mockFetch).toHaveBeenCalledWith(
          'https://kroki.io/d2/svg',
          expect.objectContaining({
            method: 'POST',
            body: d2Text,
          })
        );

        // Verify the body is byte-for-byte identical (no trimming or encoding)
        const actualBody = mockFetch.mock.calls[0][1].body;
        expect(actualBody).toBe(d2Text);
        expect(actualBody.length).toBe(d2Text.length);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
