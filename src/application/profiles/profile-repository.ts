import type { Profile } from '../../domain/profile';

export interface NewPendingProfile {
  id: string;
  displayName: string;
  email: string;
}

export interface ProfileRepository {
  findById(id: string): Promise<Profile | null>;
  createPending(profile: NewPendingProfile): Promise<Profile>;
}

export class ProfileRepositoryError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ProfileRepositoryError';
  }
}
