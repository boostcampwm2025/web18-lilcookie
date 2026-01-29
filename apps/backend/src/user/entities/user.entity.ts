export class User {
  userId: number;
  userUuid: string;
  userNickname: string;
  createdAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
