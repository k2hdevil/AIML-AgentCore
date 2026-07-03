import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';

/**
 * 태그 카테고리 → Cloudscape Badge 색상 매핑
 * Badge는 표준 색상(blue/green/red/grey 등)만 지원하며,
 * 다크/라이트 모드에서 대비가 자동 조정된다.
 */
const CATEGORY_BADGE_COLORS = {
  sdk: 'blue',       // SDK/개발
  service: 'green',  // AWS 서비스
  concept: 'red',    // 핵심 개념
  tool: 'grey',      // 도구/실습
  default: 'grey',   // 기타
};

/**
 * TagBadges - 콘텐츠 관련 기술 키워드를 Cloudscape Badge로 표시하는 컴포넌트
 * 카테고리에 따라 표준 Badge 색상을 적용한다.
 *
 * @param {Object} props
 * @param {Array<{label: string, category: string}>} props.tags - 태그 배열
 */
export default function TagBadges({ tags }) {
  // 태그가 없거나 빈 배열인 경우 렌더링하지 않음
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Box margin={{ vertical: 'xs' }}>
      <SpaceBetween direction="horizontal" size="xs">
        {tags.map((tag, index) => (
          <Badge
            key={`${tag.label}-${index}`}
            color={CATEGORY_BADGE_COLORS[tag.category] || CATEGORY_BADGE_COLORS.default}
          >
            {tag.label}
          </Badge>
        ))}
      </SpaceBetween>
    </Box>
  );
}
