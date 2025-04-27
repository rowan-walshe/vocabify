import {
  radicalSubjectStorage,
  kanjiSubjectStorage,
  vocabularySubjectStorage,
  kanaVocabularySubjectStorage,
  wanikaniApiKeyStorage,
  type SubjectStorage,
} from '@extension/storage';
import type {
  SubjectType,
  CollectionResponse,
  SubjectResponse,
  RadicalResponse,
  KanjiResponse,
  VocabularyResponse,
  KanaVocabularyResponse,
  Success,
} from '@extension/shared';
import { getNewUpdatedDate, checkResponseStatus, ResponseStatus, isApiKeySet } from './utils.js';

const BASE_SUBJECT_URL = 'https://api.wanikani.com/v2/subjects/';

async function getSubjects<T extends SubjectResponse>(
  subjectType: SubjectType,
  lastUpdated: Date | null,
): Promise<Success<Array<T>, ResponseStatus>> {
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
  const queryParams: Record<string, string> = {
    types: subjectType,
  };
  if (lastUpdated && lastUpdated instanceof Date) {
    queryParams['updated_after'] = lastUpdated.toJSON();
  }
  const queryParamString = new URLSearchParams(queryParams).toString();

  const subjects: Array<T> = [];

  // Backup to prevent infinite loops
  const visited = new Set();

  let nextUrl: string | null = `${BASE_SUBJECT_URL}?${queryParamString}`;

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
    for (const subject of data.data) {
      subjects.push(subject as T);
    }
    nextUrl = data.pages.next_url;
  }
  return { success: true, value: subjects };
}

export async function updateSubject<T extends SubjectResponse>(
  subjectType: SubjectType,
  subjectStorage: SubjectStorage<T>,
  newUpdatedDate: Date,
): Promise<ResponseStatus> {
  const lastUpdated = await subjectStorage.getLastUpdated();
  const result = await getSubjects<T>(subjectType, lastUpdated);
  if (result.success) {
    await subjectStorage.updateSubjects(result.value, newUpdatedDate);
  }
  return result.success ? ResponseStatus.Success : result.reason;
}

export async function updateAllWaniKaniSubjects() {
  // If the API key is not set, don't bother trying to update the user
  if (!(await isApiKeySet())) return;
  const newUpdatedDate = getNewUpdatedDate();

  let result = ResponseStatus.Success;

  // Update the subjects
  result = await updateSubject<RadicalResponse>('radical', radicalSubjectStorage, newUpdatedDate);
  if (result === ResponseStatus.Unauthorized) return; // Stop if we're unauthorized
  if (result === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit, stopping');
    return;
  }
  result = await updateSubject<KanjiResponse>('kanji', kanjiSubjectStorage, newUpdatedDate);
  if (result === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit, stopping');
    return;
  }
  result = await updateSubject<VocabularyResponse>('vocabulary', vocabularySubjectStorage, newUpdatedDate);
  if (result === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit, stopping');
    return;
  }
  result = await updateSubject<KanaVocabularyResponse>('kana_vocabulary', kanaVocabularySubjectStorage, newUpdatedDate);
  if (result === ResponseStatus.TooManyRequests) {
    console.error('Hit WaniKani rate limit, stopping');
    return;
  }
}
