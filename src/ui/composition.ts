import { FirebaseIdentityProvider } from '@/infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from '@/infrastructure/firebase/firestore/firestore-profile-repository';
import { createUseUsers } from '@/ui/admin/users/useUsers';
import { createUseSession } from '@/ui/session/useSession';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();

export const useSession = createUseSession({ identityProvider, profileRepository });
export const useUsers = createUseUsers({ profileRepository });
