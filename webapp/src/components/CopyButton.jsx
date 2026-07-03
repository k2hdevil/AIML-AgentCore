import { useState, useCallback } from 'react';
import './CopyButton.css';

/**
 * CopyButton - 코드 블록 우상단에 표시되는 복사 버튼
 * @param {{ text: string }} props
 * - text: 복사할 텍스트 내용
 */
export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: 임시 textarea를 이용한 execCommand('copy')
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [text]);

  return (
    <button
      type="button"
      className={`copy-button${copied ? ' copy-button--copied' : ''}`}
      onClick={handleCopy}
      aria-label="코드 복사"
    >
      {copied ? '✓ 복사됨' : '📋 복사'}
    </button>
  );
}
