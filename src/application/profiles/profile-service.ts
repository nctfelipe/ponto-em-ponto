import type { ProfileRepository } from '@/application/profiles/profile-repository';
import type { Profile } from '@/domain/profile';

export interface ProfileService {
  activate(profileId: string): Promise<Profile>;
  findAll(): Promise<Profile[]>;
  findById(profileId: string): Promise<Profile | null>;
}

export class DefaultProfileService implements ProfileService {
  private readonly profileRepository: ProfileRepository;

  constructor(profileRepository: ProfileRepository) {
    this.profileRepository = profileRepository;
  }

  activate(profileId: string) {
    return this.profileRepository.activate(profileId);
  }

  findAll() {
    return this.profileRepository.findAll();
  }

  findById(profileId: string) {
    return this.profileRepository.findById(profileId);
  }
}
