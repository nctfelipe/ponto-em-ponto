import type { Profile } from '@/domain/profile';

export interface NewPendingProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  findAll(): Promise<Profile[]>;
  createPending(profile: NewPendingProfile): Promise<Profile>;
  activate(id: string): Promise<Profile>;
}

export class ProfileRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProfileRepositoryError';
  }
}
