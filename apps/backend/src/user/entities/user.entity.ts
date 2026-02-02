export class User {
  userId: number;
  userUuid: string;
  userEmail: string | null;
  userNickname: string;
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
