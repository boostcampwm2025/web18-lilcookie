export class Member {
  memberId: number;
  teamId: number;
  userId: number;
  role: string;
  joinedAt: Date;

  constructor(partial: Partial<Member>) {
    Object.assign(this, partial);
  }
}
