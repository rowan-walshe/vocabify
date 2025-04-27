import { StorageEnum } from '../base/enums.js';
import { createStorage } from '../base/base.js';
import type { BaseStorage } from '../base/types.js';
import type { StudyMaterialResponse, SubjectType } from '@extension/shared';

interface IdLookup {
  lastUpdated: number | null;
  studyMaterials: {
    [key: number]: StudyMaterialResponse;
  };
}

export type StudyMaterialsStorage = BaseStorage<IdLookup> & {
  updateStudyMaterials: (responses: StudyMaterialResponse[], date: Date) => Promise<void>;
  getStudyMaterial: (id: number) => Promise<StudyMaterialResponse | undefined>;
  getSubjectStudyMaterial: (subject: SubjectType) => Promise<StudyMaterialResponse[]>;
  getAllStudyMaterial: () => Promise<StudyMaterialResponse[]>;
  getLastUpdated: () => Promise<Date | null>;
};

const storage = createStorage<IdLookup>(
  'study-material-storage-key',
  {
    lastUpdated: null,
    studyMaterials: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const studyMaterialsStorage = {
  ...storage,
  updateStudyMaterials: async (responses: StudyMaterialResponse[], date: Date) => {
    const newStudyMaterial: { [key: number]: StudyMaterialResponse } = {};
    for (const response of responses) {
      newStudyMaterial[response.id] = response;
    }
    await storage.set(currentData => {
      currentData.studyMaterials = { ...currentData.studyMaterials, ...newStudyMaterial };
      currentData.lastUpdated = date.getTime();
      return currentData;
    });
  },
  getStudyMaterial: async (id: number) => {
    const data = await storage.get();
    return data.studyMaterials[id];
  },
  getSubjectStudyMaterial: async (subject: SubjectType) => {
    const data = await storage.get();
    return Object.values(data.studyMaterials).filter(x => x.data.subject_type === subject);
  },
  getAllStudyMaterial: async () => {
    const data = await storage.get();
    return Object.values(data);
  },
  getLastUpdated: async () => {
    const data = await storage.get();
    if (!data.lastUpdated) return null;
    return new Date(data.lastUpdated);
  },
};
