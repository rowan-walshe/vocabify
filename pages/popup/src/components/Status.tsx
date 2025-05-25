import { translationSettingsStorage, domainSettingsStorage, useStorage } from '@extension/storage';
import { useState, useEffect } from 'react';
import { TimePicker } from 'antd';
import type { Dayjs } from 'dayjs';

const Status = () => {
  const translationSettings = useStorage(translationSettingsStorage);
  const domainSettings = useStorage(domainSettingsStorage);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [currentDomain, setCurrentDomain] = useState('');
  const [customDuration, setCustomDuration] = useState<Dayjs | null>(null);

  // Get current domain
  useEffect(() => {
    async function getCurrentDomain() {
      const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
      if (!tab.url) return;
      const url = new URL(tab.url);
      const domain = url.hostname;
      setCurrentDomain(domain);
    }
    getCurrentDomain();
  }, []);

  // Update current time every second when in inverted mode
  useEffect(() => {
    const isInverted = translationSettings.invertUntil > 0 && currentTime < translationSettings.invertUntil;

    if (isInverted) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }

    return undefined;
  }, [translationSettings.invertUntil, currentTime]);

  const handleToggleFor = async (hours: number) => {
    const now = new Date();
    const invertUntil = new Date(now.getTime() + hours * 60 * 60 * 1000);
    await translationSettingsStorage.setInvertUntil(invertUntil);
  };

  const handleCustomToggle = async () => {
    if (!customDuration) return;

    const hours = customDuration.hour();
    const minutes = customDuration.minute();
    const totalMilliseconds = (hours * 60 + minutes) * 60 * 1000;

    const now = new Date();
    const invertUntil = new Date(now.getTime() + totalMilliseconds);
    await translationSettingsStorage.setInvertUntil(invertUntil);
  };

  const handleClearInversion = async () => {
    await translationSettingsStorage.setInvertUntil(new Date(0));
  };

  // Calculate current status
  const isInverted = translationSettings.invertUntil > 0 && currentTime < translationSettings.invertUntil;
  const globalTranslationActive = translationSettings.translateByDefault !== isInverted;

  // Check site-specific overrides
  const isAlwaysTranslateDomain = currentDomain && domainSettings.alwaysTranslateDomain.includes(currentDomain);
  const isNeverTranslateDomain = currentDomain && domainSettings.neverTranslateDomain.includes(currentDomain);

  // Determine status message
  const getStatusMessage = () => {
    if (isAlwaysTranslateDomain) {
      return globalTranslationActive
        ? { text: 'ACTIVE', color: 'bg-green-100 text-green-800' }
        : { text: 'ACTIVE (overridden)', color: 'bg-yellow-100 text-yellow-800' };
    }

    if (isNeverTranslateDomain) {
      return globalTranslationActive
        ? { text: 'INACTIVE (overridden)', color: 'bg-yellow-100 text-yellow-800' }
        : { text: 'INACTIVE', color: 'bg-red-100 text-red-800' };
    }

    return globalTranslationActive
      ? { text: 'ACTIVE', color: 'bg-green-100 text-green-800' }
      : { text: 'INACTIVE', color: 'bg-red-100 text-red-800' };
  };

  const statusMessage = getStatusMessage();

  // Format countdown
  const formatCountdown = (endTime: number) => {
    const remaining = Math.max(0, endTime - currentTime);
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className="m-2">
      <h2 className="font-bold">Status</h2>

      {/* Status Display */}
      <div className="mt-2 mb-3 p-3 bg-gray-100 rounded-lg h-20 flex flex-col justify-start space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Translation:</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusMessage.color}`}>{statusMessage.text}</span>
        </div>

        {isInverted && !isAlwaysTranslateDomain && !isNeverTranslateDomain && (
          <div className="text-sm text-gray-600 flex flex-wrap items-center">
            <span className="font-medium">Inverted mode ends in:</span>
            <span className="ml-1 font-mono text-blue-600 whitespace-nowrap">
              {formatCountdown(translationSettings.invertUntil)}
            </span>
          </div>
        )}

        {!isInverted && !isAlwaysTranslateDomain && !isNeverTranslateDomain && (
          <div className="text-sm text-gray-600">
            Default behavior: {translationSettings.translateByDefault ? 'Translation ON' : 'Translation OFF'}
          </div>
        )}

        {(isAlwaysTranslateDomain || isNeverTranslateDomain) && (
          <div className="text-sm text-gray-600">
            <div className="flex flex-wrap items-center">
              <span className="font-medium">Without site settings:</span>
              <span className="ml-1">{globalTranslationActive ? 'would be ACTIVE' : 'would be INACTIVE'}</span>
            </div>
            {isInverted && (
              <div className="flex flex-wrap items-center">
                <span className="text-blue-600">(inverted for</span>
                <span className="ml-1 font-mono text-blue-600 whitespace-nowrap">
                  {formatCountdown(translationSettings.invertUntil)})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle Section Heading */}
      <h2 className="font-bold">
        {translationSettings.translateByDefault ? 'Temporarily Disable Translation' : 'Temporarily Enable Translation'}
      </h2>

      {/* Toggle Buttons */}
      <div className="space-y-2 mt-2">
        {/* First row - custom duration and clear */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex gap-1">
            <TimePicker
              value={customDuration}
              onChange={setCustomDuration}
              format="HH:mm"
              placeholder="HH:MM"
              placement="bottomLeft"
              size="small"
              needConfirm={false}
              className="flex-1"
              showNow={false}
            />
            <button
              onClick={handleCustomToggle}
              disabled={!customDuration}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
              Go
            </button>
          </div>
          <button
            onClick={handleClearInversion}
            disabled={!isInverted}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
            Reset
          </button>
        </div>

        {/* Second and third rows - preset buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleToggleFor(1)}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {translationSettings.translateByDefault ? 'Disable' : 'Enable'} for 1h
          </button>
          <button
            onClick={() => handleToggleFor(2)}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {translationSettings.translateByDefault ? 'Disable' : 'Enable'} for 2h
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleToggleFor(4)}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {translationSettings.translateByDefault ? 'Disable' : 'Enable'} for 4h
          </button>
          <button
            onClick={() => handleToggleFor(8)}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
            {translationSettings.translateByDefault ? 'Disable' : 'Enable'} for 8h
          </button>
        </div>
      </div>
    </div>
  );
};

export default Status;
