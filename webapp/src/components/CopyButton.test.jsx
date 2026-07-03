import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CopyButton from './CopyButton';

describe('CopyButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('"복사" 텍스트와 aria-label="코드 복사"로 렌더링된다', () => {
    render(<CopyButton text="hello" />);

    const button = screen.getByRole('button', { name: '코드 복사' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', '코드 복사');
    expect(button).toHaveTextContent('복사');
  });

  it('클릭 후 "복사됨" 상태 표시 → 2초 후 "복사"로 복귀', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    render(<CopyButton text="sample code" />);

    const button = screen.getByRole('button', { name: '코드 복사' });

    await act(async () => {
      fireEvent.click(button);
    });

    // "복사됨" 상태가 표시되어야 함
    expect(button).toHaveTextContent('복사됨');

    // 2초 후 원래 상태로 복귀
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).toHaveTextContent('복사');
    expect(button).not.toHaveTextContent('복사됨');
  });

  it('navigator.clipboard.writeText 실패 시 fallback(execCommand)으로 "복사됨" 상태 표시', async () => {
    // clipboard API가 에러를 던지도록 설정
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Not allowed')) },
    });

    // jsdom에는 execCommand가 없으므로 직접 정의
    document.execCommand = vi.fn().mockReturnValue(true);

    render(<CopyButton text="fallback code" />);

    const button = screen.getByRole('button', { name: '코드 복사' });

    await act(async () => {
      fireEvent.click(button);
    });

    // execCommand fallback이 호출되었는지 확인
    expect(document.execCommand).toHaveBeenCalledWith('copy');

    // fallback 후에도 "복사됨" 상태가 표시되어야 함
    expect(button).toHaveTextContent('복사됨');
  });

  it('복사 버튼에 aria-label="코드 복사"가 설정되어 있다', () => {
    render(<CopyButton text="accessibility test" />);

    const button = screen.getByRole('button', { name: '코드 복사' });
    expect(button).toHaveAttribute('aria-label', '코드 복사');
  });
});
