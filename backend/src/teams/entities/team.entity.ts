export class Team {
  id: number;
  uuid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Team>) {
    Object.assign(this, partial);
  }
}

export class TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: string; // "owner" | "member"
  joinedAt: Date;

  constructor(partial: Partial<TeamMember>) {
    Object.assign(this, partial);
  }
}
