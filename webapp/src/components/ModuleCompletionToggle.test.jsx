import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ModuleCompletionToggle from './ModuleCompletionToggle';

describe('ModuleCompletionToggle', () => {
  it('미완료 상태에서 토글을 렌더링한다', () => {
    const onToggle = vi.fn();
    render(
      <ModuleCompletionToggle
        moduleId="M01-Foundations_Summary"
        completed={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByText('이 모듈 학습 완료')).toBeInTheDocument();
    const toggle = screen.getByRole('checkbox');
    expect(toggle).not.toBeChecked();
  });

  it('완료 상태에서 토글이 체크된 상태로 렌더링된다', () => {
    const onToggle = vi.fn();
    render(
      <ModuleCompletionToggle
        moduleId="M01-Foundations_Summary"
        completed={true}
        onToggle={onToggle}
      />
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toBeChecked();
  });

  it('토글 클릭 시 onToggle을 moduleId와 함께 호출한다', () => {
    const onToggle = vi.fn();
    render(
      <ModuleCompletionToggle
        moduleId="M02-Runtime_Summary"
        completed={false}
        onToggle={onToggle}
      />
    );

    const toggle = screen.getByRole('checkbox');
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledWith('M02-Runtime_Summary');
  });

  it('aria-label이 모듈 ID를 포함한다', () => {
    const onToggle = vi.fn();
    render(
      <ModuleCompletionToggle
        moduleId="M03-SecurityAndIdentity_Summary"
        completed={false}
        onToggle={onToggle}
      />
    );

    const toggle = screen.getByRole('checkbox');
    expect(toggle).toHaveAttribute('aria-label', expect.stringContaining('M03-SecurityAndIdentity_Summary'));
  });
});
