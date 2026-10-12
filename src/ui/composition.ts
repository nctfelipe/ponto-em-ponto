import { DefaultTimeEntryService } from '@/application/time-entries/time-entry-service';
import { DefaultSessionService } from '@/application/session/session-service';
import { FirebaseIdentityProvider } from '@/infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from '@/infrastructure/firebase/firestore/firestore-profile-repository';
import { FirestoreTimeEntryRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-repository';
import { createUseUsers } from '@/ui/admin/users/useUsers';
import { createUseUserProfile } from '@/ui/admin/users/useUserProfile';
import { createUseSession } from '@/ui/session/useSession';
import { createUseTimeEntryHistory } from '@/ui/time-entry-history/useTimeEntryHistory';
import { createUseTimeEntries } from '@/ui/time-entries/useTimeEntries';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();
const sessionService = new DefaultSessionService(identityProvider, profileRepository);
const timeEntryRepository = new FirestoreTimeEntryRepository();
const timeEntryService = new DefaultTimeEntryService(timeEntryRepository);

export const useSession = createUseSession({ sessionService });
export const useUserProfile = createUseUserProfile({ profileRepository });
export const useUsers = createUseUsers({ profileRepository });
export const useTimeEntryHistory = createUseTimeEntryHistory({ timeEntryService });
export const useTimeEntries = createUseTimeEntries({ timeEntryService });
