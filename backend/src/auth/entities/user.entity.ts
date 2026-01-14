export class User {
  id: number;
  uuid: string;
  email: string;
  nickname: string;
  passwordHash: string;
  createdAt: Date;
  termsOfService: boolean;
  privacyPolicy: boolean;
  marketingConsent: boolean;
  termsOfServiceAt: Date;
  privacyPolicyAt: Date;
  marketingConsentAt: Date | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
