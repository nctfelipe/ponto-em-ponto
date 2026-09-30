import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  ProfileRepositoryError,
  type NewPendingProfile,
  type ProfileRepository,
} from '@/application/profiles/profile-repository';
import type { Profile, ProfileStatus } from '@/domain/profile';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

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

  async findAll() {
    try {
      const snapshot = await getDocs(collection(this.firestore, 'profiles'));

      return snapshot.docs.map((profile) =>
        toProfile(profile.id, profile.data() as ProfileDocument),
      );
    } catch (error: unknown) {
      throw new ProfileRepositoryError('Unable to list profiles.', { cause: error });
    }
  }

  async activate(id: string) {
    try {
      const reference = doc(this.firestore, 'profiles', id);

      await updateDoc(reference, {
        status: 'ACTIVE',
        updatedAt: serverTimestamp(),
      });

      const snapshot = await getDoc(reference);

      if (!snapshot.exists()) {
        throw new Error('Activated profile was not found.');
      }

      return toProfile(snapshot.id, snapshot.data() as ProfileDocument);
    } catch (error: unknown) {
      throw new ProfileRepositoryError('Unable to activate profile.', { cause: error });
    }
  }
}
