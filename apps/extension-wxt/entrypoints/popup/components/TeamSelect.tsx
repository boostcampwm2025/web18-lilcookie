import type { Team } from "../../../schemas/auth.type";

type TeamSelectProps = {
  teams: Team[];
  value: string;
  isDisabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
};

function TeamSelect({ teams, value, isDisabled, onChange }: TeamSelectProps) {
  const isEmpty = teams.length === 0;

  return (
    <div className="team-select">
      <label htmlFor="teamSelect">팀 선택</label>
      <select
        id="teamSelect"
        value={value}
        onChange={onChange}
        disabled={isDisabled || isEmpty}
      >
        {isEmpty ? (
          <option value="">참여 중인 팀이 없습니다</option>
        ) : (
          teams.map((team) => (
            <option key={team.teamUuid} value={team.teamUuid}>
              {team.teamName}
            </option>
          ))
        )}
      </select>
    </div>
  );
}

export default TeamSelect;
