import { wanikaniApiKeyStorage, useStorage } from '@extension/storage';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';

import PopupTooltip from './PopupTooltip';

const APIKeyInput = () => {
  const [apiVisible, setApiVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingText, setSavingText] = useState('Save');
  const apiKey = useStorage(wanikaniApiKeyStorage);
  const [newApiKey, setNewApiKey] = useState(apiKey);

  const saveApiKey = async () => {
    setSaving(true);
    await wanikaniApiKeyStorage.set(newApiKey);
    setSavingText('Saved!');
    setTimeout(() => {
      setSavingText('Save');
      setSaving(false);
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setApiVisible(!apiVisible);
  };

  const eyeIcon = apiVisible ? faEye : faEyeSlash;
  const inputType = apiVisible ? 'text' : 'password';

  return (
    <div>
      <h2 className="ml-2 font-bold flex items-center">
        WaniKani API Key
        <PopupTooltip
          element={<FontAwesomeIcon icon={faCircleQuestion} className="ml-1 text-gray-500 text-xs mt-3px" />}>
          <div className="w-48 text-xs">
            You can create an API from your{' '}
            <a
              href="https://www.wanikani.com/settings/personal_access_tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline">
              WaniKani settings
            </a>{' '}
            page.
            <br />
            You do you not need to give the API key any additional permissions. You can leave all of the boxes unchecked
            when creating the key.
          </div>
        </PopupTooltip>
      </h2>
      <div className="flex p-2">
        <div className="flex w-full justify-end">
          <input
            type={inputType}
            defaultValue={apiKey}
            onChange={e => setNewApiKey(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                saveApiKey();
              }
            }}
            placeholder="Enter your WaniKani API key here"
            className="w-full rounded border border-gray-300 p-2"
          />
          <FontAwesomeIcon
            icon={eyeIcon}
            onClick={togglePasswordVisibility}
            className="absolute mr-2 w-4 select-none self-center text-gray-400"
          />
        </div>
        <button
          onClick={saveApiKey}
          disabled={saving}
          className="ml-2 w-20 rounded bg-blue-500 font-bold text-white shadow">
          {savingText}
        </button>
      </div>
    </div>
  );
};

export default APIKeyInput;
