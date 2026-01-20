export class User {
  id: number;
  authentikId: string; // Authentik sub claim
  email: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
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
