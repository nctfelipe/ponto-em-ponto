import { DefaultTimeEntryService } from '@/application/time-entries/time-entry-service';
import { TimeEntryAdjustmentService } from '@/application/time-entry-adjustments/time-entry-adjustment-service';
import { DefaultSessionService } from '@/application/session/session-service';
import { FirebaseIdentityProvider } from '@/infrastructure/firebase/auth/firebase-identity-provider';
import { FirestoreProfileRepository } from '@/infrastructure/firebase/firestore/firestore-profile-repository';
import { FirestoreTimeEntryRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-repository';
import { FirestoreTimeEntryAdjustmentRepository } from '@/infrastructure/firebase/firestore/firestore-time-entry-adjustment-repository';
import { FirestoreTimePeriodRepository } from '@/infrastructure/firebase/firestore/firestore-time-period-repository';
import { createUseUsers } from '@/ui/admin/users/useUsers';
import { createUseUserProfile } from '@/ui/admin/users/useUserProfile';
import { createUseSession } from '@/ui/session/useSession';
import { createUseTimeEntryHistory } from '@/ui/time-entry-history/useTimeEntryHistory';
import { createUseTimeEntryAdjustment } from '@/ui/time-entry-history/useTimeEntryAdjustment';
import { createUseTimeEntries } from '@/ui/time-entries/useTimeEntries';

const identityProvider = new FirebaseIdentityProvider();
const profileRepository = new FirestoreProfileRepository();
const sessionService = new DefaultSessionService(identityProvider, profileRepository);
const timeEntryRepository = new FirestoreTimeEntryRepository();
const timeEntryService = new DefaultTimeEntryService(timeEntryRepository);
const timeEntryAdjustmentService = new TimeEntryAdjustmentService(
  new FirestoreTimeEntryAdjustmentRepository(),
  new FirestoreTimePeriodRepository(),
  timeEntryRepository,
);

export const useSession = createUseSession({ sessionService });
export const useUserProfile = createUseUserProfile({ profileRepository });
export const useUsers = createUseUsers({ profileRepository });
export const useTimeEntryHistory = createUseTimeEntryHistory({
  adjustmentService: timeEntryAdjustmentService,
  timeEntryService,
});
export const useTimeEntryAdjustment = createUseTimeEntryAdjustment({
  adjustmentService: timeEntryAdjustmentService,
});
export const useTimeEntries = createUseTimeEntries({ timeEntryService });
