import React from 'react';
import Toggle from '@cloudscape-design/components/toggle';

/**
 * ModuleCompletionToggle - 각 모듈 콘텐츠 뷰 상단에 표시되는 학습 완료 토글
 *
 * @props
 * - moduleId: string - 모듈 식별자
 * - completed: boolean - 완료 여부
 * - onToggle: () => void - 토글 이벤트 핸들러
 */
export default function ModuleCompletionToggle({ moduleId, completed, onToggle }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <Toggle
        checked={completed}
        onChange={({ detail }) => onToggle(moduleId)}
        ariaLabel={`${moduleId} 학습 완료 표시`}
      >
        이 모듈 학습 완료
      </Toggle>
    </div>
  );
}
