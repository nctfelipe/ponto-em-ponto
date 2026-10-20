import {
  Timestamp,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import {
  TimeEntryCorrectionRepositoryError,
  type NewTimeEntryCorrection,
  type TimeEntryCorrectionRepository,
} from '@/application/time-entry-corrections/time-entry-correction-repository';
import type {
  CorrectionEntry,
  TimeEntryCorrection,
  TimeEntryCorrectionStatus,
} from '@/domain/time-entry-correction';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface CorrectionEntryDocument {
  recordedAt: Timestamp;
  timeEntryId: string | null;
}

interface TimeEntryCorrectionDocument {
  dayKey: string;
  decidedAt: Timestamp | null;
  decidedById: string | null;
  monthKey: string;
  previousEntries: CorrectionEntryDocument[];
  proposedEntries: CorrectionEntryDocument[];
  requestedAt: Timestamp;
  requestedById: string;
  status: TimeEntryCorrectionStatus;
  userId: string;
}

function toEntry(entry: CorrectionEntryDocument): CorrectionEntry {
  return { ...entry, recordedAt: entry.recordedAt.toDate() };
}

function toCorrection(id: string, data: TimeEntryCorrectionDocument): TimeEntryCorrection {
  return {
    ...data,
    decidedAt: data.decidedAt?.toDate() ?? null,
    id,
    previousEntries: data.previousEntries.map(toEntry),
    proposedEntries: data.proposedEntries.map(toEntry),
    requestedAt: data.requestedAt.toDate(),
  };
}

export class FirestoreTimeEntryCorrectionRepository implements TimeEntryCorrectionRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async create(correction: NewTimeEntryCorrection) {
    try {
      const batch = writeBatch(this.firestore);
      this.addCorrection(batch, correction, 'PENDING', null);
      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to create correction.', {
        cause: error,
      });
    }
  }

  async apply(correction: NewTimeEntryCorrection, decidedById: string) {
    try {
      const batch = writeBatch(this.firestore);
      this.addCorrection(batch, correction, 'APPROVED', decidedById);
      this.applyEffectiveState(batch, correction);
      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to apply correction.', { cause: error });
    }
  }

  async decide(
    correction: TimeEntryCorrection,
    status: 'APPROVED' | 'REJECTED',
    decidedById: string,
  ) {
    try {
      const batch = writeBatch(this.firestore);
      batch.update(doc(this.firestore, 'timeEntryCorrections', correction.id), {
        decidedAt: serverTimestamp(),
        decidedById,
        status,
      });
      if (status === 'APPROVED') this.applyEffectiveState(batch, correction);
      await batch.commit();
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to decide correction.', {
        cause: error,
      });
    }
  }

  async findById(id: string) {
    try {
      const snapshot = await getDoc(doc(this.firestore, 'timeEntryCorrections', id));
      return snapshot.exists()
        ? toCorrection(snapshot.id, snapshot.data() as TimeEntryCorrectionDocument)
        : null;
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to read correction.', { cause: error });
    }
  }

  async findByUserAndMonth(userId: string, monthKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntryCorrections'),
          where('userId', '==', userId),
          where('monthKey', '==', monthKey),
          orderBy('requestedAt'),
        ),
      );
      return snapshot.docs.map((item) =>
        toCorrection(item.id, item.data() as TimeEntryCorrectionDocument),
      );
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to read monthly corrections.', {
        cause: error,
      });
    }
  }

  async findPendingByDay(userId: string, dayKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntryCorrections'),
          where('userId', '==', userId),
          where('dayKey', '==', dayKey),
          where('status', '==', 'PENDING'),
          limit(1),
        ),
      );
      const item = snapshot.docs[0];
      return item ? toCorrection(item.id, item.data() as TimeEntryCorrectionDocument) : null;
    } catch (error: unknown) {
      throw new TimeEntryCorrectionRepositoryError('Unable to read pending correction.', {
        cause: error,
      });
    }
  }

  private addCorrection(
    batch: WriteBatch,
    correction: NewTimeEntryCorrection,
    status: 'APPROVED' | 'PENDING',
    decidedById: string | null,
  ) {
    batch.set(doc(collection(this.firestore, 'timeEntryCorrections')), {
      ...correction,
      decidedAt: status === 'APPROVED' ? serverTimestamp() : null,
      decidedById,
      requestedAt: serverTimestamp(),
      status,
    });
  }

  private applyEffectiveState(
    batch: WriteBatch,
    correction: NewTimeEntryCorrection | TimeEntryCorrection,
  ) {
    const proposedIds = new Set(
      correction.proposedEntries.flatMap(({ timeEntryId }) => (timeEntryId ? [timeEntryId] : [])),
    );

    correction.previousEntries.forEach(({ timeEntryId }) => {
      if (timeEntryId && !proposedIds.has(timeEntryId)) {
        batch.update(doc(this.firestore, 'timeEntries', timeEntryId), { status: 'REMOVED' });
      }
    });

    correction.proposedEntries.forEach(({ recordedAt, timeEntryId }) => {
      if (timeEntryId) {
        batch.update(doc(this.firestore, 'timeEntries', timeEntryId), {
          dayKey: correction.dayKey,
          monthKey: correction.monthKey,
          recordedAt,
          status: 'ACTIVE',
        });
      } else {
        batch.set(doc(collection(this.firestore, 'timeEntries')), {
          dayKey: correction.dayKey,
          monthKey: correction.monthKey,
          recordedAt,
          status: 'ACTIVE',
          userId: correction.userId,
        });
      }
    });
  }
}
