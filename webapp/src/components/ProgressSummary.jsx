import React from 'react';
import ProgressBar from '@cloudscape-design/components/progress-bar';
import { useProgress } from '../contexts/ProgressContext.jsx';

/**
 * ProgressSummary 컴포넌트
 * 사이드바 상단에 전체 학습 진도를 요약 표시한다.
 * Cloudscape ProgressBar를 활용하여 완료 수/전체 수 및 백분율을 시각화한다.
 */
function ProgressSummary() {
  const { completedCount, totalCount, percentage } = useProgress();

  return (
    <div style={{ padding: '0 16px 12px' }}>
      <ProgressBar
        value={percentage}
        label="학습 진도"
        description={`${completedCount}/${totalCount} 완료`}
        variant="standalone"
        ariaLabel="학습 진도"
      />
    </div>
  );
}

export default ProgressSummary;
