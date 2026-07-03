import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProgressSummary from './ProgressSummary.jsx';

// useProgress hook 모킹
vi.mock('../contexts/ProgressContext.jsx', () => ({
  useProgress: vi.fn(),
}));

import { useProgress } from '../contexts/ProgressContext.jsx';

describe('ProgressSummary', () => {
  it('완료 수/전체 수 정보를 표시한다', () => {
    useProgress.mockReturnValue({
      completedCount: 3,
      totalCount: 9,
      percentage: 33,
    });

    render(<ProgressSummary />);
    expect(screen.getByText('3/9 완료')).toBeInTheDocument();
  });

  it('0% 진도일 때 올바르게 렌더링된다', () => {
    useProgress.mockReturnValue({
      completedCount: 0,
      totalCount: 9,
      percentage: 0,
    });

    render(<ProgressSummary />);
    expect(screen.getByText('0/9 완료')).toBeInTheDocument();
  });

  it('100% 진도일 때 올바르게 렌더링된다', () => {
    useProgress.mockReturnValue({
      completedCount: 9,
      totalCount: 9,
      percentage: 100,
    });

    render(<ProgressSummary />);
    expect(screen.getByText('9/9 완료')).toBeInTheDocument();
  });

  it('학습 진도 라벨이 표시된다', () => {
    useProgress.mockReturnValue({
      completedCount: 5,
      totalCount: 9,
      percentage: 56,
    });

    render(<ProgressSummary />);
    expect(screen.getByText('학습 진도')).toBeInTheDocument();
  });
});
