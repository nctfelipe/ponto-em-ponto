import {
  Timestamp,
  collection,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
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

  async createMany(adjustments: NewTimeEntryAdjustment[]) {
    try {
      const batch = writeBatch(this.firestore);

      adjustments.forEach((adjustment) => {
        const reference = doc(collection(this.firestore, 'timeEntryAdjustments'));
        batch.set(reference, {
          ...adjustment,
          decidedAt: null,
          decidedById: null,
          requestedAt: serverTimestamp(),
          status: 'PENDING',
        });
      });

      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to create adjustment requests.', {
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

  async findByUserAndMonth(userId: string, monthKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntryAdjustments'),
          where('userId', '==', userId),
          where('monthKey', '==', monthKey),
          orderBy('requestedAt'),
        ),
      );

      return snapshot.docs.map((adjustment) =>
        toAdjustment(adjustment.id, adjustment.data() as TimeEntryAdjustmentDocument),
      );
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to read monthly adjustment requests.', {
        cause: error,
      });
    }
  }
}
