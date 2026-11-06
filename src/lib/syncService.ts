import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { RtProfile, Transaction, RapItem, MonthlySpjRecord, MusyawarahRecord, CategoryDefinition } from '../types';

export interface BopMasterData {
  profile: RtProfile;
  transactions: Transaction[];
  categories: CategoryDefinition[];
  rapItems: RapItem[];
  spjRecords: MonthlySpjRecord[];
  musyawarahRecords: MusyawarahRecord[];
  updatedAt?: string;
  updatedBy?: string;
}

const BOP_DOC_ID = 'rt04_ngabean_2026';
const BOP_COLLECTION = 'bop_data';

export function subscribeBopData(
  onData: (data: Partial<BopMasterData>) => void,
  onError?: (err: unknown) => void
) {
  const docRef = doc(db, BOP_COLLECTION, BOP_DOC_ID);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as Partial<BopMasterData>);
      }
    },
    (error) => {
      console.warn('Firestore subscription warning:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${BOP_COLLECTION}/${BOP_DOC_ID}`);
    }
  );
}

export async function saveBopDataToCloud(data: Partial<BopMasterData>): Promise<void> {
  const docRef = doc(db, BOP_COLLECTION, BOP_DOC_ID);
  try {
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Failed saving to cloud Firestore:', error);
    handleFirestoreError(error, OperationType.WRITE, `${BOP_COLLECTION}/${BOP_DOC_ID}`);
  }
}
