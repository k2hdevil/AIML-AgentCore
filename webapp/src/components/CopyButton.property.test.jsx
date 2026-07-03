import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import CopyButton from './CopyButton.jsx';

/**
 * **Validates: Requirements 3.2**
 *
 * Property 4: Copy preserves code content
 *
 * For any string representing code block content (including unicode,
 * special characters, newlines, etc.), invoking the copy operation SHALL
 * place that exact string (byte-for-byte) onto the system clipboard
 * without modification, truncation, or encoding changes.
 */
describe('Property 4: Copy preserves code content', () => {
  let mockWriteText;

  beforeEach(() => {
    mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  it('any string passed as text prop is written to clipboard unchanged (100+ iterations)', async () => {
    await fc.assert(
      fc.asyncProperty(fc.fullUnicodeString({ minLength: 1 }), async (text) => {
        mockWriteText.mockClear();

        const { unmount } = render(<CopyButton text={text} />);

        const button = screen.getByRole('button', { name: '코드 복사' });
        fireEvent.click(button);

        await waitFor(() => {
          expect(mockWriteText).toHaveBeenCalledTimes(1);
        });

        expect(mockWriteText).toHaveBeenCalledWith(text);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});
