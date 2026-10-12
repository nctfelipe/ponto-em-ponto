import {
  Timestamp,
  addDoc,
  collection,
  getDoc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  TimeEntryAdjustmentRepositoryError,
  type NewTimeEntryAdjustment,
  type TimeEntryAdjustmentRepository,
} from '@/application/time-entry-adjustments/time-entry-adjustment-repository';
import type {
  TimeEntryAdjustment,
  TimeEntryAdjustmentStatus,
  TimeEntryAdjustmentType,
} from '@/domain/time-entry-adjustment';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface TimeEntryAdjustmentDocument {
  currentRecordedAt: Timestamp | null;
  dayKey: string;
  decidedAt: Timestamp | null;
  decidedById: string | null;
  monthKey: string;
  proposedRecordedAt: Timestamp | null;
  requestedAt: Timestamp;
  requestedById: string;
  status: TimeEntryAdjustmentStatus;
  targetTimeEntryId: string | null;
  type: TimeEntryAdjustmentType;
  userId: string;
}

function toAdjustment(id: string, data: TimeEntryAdjustmentDocument): TimeEntryAdjustment {
  return {
    ...data,
    currentRecordedAt: data.currentRecordedAt?.toDate() ?? null,
    decidedAt: data.decidedAt?.toDate() ?? null,
    id,
    proposedRecordedAt: data.proposedRecordedAt?.toDate() ?? null,
    requestedAt: data.requestedAt.toDate(),
  };
}

export class FirestoreTimeEntryAdjustmentRepository implements TimeEntryAdjustmentRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async create(adjustment: NewTimeEntryAdjustment) {
    try {
      const reference = await addDoc(collection(this.firestore, 'timeEntryAdjustments'), {
        ...adjustment,
        decidedAt: null,
        decidedById: null,
        requestedAt: serverTimestamp(),
        status: 'PENDING',
      });
      const snapshot = await getDoc(reference);

      return toAdjustment(snapshot.id, snapshot.data() as TimeEntryAdjustmentDocument);
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to create adjustment request.', {
        cause: error,
      });
    }
  }

  async findByTimeEntryId(timeEntryId: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntryAdjustments'),
          where('targetTimeEntryId', '==', timeEntryId),
        ),
      );

      return snapshot.docs.map((adjustment) =>
        toAdjustment(adjustment.id, adjustment.data() as TimeEntryAdjustmentDocument),
      );
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to read time entry adjustments.', {
        cause: error,
      });
    }
  }

  async findByUserAndDay(userId: string, dayKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntryAdjustments'),
          where('userId', '==', userId),
          where('dayKey', '==', dayKey),
        ),
      );

      return snapshot.docs.map((adjustment) =>
        toAdjustment(adjustment.id, adjustment.data() as TimeEntryAdjustmentDocument),
      );
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to read daily adjustment requests.', {
        cause: error,
      });
    }
  }
}
