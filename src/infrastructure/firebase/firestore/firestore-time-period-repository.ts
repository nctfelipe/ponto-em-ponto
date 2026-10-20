import { doc, getDoc, getFirestore } from 'firebase/firestore';
import {
  TimePeriodRepositoryError,
  type TimePeriodRepository,
} from '@/application/time-periods/time-period-repository';
import { getFirebaseApp } from '@/infrastructure/firebase/app';

interface TimePeriodDocument {
  status: 'OPEN' | 'CLOSED';
}

export class FirestoreTimePeriodRepository implements TimePeriodRepository {
  private readonly firestore = getFirestore(getFirebaseApp());

  async isClosed(userId: string, monthKey: string) {
    try {
      const snapshot = await getDoc(
        doc(this.firestore, 'profiles', userId, 'timePeriods', monthKey),
      );

      return snapshot.exists() && (snapshot.data() as TimePeriodDocument).status === 'CLOSED';
    } catch (error: unknown) {
      throw new TimePeriodRepositoryError('Unable to read time period.', { cause: error });
    }
  }
}
