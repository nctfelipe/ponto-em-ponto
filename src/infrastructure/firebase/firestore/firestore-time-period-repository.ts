import {
  Timestamp,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore/lite';
import {
  TimePeriodRepositoryError,
  type TimePeriodRepository,
} from '@/application/time-periods/time-period-repository';
import type { TimePeriod } from '@/domain/time-period';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface TimePeriodDocument {
  closedAt: Timestamp;
  closedById: string;
  status: 'CLOSED';
}

export class FirestoreTimePeriodRepository implements TimePeriodRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async close(monthKey: string, closedById: string) {
    try {
      await setDoc(doc(this.firestore, 'timePeriods', monthKey), {
        closedAt: serverTimestamp(),
        closedById,
        status: 'CLOSED',
      });
    } catch (error: unknown) {
      throw new TimePeriodRepositoryError('Unable to close time period.', { cause: error });
    }
  }

  async find(monthKey: string): Promise<TimePeriod> {
    try {
      const snapshot = await getDoc(doc(this.firestore, 'timePeriods', monthKey));

      if (!snapshot.exists()) {
        return { closedAt: null, closedById: null, monthKey, status: 'OPEN' };
      }

      const period = snapshot.data() as TimePeriodDocument;
      return {
        closedAt: period.closedAt.toDate(),
        closedById: period.closedById,
        monthKey,
        status: period.status,
      };
    } catch (error: unknown) {
      throw new TimePeriodRepositoryError('Unable to read time period.', { cause: error });
    }
  }
}
