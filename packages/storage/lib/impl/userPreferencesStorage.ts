import { StorageEnum } from '../base/enums.js';
import { createStorage } from '../base/base.js';
import type { BaseStorage } from '../base/types.js';
import type { SubjectType } from '@extension/shared';

export const wanikaniApiKeyStorage = createStorage<string>('wanikani-api-key-storage', '', {
  storageEnum: StorageEnum.Sync,
  liveUpdate: true,
});

export type SrsRange = {
  min: number;
  max: number;
};

type SrsRangeStorage = BaseStorage<SrsRange> & {
  setMin: (min: number) => Promise<void>;
  setMax: (max: number) => Promise<void>;
  getMin: () => Promise<number>;
  getMax: () => Promise<number>;
};

const baseWaniKaniSrsRangeStorage = createStorage<SrsRange>(
  'wanikani-srs-range-storage',
  { min: 1, max: 8 },
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export const wanikaniSrsRangeStorage: SrsRangeStorage = {
  ...baseWaniKaniSrsRangeStorage,
  setMin: async (min: number) => {
    await baseWaniKaniSrsRangeStorage.set(currentData => {
      currentData.min = min;
      return currentData;
    });
  },
  setMax: async (max: number) => {
    await baseWaniKaniSrsRangeStorage.set(currentData => {
      currentData.max = max;
      return currentData;
    });
  },
  getMin: async () => {
    const data = await baseWaniKaniSrsRangeStorage.get();
    return data.min;
  },
  getMax: async () => {
    const data = await baseWaniKaniSrsRangeStorage.get();
    return data.max;
  },
};

export const wanikaniSubjectStylePreferenceStorage = createStorage<boolean>(
  'wanikani-subject-style-preference-storage',
  true,
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export interface SubjectTypeSelection {
  radical: boolean;
  kanji: boolean;
  vocabulary: boolean;
  kana_vocabulary: boolean;
}

type WaniKaniSubjectTypeSelectionStorage = BaseStorage<SubjectTypeSelection> & {
  toggleSelect: (subject: SubjectType) => Promise<void>;
  getSelection: (subject: SubjectType) => Promise<boolean>;
};

const baseWaniKaniSubjectTypeSelectionStorage = createStorage<SubjectTypeSelection>(
  'wanikani-subject-type-selection-storage',
  {
    radical: true,
    kanji: true,
    vocabulary: true,
    kana_vocabulary: true,
  },
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export const waniKaniSubjectTypeSelectionStorage: WaniKaniSubjectTypeSelectionStorage = {
  ...baseWaniKaniSubjectTypeSelectionStorage,
  toggleSelect: async (subject: SubjectType) => {
    await baseWaniKaniSubjectTypeSelectionStorage.set(currentData => {
      currentData[subject] = !currentData[subject];
      return currentData;
    });
  },
  getSelection: async (subject: SubjectType) => {
    return (await baseWaniKaniSubjectTypeSelectionStorage.get())[subject];
  },
};

export const wanikaniSubjectUpdateIntervalStorage = createStorage<number>(
  'wanikani-subject-update-interval-storage',
  60 * 24, // 24 hours
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export const wanikaniUserUpdateIntervalStorage = createStorage<number>(
  'wanikani-user-update-interval-storage',
  60 * 24, // 24 hours
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export const wanikaniAssignmentUpdateIntervalStorage = createStorage<number>(
  'wanikani-assignment-update-interval-storage',
  60, // 1 hour
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

type DomainStorage = BaseStorage<string[]> & {
  addDomain: (domain: string) => Promise<void>;
  removeDomain: (domain: string) => Promise<void>;
  toggleDomain: (domain: string) => Promise<void>;
};

const baseExcludedDomainStorage = createStorage<string[]>('excluded-domain-storage', [], {
  storageEnum: StorageEnum.Sync,
  liveUpdate: true,
});

// You can extend it with your own methods
export const excludedDomainStorage: DomainStorage = {
  ...baseExcludedDomainStorage,
  addDomain: async (domain: string) => {
    baseExcludedDomainStorage.set(currentData => {
      if (!currentData.includes(domain)) {
        currentData.push(domain);
      }
      return currentData;
    });
  },
  removeDomain: async (domain: string) => {
    baseExcludedDomainStorage.set(currentData => {
      currentData.splice(currentData.indexOf(domain), 1);
      return currentData;
    });
  },
  toggleDomain: async (domain: string) => {
    baseExcludedDomainStorage.set(currentData => {
      if (currentData.includes(domain)) {
        currentData.splice(currentData.indexOf(domain), 1);
      } else {
        currentData.push(domain);
      }
      return currentData;
    });
  },
};
