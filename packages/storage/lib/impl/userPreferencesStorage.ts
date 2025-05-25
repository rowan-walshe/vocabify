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

export type DomainSettings = {
  alwaysTranslateDomain: string[];
  neverTranslateDomain: string[];
};

type DomainSettingsStorage = BaseStorage<DomainSettings> & {
  toggleAlwaysTranslateDomain: (domain: string) => Promise<void>;
  toggleNeverTranslateDomain: (domain: string) => Promise<void>;
  alwaysTranslateDomain: (domain: string) => Promise<void>;
  neverTranslateDomain: (domain: string) => Promise<void>;
  removeDomain: (domain: string) => Promise<void>;
  getAlwaysTranslateDomain: (domain: string) => Promise<boolean>;
  getNeverTranslateDomain: (domain: string) => Promise<boolean>;
};

const baseDomainSettingsStorage = createStorage<DomainSettings>(
  'domain-settings-storage',
  {
    alwaysTranslateDomain: [],
    neverTranslateDomain: [],
  },
  {
    storageEnum: StorageEnum.Sync,
    liveUpdate: true,
  },
);

export const domainSettingsStorage: DomainSettingsStorage = {
  ...baseDomainSettingsStorage,
  toggleAlwaysTranslateDomain: async (domain: string) => {
    baseDomainSettingsStorage.set(currentData => {
      if (currentData.alwaysTranslateDomain.includes(domain)) {
        currentData.alwaysTranslateDomain.splice(currentData.alwaysTranslateDomain.indexOf(domain), 1);
      } else {
        currentData.alwaysTranslateDomain.push(domain);
        if (currentData.neverTranslateDomain.includes(domain)) {
          currentData.neverTranslateDomain.splice(currentData.neverTranslateDomain.indexOf(domain), 1);
        }
      }
      return currentData;
    });
  },
  toggleNeverTranslateDomain: async (domain: string) => {
    baseDomainSettingsStorage.set(currentData => {
      if (currentData.neverTranslateDomain.includes(domain)) {
        currentData.neverTranslateDomain.splice(currentData.neverTranslateDomain.indexOf(domain), 1);
      } else {
        currentData.neverTranslateDomain.push(domain);
        if (currentData.alwaysTranslateDomain.includes(domain)) {
          currentData.alwaysTranslateDomain.splice(currentData.alwaysTranslateDomain.indexOf(domain), 1);
        }
      }
      return currentData;
    });
  },
  alwaysTranslateDomain: async (domain: string) => {
    baseDomainSettingsStorage.set(currentData => {
      if (!currentData.alwaysTranslateDomain.includes(domain)) {
        currentData.alwaysTranslateDomain.push(domain);
      }
      if (currentData.neverTranslateDomain.includes(domain)) {
        currentData.neverTranslateDomain.splice(currentData.neverTranslateDomain.indexOf(domain), 1);
      }
      return currentData;
    });
  },
  neverTranslateDomain: async (domain: string) => {
    baseDomainSettingsStorage.set(currentData => {
      if (!currentData.neverTranslateDomain.includes(domain)) {
        currentData.neverTranslateDomain.push(domain);
      }
      if (currentData.alwaysTranslateDomain.includes(domain)) {
        currentData.alwaysTranslateDomain.splice(currentData.alwaysTranslateDomain.indexOf(domain), 1);
      }
      return currentData;
    });
  },
  removeDomain: async (domain: string) => {
    baseDomainSettingsStorage.set(currentData => {
      if (currentData.alwaysTranslateDomain.includes(domain)) {
        currentData.alwaysTranslateDomain.splice(currentData.alwaysTranslateDomain.indexOf(domain), 1);
      }
      if (currentData.neverTranslateDomain.includes(domain)) {
        currentData.neverTranslateDomain.splice(currentData.neverTranslateDomain.indexOf(domain), 1);
      }
      return currentData;
    });
  },
  getAlwaysTranslateDomain: async (domain: string) => {
    const data = await baseDomainSettingsStorage.get();
    return data.alwaysTranslateDomain.includes(domain);
  },
  getNeverTranslateDomain: async (domain: string) => {
    const data = await baseDomainSettingsStorage.get();
    return data.neverTranslateDomain.includes(domain);
  },
};

type TranslationSettings = {
  translateByDefault: boolean;
  invertUntil: number; // Actually a date, but stored as a number
};

export type TranslationSettingsStorage = BaseStorage<TranslationSettings> & {
  toggleTranslateByDefault: () => Promise<void>;
  setInvertUntil: (invertUntil: Date) => Promise<void>;
  getTranslationActive: () => Promise<boolean>;
};

const baseTranslationSettingsStorage = createStorage<TranslationSettings>(
  'translation-settings-storage',
  {
    translateByDefault: true,
    invertUntil: 0,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const translationSettingsStorage: TranslationSettingsStorage = {
  ...baseTranslationSettingsStorage,
  toggleTranslateByDefault: async () => {
    await baseTranslationSettingsStorage.set(currentData => {
      currentData.translateByDefault = !currentData.translateByDefault;
      currentData.invertUntil = 0; // Reset invertUntil when changing translateByDefault
      return currentData;
    });
  },
  setInvertUntil: async (invertUntil: Date) => {
    await baseTranslationSettingsStorage.set(currentData => {
      currentData.invertUntil = invertUntil.getTime();
      return currentData;
    });
  },
  getTranslationActive: async () => {
    const data = await baseTranslationSettingsStorage.get();
    const invertActive = data.invertUntil > 0 && Date.now() < data.invertUntil;
    return data.translateByDefault !== invertActive;
  },
};

export const welcomeCompletedStorage = createStorage<boolean>('welcome-completed-storage', false, {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});
