import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import {
  TimeEntryAdjustmentRepositoryError,
  type NewTimeEntryAdjustment,
  type TimeEntryAdjustmentDecision,
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
        this.addAuditRecord(batch, adjustment, 'PENDING', null);
      });

      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to create adjustment requests.', {
        cause: error,
      });
    }
  }

  async applyMany(adjustments: NewTimeEntryAdjustment[], decidedById: string) {
    try {
      const batch = writeBatch(this.firestore);

      adjustments.forEach((adjustment) => {
        this.addAuditRecord(batch, adjustment, 'APPROVED', decidedById);

        this.applyEffectiveAdjustment(batch, adjustment);
      });

      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to apply administrative adjustments.', {
        cause: error,
      });
    }
  }

  async decideMany(decisions: TimeEntryAdjustmentDecision[], decidedById: string) {
    try {
      const batch = writeBatch(this.firestore);

      decisions.forEach(({ adjustment, status }) => {
        batch.update(doc(this.firestore, 'timeEntryAdjustments', adjustment.id), {
          decidedAt: serverTimestamp(),
          decidedById,
          status,
        });
        if (status === 'APPROVED') this.applyEffectiveAdjustment(batch, adjustment);
      });

      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to decide adjustment requests.', {
        cause: error,
      });
    }
  }

  async findById(id: string) {
    try {
      const snapshot = await getDoc(doc(this.firestore, 'timeEntryAdjustments', id));
      return snapshot.exists()
        ? toAdjustment(snapshot.id, snapshot.data() as TimeEntryAdjustmentDocument)
        : null;
    } catch (error: unknown) {
      throw new TimeEntryAdjustmentRepositoryError('Unable to read adjustment request.', {
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

  private addAuditRecord(
    batch: WriteBatch,
    adjustment: NewTimeEntryAdjustment,
    status: 'APPROVED' | 'PENDING',
    decidedById: string | null,
  ) {
    const reference = doc(collection(this.firestore, 'timeEntryAdjustments'));
    batch.set(reference, {
      ...adjustment,
      decidedAt: status === 'APPROVED' ? serverTimestamp() : null,
      decidedById,
      requestedAt: serverTimestamp(),
      status,
    });
  }

  private applyEffectiveAdjustment(
    batch: WriteBatch,
    adjustment: NewTimeEntryAdjustment | TimeEntryAdjustment,
  ) {
    if (adjustment.type === 'ADD' && adjustment.proposedRecordedAt) {
      const reference = doc(collection(this.firestore, 'timeEntries'));
      batch.set(reference, {
        dayKey: adjustment.dayKey,
        monthKey: adjustment.monthKey,
        recordedAt: adjustment.proposedRecordedAt,
        status: 'ACTIVE',
        userId: adjustment.userId,
      });
    }

    if (
      adjustment.type === 'CHANGE' &&
      adjustment.targetTimeEntryId &&
      adjustment.proposedRecordedAt
    ) {
      batch.update(doc(this.firestore, 'timeEntries', adjustment.targetTimeEntryId), {
        dayKey: adjustment.dayKey,
        monthKey: adjustment.monthKey,
        recordedAt: adjustment.proposedRecordedAt,
        status: 'ACTIVE',
      });
    }

    if (adjustment.type === 'REMOVE' && adjustment.targetTimeEntryId) {
      batch.update(doc(this.firestore, 'timeEntries', adjustment.targetTimeEntryId), {
        status: 'REMOVED',
      });
    }
  }
}
