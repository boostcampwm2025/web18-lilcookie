import SectionContainer from "../common/SectionContainer";

interface TokenUsageSectionProps {
  tokenUsage: {
    usedTokens: number;
    maxTokens: number;
    percentage: number;
  } | null;
}

export const TokenUsageSection = ({ tokenUsage }: TokenUsageSectionProps) => {
  if (!tokenUsage) return null;

  return (
    <SectionContainer title="AI 사용량">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">오늘 사용량</span>
        </div>
        {/* 프로그레스 바 */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${tokenUsage.percentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            매일 자정(KST)에 초기화됩니다
          </span>
          <span className="text-sm font-medium text-blue-600">
            {tokenUsage.percentage}% 사용
          </span>
        </div>
      </div>
    </SectionContainer>
  );
};
