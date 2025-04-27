import { wanikaniApiKeyStorage } from '@extension/storage';

export enum ResponseStatus {
  Success = 200,
  NotModified = 304,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  UnprocessableEntity = 422,
  TooManyRequests = 429,
  InternalServerError = 500,
  ServiceUnavailable = 503,
}

export function checkResponseStatus(response: Response): ResponseStatus {
  if (response.ok) return ResponseStatus.Success;
  if (response.status in ResponseStatus) {
    return response.status as ResponseStatus;
  }
  throw new Error(`Unexpected response status: ${response.status}`);
}

export function getNewUpdatedDate(): Date {
  const result = new Date(Date.now());
  // TODO - Remove this once I learn how to properly account for DST
  result.setHours(result.getHours() - 1);
  return result;
}

export async function isApiKeySet(): Promise<boolean> {
  return (await wanikaniApiKeyStorage.get()) !== '';
}
