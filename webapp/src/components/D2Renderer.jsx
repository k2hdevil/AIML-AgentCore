import { useState, useEffect } from 'react';
import './D2Renderer.css';

/**
 * D2Renderer - D2 다이어그램을 Kroki 서비스를 통해 SVG로 렌더링한다.
 * 클릭 시 모달로 확대 표시한다.
 *
 * @param {{ code: string }} props
 * @param {string} props.code - D2 다이어그램 소스 텍스트
 */
export default function D2Renderer({ code }) {
  const [renderState, setRenderState] = useState('loading');
  const [svg, setSvg] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    setRenderState('loading');
    setSvg(null);

    fetch('https://kroki.io/d2/svg', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: code,
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((svgText) => {
        // SVG의 viewBox 패딩을 줄여 다이어그램이 공간을 최대한 차지하도록 한다
        const trimmedSvg = svgText
          .replace(/width="[^"]*"/, 'width="100%"')
          .replace(/height="[^"]*"/, 'height="auto"');
        setRenderState('success');
        setSvg(trimmedSvg);
      })
      .catch(() => {
        setRenderState('error');
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [code]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!expanded) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expanded]);

  if (renderState === 'loading') {
    return <div className="d2-loading">렌더링 중...</div>;
  }

  if (renderState === 'success' && svg) {
    return (
      <>
        {/* 인라인 다이어그램 (클릭하면 확대) */}
        <div
          className="d2-diagram-container d2-clickable"
          onClick={() => setExpanded(true)}
          title="클릭하여 확대"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setExpanded(true); }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/* 확대 모달 오버레이 */}
        {expanded && (
          <div className="d2-modal-overlay" onClick={() => setExpanded(false)}>
            <div
              className="d2-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="d2-modal-close"
                onClick={() => setExpanded(false)}
                aria-label="닫기"
              >
                ✕
              </button>
              <div
                className="d2-modal-svg"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // 에러 상태: 원본 코드 블록 표시
  return (
    <pre className="d2-error-block">
      <code>{code}</code>
    </pre>
  );
}
