import { StorageEnum } from '../base/enums.js';
import { createStorage } from '../base/base.js';
import type { SubjectType } from '@extension/shared';

export interface SimplifiedVocab {
  characters: string;
  subjectType: SubjectType;
  srsStage: number;
  level: number;
}

export interface VocabLookup {
  [key: string]: SimplifiedVocab;
}

export interface VocabLookupAndRegex {
  regexString: string | undefined;
  lookup: VocabLookup;
}

export const vocabToReplaceStorage = createStorage<VocabLookupAndRegex>(
  'vocab-to-replace-storage-key',
  { regexString: undefined, lookup: {} },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);
