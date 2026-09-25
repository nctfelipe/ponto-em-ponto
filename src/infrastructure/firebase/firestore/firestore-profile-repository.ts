import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  ProfileRepositoryError,
  type NewPendingProfile,
  type ProfileRepository,
} from '../../../application/profiles/profile-repository';
import type { Profile, ProfileStatus } from '../../../domain/profile';
import { getFirebaseApp } from '../app';

interface ProfileDocument {
  displayName: string;
  email: string;
  status: ProfileStatus;
}

function toProfile(id: string, data: ProfileDocument): Profile {
  return {
    id,
    displayName: data.displayName,
    email: data.email,
    status: data.status,
  };
}

export class FirestoreProfileRepository implements ProfileRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async findById(id: string) {
    try {
      const snapshot = await getDoc(doc(this.firestore, 'profiles', id));

      if (!snapshot.exists()) {
        return null;
      }

      return toProfile(snapshot.id, snapshot.data() as ProfileDocument);
    } catch (error: unknown) {
      throw new ProfileRepositoryError('Unable to read profile.', { cause: error });
    }
  }

  async createPending(profile: NewPendingProfile) {
    try {
      await setDoc(doc(this.firestore, 'profiles', profile.id), {
        displayName: profile.displayName,
        email: profile.email,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return toProfile(profile.id, {
        displayName: profile.displayName,
        email: profile.email,
        status: 'PENDING',
      });
    } catch (error: unknown) {
      throw new ProfileRepositoryError('Unable to create profile.', { cause: error });
    }
  }
}
