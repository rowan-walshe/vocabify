import { userStorage, wanikaniApiKeyStorage } from '@extension/storage';
import { ResponseStatus, checkResponseStatus, getNewUpdatedDate, isApiKeySet } from './utils.js';
import type { UserResponse, Success } from '@extension/shared';

const BASE_USER_URL = 'https://api.wanikani.com/v2/user';

async function getUser(lastUpdated: Date | null): Promise<Success<UserResponse, ResponseStatus>> {
  const apiKey = await wanikaniApiKeyStorage.get();
  const headers: HeadersInit = {
    'Wanikani-Revision': '20170710',
    Authorization: `Bearer ${apiKey}`,
  };
  if (lastUpdated) {
    headers['If-Modified-Since'] = lastUpdated.toISOString();
  }
  const response = await fetch(BASE_USER_URL, {
    method: 'Get',
    headers: headers,
  });
  const status = checkResponseStatus(response);
  if (status !== ResponseStatus.Success) {
    return { success: false, reason: status };
  }
  const data: UserResponse = await response.json();
  return { success: true, value: data };
}

export async function updateWaniKaniUser() {
  // If the API key is not set, don't bother trying to update the user
  if (!(await isApiKeySet())) {
    await userStorage.reset();
    return;
  }

  const newUpdatedDate = getNewUpdatedDate();
  const lastUpdated = await userStorage.getLastUpdated();
  const result = await getUser(lastUpdated);
  if (!result.success && result.reason === ResponseStatus.NotModified) return;
  if (!result.success) {
    console.error(`Failed to update WaniKani user: ${result.reason}`);
    return;
  }
  await userStorage.setUserResponse(result.value, newUpdatedDate);
}
