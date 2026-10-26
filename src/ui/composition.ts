import { DefaultTimeEntryService } from '@/application/time-entries/time-entry-service';
import { TimeEntryCorrectionService } from '@/application/time-entry-corrections/time-entry-correction-service';
import { TimePeriodService } from '@/application/time-periods/time-period-service';
import { DefaultSessionService } from '@/application/session/session-service';
import { FirebaseIdentityProvider } from '@/infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from '@/infrastructure/firebase/firestore/firestore-profile-repository';
import { FirestoreTimeEntryRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-repository';
import { FirestoreTimeEntryCorrectionRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-correction-repository';
import { FirestoreTimePeriodRepository } from '@/infrastructure/firebase/firestore/firestore-time-period-repository';
import { createUseUsers } from '@/ui/admin/users/useUsers';
import { createUseUserProfile } from '@/ui/admin/users/useUserProfile';
import { createUseTimePeriod } from '@/ui/admin/time-periods/useTimePeriod';
import { createUseSession } from '@/ui/session/useSession';
import { createUseTimeEntryHistory } from '@/ui/time-entry-history/useTimeEntryHistory';
import { createUseTimeEntryCorrection } from '@/ui/time-entry-history/useTimeEntryCorrection';
import { createUseTimeEntries } from '@/ui/time-entries/useTimeEntries';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();
const sessionService = new DefaultSessionService(identityProvider, profileRepository);
const timeEntryRepository = new FirestoreTimeEntryRepository();
const timeEntryCorrectionRepository = new FirestoreTimeEntryCorrectionRepository();
const timePeriodRepository = new FirestoreTimePeriodRepository();
const timeEntryService = new DefaultTimeEntryService(timeEntryRepository, timePeriodRepository);
const timeEntryCorrectionService = new TimeEntryCorrectionService(
  timeEntryCorrectionRepository,
  timePeriodRepository,
  timeEntryRepository,
);
const timePeriodService = new TimePeriodService(
  timePeriodRepository,
  timeEntryCorrectionRepository,
);

export const useSession = createUseSession({ sessionService });
export const useUserProfile = createUseUserProfile({ profileRepository });
export const useUsers = createUseUsers({ profileRepository });
export const useTimePeriod = createUseTimePeriod({ profileRepository, timePeriodService });
export const useTimeEntryHistory = createUseTimeEntryHistory({
  correctionService: timeEntryCorrectionService,
  timeEntryService,
  timePeriodService,
});
export const useTimeEntryCorrection = createUseTimeEntryCorrection({
  correctionService: timeEntryCorrectionService,
});
export const useTimeEntries = createUseTimeEntries({ timeEntryService });
