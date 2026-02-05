import { Check } from "lucide-react";
import type { GetTeamMembersResponseData } from "@repo/api";

export type ColorTheme = "amber" | "red";

interface MemberSelectItemProps {
  member: GetTeamMembersResponseData;
  isSelected: boolean;
  onSelect: (member: GetTeamMembersResponseData) => void;
  colorTheme?: ColorTheme;
}

const themeStyles: Record<ColorTheme, { selected: string; checkIcon: string }> =
  {
    amber: {
      selected: "bg-amber-50",
      checkIcon: "text-amber-600",
    },
    red: {
      selected: "bg-red-50",
      checkIcon: "text-red-600",
    },
  };

export const MemberSelectItem = ({
  member,
  isSelected,
  onSelect,
  colorTheme = "amber",
}: MemberSelectItemProps) => {
  const styles = themeStyles[colorTheme];

  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer ${
        isSelected ? styles.selected : ""
      }`}
    >
      <div className="flex flex-col items-start">
        <span className="font-medium text-gray-900">{member.userName}</span>
        <span className="text-xs text-gray-500">{member.userEmail}</span>
      </div>
      {isSelected && <Check className={`w-5 h-5 ${styles.checkIcon}`} />}
    </button>
  );
};
