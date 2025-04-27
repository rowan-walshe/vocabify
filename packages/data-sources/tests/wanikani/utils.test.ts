import { expect, it, describe, vi } from 'vitest';
import { ResponseStatus, checkResponseStatus, getNewUpdatedDate, isApiKeySet } from '../../lib/wanikani/utils';
import { wanikaniApiKeyStorage } from '@extension/storage';

describe('ResponseStatus', () => {
  it('should have the correct status codes', () => {
    expect(ResponseStatus.Success).toBe(200);
    expect(ResponseStatus.NotModified).toBe(304);
    expect(ResponseStatus.Unauthorized).toBe(401);
    expect(ResponseStatus.Forbidden).toBe(403);
    expect(ResponseStatus.NotFound).toBe(404);
    expect(ResponseStatus.UnprocessableEntity).toBe(422);
    expect(ResponseStatus.TooManyRequests).toBe(429);
    expect(ResponseStatus.InternalServerError).toBe(500);
    expect(ResponseStatus.ServiceUnavailable).toBe(503);
  });
});

describe('checkResponseStatus', () => {
  it('should return Success for successful responses', () => {
    const response = { ok: true, status: 200 } as Response;
    expect(checkResponseStatus(response)).toBe(ResponseStatus.Success);
  });

  it('should return the correct status for known error codes', () => {
    const testCases = [
      { status: 304, expected: ResponseStatus.NotModified },
      { status: 401, expected: ResponseStatus.Unauthorized },
      { status: 403, expected: ResponseStatus.Forbidden },
      { status: 404, expected: ResponseStatus.NotFound },
      { status: 422, expected: ResponseStatus.UnprocessableEntity },
      { status: 429, expected: ResponseStatus.TooManyRequests },
      { status: 500, expected: ResponseStatus.InternalServerError },
      { status: 503, expected: ResponseStatus.ServiceUnavailable },
    ];

    testCases.forEach(({ status, expected }) => {
      const response = { ok: false, status } as Response;
      expect(checkResponseStatus(response)).toBe(expected);
    });
  });

  it('should throw an error for unexpected status codes', () => {
    const response = { ok: false, status: 418 } as Response;
    expect(() => checkResponseStatus(response)).toThrow('Unexpected response status: 418');
  });
});

describe('getNewUpdatedDate', () => {
  it('should return a date one hour behind the current time', () => {
    const now = new Date();
    const result = getNewUpdatedDate();

    // Check that the result is approximately one hour behind
    const expectedTime = now.getTime() - 60 * 60 * 1000;
    const resultTime = result.getTime();

    // Allow for a small margin of error (1 second) due to execution time
    expect(Math.abs(resultTime - expectedTime)).toBeLessThan(1000);
  });
});

describe('isApiKeySet', () => {
  it('should return true when API key is set', async () => {
    vi.spyOn(wanikaniApiKeyStorage, 'get').mockResolvedValue('test-api-key');
    expect(await isApiKeySet()).toBe(true);
  });

  it('should return false when API key is empty', async () => {
    vi.spyOn(wanikaniApiKeyStorage, 'get').mockResolvedValue('');
    expect(await isApiKeySet()).toBe(false);
  });
});
