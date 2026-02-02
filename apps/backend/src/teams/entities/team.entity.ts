export class Team {
  teamId: number;
  teamUuid: string;
  teamName: string;
  createdAt: Date;

  constructor(partial: Partial<Team>) {
    Object.assign(this, partial);
  }
}
