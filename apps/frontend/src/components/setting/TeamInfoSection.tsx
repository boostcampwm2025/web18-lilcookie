import SectionContainer from "../common/SectionContainer";
import type { Team } from "../../types";

interface TeamInfoSectionProps {
  team: Team | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const TeamInfoSection = ({ team }: TeamInfoSectionProps) => {
  return (
    <SectionContainer title="팀 정보">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">팀 이름</span>
          <span className="font-medium text-gray-900">{team?.teamName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">생성일</span>
          <span className="text-gray-900">
            {team?.createdAt && formatDate(team.createdAt)}
          </span>
        </div>
      </div>
    </SectionContainer>
  );
};
