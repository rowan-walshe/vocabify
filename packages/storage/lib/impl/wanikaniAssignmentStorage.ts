import { StorageEnum } from '../base/enums.js';
import { createStorage } from '../base/base.js';
import type { BaseStorage } from '../base/types.js';
import type { AssignmentResponse } from '@extension/shared';

interface IdLookup {
  lastUpdated: number | null;
  assignments: {
    [key: number]: AssignmentResponse;
  };
}

export type AssignmentStorage = BaseStorage<IdLookup> & {
  updateAssignments: (responses: AssignmentResponse[], date: Date) => Promise<void>;
  getAssignments: (filter?: (assignment: AssignmentResponse) => boolean) => Promise<AssignmentResponse[]>;
  getLastUpdated: () => Promise<Date | null>;
  reset: () => Promise<void>;
};

const storage = createStorage<IdLookup>(
  'assignment-storage-key',
  {
    lastUpdated: null,
    assignments: {},
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const assignmentStorage: AssignmentStorage = {
  ...storage,
  updateAssignments: async (responses: AssignmentResponse[], date: Date) => {
    const newAssignments: { [key: number]: AssignmentResponse } = {};
    for (const response of responses) {
      newAssignments[response.id] = response;
    }
    await storage.set(currentData => {
      currentData.assignments = { ...currentData.assignments, ...newAssignments };
      currentData.lastUpdated = date.getTime();
      return currentData;
    });
  },
  getAssignments: async (filter?: (assignment: AssignmentResponse) => boolean) => {
    const data = await storage.get();
    return Object.values(data.assignments).filter(filter || (() => true));
  },
  getLastUpdated: async () => {
    const data = await storage.get();
    if (!data.lastUpdated) return null;
    return new Date(data.lastUpdated);
  },
  reset: async () => {
    await storage.set(currentData => {
      currentData.assignments = {};
      currentData.lastUpdated = null;
      return currentData;
    });
  },
};
