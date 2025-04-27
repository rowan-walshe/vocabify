import { wanikaniApiKeyStorage, assignmentStorage } from '@extension/storage';
import type { AssignmentResponse, CollectionResponse, Success } from '@extension/shared';
import { getNewUpdatedDate, checkResponseStatus, ResponseStatus, isApiKeySet } from './utils.js';

const BASE_ASSIGNMENT_URL = 'https://api.wanikani.com/v2/assignments/';

async function getAssignments(lastUpdated: Date | null): Promise<Success<Array<AssignmentResponse>, ResponseStatus>> {
  // Create the headers for the requests
  const apiKey = await wanikaniApiKeyStorage.get();
  const headers: HeadersInit = {
    'Wanikani-Revision': '20170710',
    Authorization: `Bearer ${apiKey}`,
  };
  if (lastUpdated && lastUpdated instanceof Date) {
    headers['If-Modified-Since'] = lastUpdated.toISOString();
  }

  // Create the query parameters for the requests
  const queryParamString = lastUpdated
    ? `?${new URLSearchParams({ updated_after: lastUpdated.toJSON() }).toString()}`
    : '';

  let nextUrl: string | null = `${BASE_ASSIGNMENT_URL}${queryParamString}`;
  const assignments: Array<AssignmentResponse> = [];

  // Backup to prevent infinite loops
  const visited = new Set();

  // Loop until we've visited all the pages
  while (nextUrl && !visited.has(nextUrl)) {
    visited.add(nextUrl);
    const response = await fetch(nextUrl, {
      method: 'Get',
      headers: headers,
    });
    const status = checkResponseStatus(response);
    if (status === ResponseStatus.NotModified) {
      return { success: true, value: [] };
    }
    if (status !== ResponseStatus.Success) {
      return { success: false, reason: status };
    }
    const data: CollectionResponse = await response.json();
    for (const assignment of data.data) {
      assignments.push(assignment as AssignmentResponse);
    }
    nextUrl = data.pages.next_url;
  }
  return { success: true, value: assignments };
}

export async function updateAllWaniKaniAssignments() {
  // If the API key is not set, don't bother trying to update the user
  if (!(await isApiKeySet())) {
    await assignmentStorage.reset();
    return;
  }
  const newUpdatedDate = getNewUpdatedDate();
  const lastUpdated = await assignmentStorage.getLastUpdated();

  const result = await getAssignments(lastUpdated);
  if (result.success) {
    await assignmentStorage.updateAssignments(result.value, newUpdatedDate);
  } else if (result.reason === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit');
  }
}
