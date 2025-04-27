import { createStorage } from '../base/base.js';
import { StorageEnum } from '../base/enums.js';
import type { BaseStorage } from '../base/types.js';
import type { UserResponse } from '@extension/shared';

type UserStorageInfo = {
  lastUpdated: number | null;
  response: UserResponse | null;
};

export type UserStorage = BaseStorage<UserStorageInfo> & {
  setUserResponse: (response: UserResponse, date: Date) => Promise<void>;
  getUserResponse: () => Promise<UserResponse | null>;
  getLastUpdated: () => Promise<Date | null>;
  reset: () => Promise<void>;
};

const baseStorage = createStorage<UserStorageInfo>(
  'user-storage-key',
  {
    lastUpdated: null,
    response: null,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const userStorage: UserStorage = {
  ...baseStorage,
  setUserResponse: async (response: UserResponse, date: Date) => {
    await baseStorage.set(currentData => {
      currentData.response = response;
      currentData.lastUpdated = date.getTime();
      return currentData;
    });
  },
  getUserResponse: async () => {
    const data = await baseStorage.get();
    return data.response;
  },
  getLastUpdated: async () => {
    const data = await baseStorage.get();
    if (!data.lastUpdated) return null;
    return new Date(data.lastUpdated);
  },
  reset: async () => {
    await baseStorage.set(currentData => {
      currentData.response = null;
      currentData.lastUpdated = null;
      return currentData;
    });
  },
};
