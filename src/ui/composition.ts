import { DefaultTimeEntryService } from '@/application/time-entries/time-entry-service';
import { FirebaseIdentityProvider } from '@/infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from '@/infrastructure/firebase/firestore/firestore-profile-repository';
import { FirestoreTimeEntryRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-repository';
import { createUseUsers } from '@/ui/admin/users/useUsers';
import { createUseSession } from '@/ui/session/useSession';
import { createUseTimeEntries } from '@/ui/time-entries/useTimeEntries';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();
const timeEntryRepository = new FirestoreTimeEntryRepository();
const timeEntryService = new DefaultTimeEntryService(timeEntryRepository);

export const useSession = createUseSession({ identityProvider, profileRepository });
export const useUsers = createUseUsers({ profileRepository });
export const useTimeEntries = createUseTimeEntries({ timeEntryService });
