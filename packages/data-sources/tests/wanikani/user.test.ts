import { expect, it, describe, vi, beforeEach } from 'vitest';
import { updateWaniKaniUser } from '../../lib/wanikani/user';
import { userStorage } from '@extension/storage';
import { ResponseStatus, isApiKeySet, checkResponseStatus, getNewUpdatedDate } from '../../lib/wanikani/utils';

// Mock the storage modules
vi.mock('@extension/storage', () => ({
  wanikaniApiKeyStorage: {
    get: vi.fn(),
  },
  userStorage: {
    getLastUpdated: vi.fn(),
    setUserResponse: vi.fn(),
  },
}));

// Mock the utils module
vi.mock('../../lib/wanikani/utils', () => ({
  ResponseStatus: {
    Success: 200,
    NotModified: 304,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    UnprocessableEntity: 422,
    TooManyRequests: 429,
    InternalServerError: 500,
    ServiceUnavailable: 503,
  },
  checkResponseStatus: vi.fn(),
  getNewUpdatedDate: vi.fn(),
  isApiKeySet: vi.fn(),
}));

describe('updateWaniKaniUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user data on successful response', async () => {
    const mockUserData = { id: '123', username: 'testuser' };
    const mockNewDate = new Date();

    vi.mocked(isApiKeySet).mockResolvedValue(true);
    vi.mocked(userStorage.getLastUpdated).mockResolvedValue(new Date());
    vi.mocked(checkResponseStatus).mockReturnValue(ResponseStatus.Success);
    vi.mocked(getNewUpdatedDate).mockReturnValue(mockNewDate);

    // Mock the fetch response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUserData),
    });

    await updateWaniKaniUser();

    expect(userStorage.setUserResponse).toHaveBeenCalledWith(mockUserData, mockNewDate);
  });

  it('should log error on failed response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(isApiKeySet).mockResolvedValue(true);
    vi.mocked(userStorage.getLastUpdated).mockResolvedValue(new Date());
    vi.mocked(checkResponseStatus).mockReturnValue(ResponseStatus.InternalServerError);

    await updateWaniKaniUser();

    expect(consoleSpy).toHaveBeenCalledWith('Failed to update WaniKani user: 500');
    expect(userStorage.setUserResponse).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should handle various error status codes', async () => {
    const errorStatuses = [
      ResponseStatus.Unauthorized,
      ResponseStatus.Forbidden,
      ResponseStatus.NotFound,
      ResponseStatus.UnprocessableEntity,
      ResponseStatus.TooManyRequests,
      ResponseStatus.ServiceUnavailable,
    ];

    vi.mocked(isApiKeySet).mockResolvedValue(true);
    vi.mocked(userStorage.getLastUpdated).mockResolvedValue(new Date());

    for (const status of errorStatuses) {
      vi.mocked(checkResponseStatus).mockReturnValue(status);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await updateWaniKaniUser();

      expect(consoleSpy).toHaveBeenCalledWith(`Failed to update WaniKani user: ${status}`);
      expect(userStorage.setUserResponse).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    }
  });
});
