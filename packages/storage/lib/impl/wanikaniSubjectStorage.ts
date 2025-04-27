import { StorageEnum } from '../base/enums.js';
import { createStorage } from '../base/base.js';
import type { BaseStorage } from '../base/types.js';
import type {
  SubjectResponse,
  RadicalResponse,
  KanjiResponse,
  VocabularyResponse,
  KanaVocabularyResponse,
} from '@extension/shared';

export interface SubjectIdMap<T extends SubjectResponse> {
  [key: number]: T;
}

interface IdLookup<T extends SubjectResponse> {
  lastUpdated: number | null;
  subjects: SubjectIdMap<T>;
}

export type SubjectStorage<T extends SubjectResponse> = BaseStorage<IdLookup<T>> & {
  updateSubjects: (responses: T[], date: Date) => Promise<void>;
  getLastUpdated: () => Promise<Date | null>;
  getSubject: (id: number) => Promise<T | undefined>;
};

const createSubjectStorage = <T extends SubjectResponse>(storage: BaseStorage<IdLookup<T>>): SubjectStorage<T> => ({
  ...storage,
  updateSubjects: async (responses: T[], date: Date) => {
    const newSubjects: { [key: number]: T } = {};
    for (const response of responses) {
      newSubjects[response.id] = response;
    }
    await storage.set(currentData => {
      currentData.subjects = { ...currentData.subjects, ...newSubjects };
      currentData.lastUpdated = date.getTime();
      return currentData;
    });
  },
  getLastUpdated: async () => {
    const data = await storage.get();
    if (!data.lastUpdated) return null;
    return new Date(data.lastUpdated);
  },
  getSubject: async (id: number) => {
    const data = await storage.get();
    return data.subjects[id];
  },
});

type RadicalSubjectStorage = SubjectStorage<RadicalResponse>;
type KanjiSubjectStorage = SubjectStorage<KanjiResponse>;
type VocabularySubjectStorage = SubjectStorage<VocabularyResponse>;
type KanaVocabularySubjectStorage = SubjectStorage<KanaVocabularyResponse>;

export const radicalSubjectStorage: RadicalSubjectStorage = createSubjectStorage(
  createStorage<IdLookup<RadicalResponse>>(
    'radical-subject-storage-key',
    {
      lastUpdated: null,
      subjects: {},
    },
    {
      storageEnum: StorageEnum.Local,
      liveUpdate: true,
    },
  ),
);

export const kanjiSubjectStorage: KanjiSubjectStorage = createSubjectStorage(
  createStorage<IdLookup<KanjiResponse>>(
    'kanji-subject-storage-key',
    {
      lastUpdated: null,
      subjects: {},
    },
    {
      storageEnum: StorageEnum.Local,
      liveUpdate: true,
    },
  ),
);

export const vocabularySubjectStorage: VocabularySubjectStorage = createSubjectStorage(
  createStorage<IdLookup<VocabularyResponse>>(
    'vocabulary-subject-storage-key',
    {
      lastUpdated: null,
      subjects: {},
    },
    {
      storageEnum: StorageEnum.Local,
      liveUpdate: true,
    },
  ),
);

export const kanaVocabularySubjectStorage: KanaVocabularySubjectStorage = createSubjectStorage(
  createStorage<IdLookup<KanaVocabularyResponse>>(
    'kana-vocabulary-subject-storage-key',
    {
      lastUpdated: null,
      subjects: {},
    },
    {
      storageEnum: StorageEnum.Local,
      liveUpdate: true,
    },
  ),
);
