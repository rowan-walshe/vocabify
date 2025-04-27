import { wanikaniApiKeyStorage, studyMaterialsStorage } from '@extension/storage';
import type { CollectionResponse, StudyMaterialResponse, Success } from '@extension/shared';
import { getNewUpdatedDate, checkResponseStatus, ResponseStatus, isApiKeySet } from './utils.js';

const BASE_STUDY_MATERIALS_URL = 'https://api.wanikani.com/v2/study_materials/';

async function getStudyMaterials(
  lastUpdated: Date | null,
): Promise<Success<Array<StudyMaterialResponse>, ResponseStatus>> {
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

  let nextUrl: string | null = `${BASE_STUDY_MATERIALS_URL}${queryParamString}`;
  const studyMaterials: Array<StudyMaterialResponse> = [];

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
    for (const studyMaterial of data.data) {
      studyMaterials.push(studyMaterial as StudyMaterialResponse);
    }
    nextUrl = data.pages.next_url;
  }
  return { success: true, value: studyMaterials };
}

export async function updateAllWaniKaniAssignments() {
  // If the API key is not set, don't bother trying to update the user
  if (!(await isApiKeySet())) return;
  const newUpdatedDate = getNewUpdatedDate();
  const lastUpdated = await studyMaterialsStorage.getLastUpdated();

  const result = await getStudyMaterials(lastUpdated);
  if (result.success) {
    await studyMaterialsStorage.updateStudyMaterials(result.value, newUpdatedDate);
  } else if (result.reason === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit');
  }
}
