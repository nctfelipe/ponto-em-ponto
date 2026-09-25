export type ProfileStatus = 'PENDING' | 'ACTIVE';

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  status: ProfileStatus;
}
