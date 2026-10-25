import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  TimeEntryRepositoryError,
  type NewTimeEntry,
  type TimeEntryRepository,
} from '@/application/time-entries/time-entry-repository';
import type { TimeEntry, TimeEntryStatus } from '@/domain/time-entry';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface TimeEntryDocument {
  userId: string;
  recordedAt: Timestamp;
  dayKey: string;
  monthKey: string;
  status?: TimeEntryStatus;
}

function toTimeEntry(id: string, data: TimeEntryDocument): TimeEntry {
  return {
    id,
    userId: data.userId,
    recordedAt: data.recordedAt.toDate(),
    dayKey: data.dayKey,
    monthKey: data.monthKey,
    status: data.status ?? 'ACTIVE',
  };
}

export class FirestoreTimeEntryRepository implements TimeEntryRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async create(entry: NewTimeEntry) {
    try {
      const reference = await addDoc(collection(this.firestore, 'timeEntries'), {
        ...entry,
        recordedAt: serverTimestamp(),
        status: 'ACTIVE',
      });
      const snapshot = await getDoc(reference);

      return toTimeEntry(snapshot.id, snapshot.data() as TimeEntryDocument);
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to create time entry.', { cause: error });
    }
  }

  async findById(id: string) {
    try {
      const snapshot = await getDoc(doc(this.firestore, 'timeEntries', id));
      return snapshot.exists()
        ? toTimeEntry(snapshot.id, snapshot.data() as TimeEntryDocument)
        : null;
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to read time entry.', { cause: error });
    }
  }

  async findByUserAndDay(userId: string, dayKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntries'),
          where('userId', '==', userId),
          where('dayKey', '==', dayKey),
        ),
      );

      return snapshot.docs.map((entry) => toTimeEntry(entry.id, entry.data() as TimeEntryDocument));
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to read time entries.', { cause: error });
    }
  }

  async findByUserAndMonth(userId: string, monthKey: string) {
    try {
      const snapshot = await getDocs(
        query(
          collection(this.firestore, 'timeEntries'),
          where('userId', '==', userId),
          where('monthKey', '==', monthKey),
          orderBy('recordedAt'),
        ),
      );

      return snapshot.docs.map((entry) => toTimeEntry(entry.id, entry.data() as TimeEntryDocument));
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to read monthly time entries.', { cause: error });
    }
  }
}
