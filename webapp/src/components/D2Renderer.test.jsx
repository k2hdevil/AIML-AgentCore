import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import D2Renderer from './D2Renderer';

describe('D2Renderer', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows loading state initially', () => {
    // Never resolves, so we stay in loading state
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(<D2Renderer code="x -> y" />);

    expect(screen.getByText('렌더링 중...')).toBeInTheDocument();
    expect(document.querySelector('.d2-loading')).toBeInTheDocument();
  });

  it('renders SVG content on successful fetch', async () => {
    const svgContent =
      '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"/></svg>';

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(svgContent),
    });

    render(<D2Renderer code="x -> y" />);

    await waitFor(() => {
      const container = document.querySelector('.d2-diagram-container');
      expect(container).toBeInTheDocument();
      // DOM normalizes self-closing tags, so check for the svg element
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
      expect(svg.querySelector('rect')).toBeInTheDocument();
    });
  });

  it('shows error state with original code on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    });

    const code = 'x -> y: hello';

    render(<D2Renderer code={code} />);

    await waitFor(() => {
      const errorBlock = document.querySelector('.d2-error-block');
      expect(errorBlock).toBeInTheDocument();
      expect(errorBlock).toHaveTextContent(code);
    });
  });

  it('shows error state on network failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const code = 'a -> b';

    render(<D2Renderer code={code} />);

    await waitFor(() => {
      const errorBlock = document.querySelector('.d2-error-block');
      expect(errorBlock).toBeInTheDocument();
      expect(errorBlock).toHaveTextContent(code);
    });
  });

  it('sends code directly to Kroki without language checking', async () => {
    // D2Renderer doesn't filter by language - it sends whatever code it receives.
    // Language routing (mermaid vs d2) is handled by CodeBlockWrapper.
    const mermaidCode = 'graph TD\n  A --> B';

    mockFetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<svg>mermaid-as-d2</svg>'),
    });

    render(<D2Renderer code={mermaidCode} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'https://kroki.io/d2/svg',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: mermaidCode,
        })
      );
    });

    // It renders whatever Kroki returns - no mermaid filtering at this level
    await waitFor(() => {
      const container = document.querySelector('.d2-diagram-container');
      expect(container).toBeInTheDocument();
    });
  });
});
