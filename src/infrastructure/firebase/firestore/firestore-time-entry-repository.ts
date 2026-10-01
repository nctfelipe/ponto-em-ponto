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
  TimeEntryRepositoryError,
  type NewTimeEntry,
  type TimeEntryRepository,
} from '@/application/time-entries/time-entry-repository';
import type { TimeEntry } from '@/domain/time-entry';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface TimeEntryDocument {
  userId: string;
  recordedAt: Timestamp;
  dayKey: string;
  monthKey: string;
}

function toTimeEntry(id: string, data: TimeEntryDocument): TimeEntry {
  return {
    id,
    userId: data.userId,
    recordedAt: data.recordedAt.toDate(),
    dayKey: data.dayKey,
    monthKey: data.monthKey,
  };
}

export class FirestoreTimeEntryRepository implements TimeEntryRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async create(entry: NewTimeEntry) {
    try {
      const reference = await addDoc(collection(this.firestore, 'timeEntries'), {
        ...entry,
        recordedAt: serverTimestamp(),
      });
      const snapshot = await getDoc(reference);

      return toTimeEntry(snapshot.id, snapshot.data() as TimeEntryDocument);
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to create time entry.', { cause: error });
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

      return snapshot.docs
        .map((entry) => toTimeEntry(entry.id, entry.data() as TimeEntryDocument))
        .sort((left, right) => left.recordedAt.getTime() - right.recordedAt.getTime());
    } catch (error: unknown) {
      throw new TimeEntryRepositoryError('Unable to read time entries.', { cause: error });
    }
  }
}
