import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressProvider, STORAGE_KEY } from '../contexts/ProgressContext.jsx';
import ProgressSummary from './ProgressSummary.jsx';

/**
 * 통합 테스트: localStorage 손상 시 ProgressProvider + ProgressSummary
 * ProgressSummary가 실제 ProgressProvider와 함께 렌더링될 때,
 * localStorage에 손상된 데이터가 있어도 정상적으로 0/9로 초기화되는지 검증한다.
 *
 * Validates: Requirements 2.4, 2.5, 2.8
 */
describe('ProgressSummary + ProgressProvider 통합 (localStorage 손상)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('localStorage에 유효하지 않은 JSON이 있을 때 0/9 완료로 렌더링된다', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json {{{');
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ProgressProvider>
        <ProgressSummary />
      </ProgressProvider>
    );

    expect(screen.getByText('0/9 완료')).toBeInTheDocument();
    expect(screen.getByText('학습 진도')).toBeInTheDocument();
  });

  it('localStorage에 배열 데이터가 있을 때 0/9 완료로 렌더링된다', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ProgressProvider>
        <ProgressSummary />
      </ProgressProvider>
    );

    expect(screen.getByText('0/9 완료')).toBeInTheDocument();
  });

  it('localStorage에 null 값 객체가 있을 때 0/9 완료로 렌더링된다', () => {
    localStorage.setItem(STORAGE_KEY, 'null');
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <ProgressProvider>
        <ProgressSummary />
      </ProgressProvider>
    );

    expect(screen.getByText('0/9 완료')).toBeInTheDocument();
  });

  it('localStorage가 비어있을 때 0/9 완료로 정상 렌더링된다', () => {
    render(
      <ProgressProvider>
        <ProgressSummary />
      </ProgressProvider>
    );

    expect(screen.getByText('0/9 완료')).toBeInTheDocument();
    expect(screen.getByText('학습 진도')).toBeInTheDocument();
  });
});
