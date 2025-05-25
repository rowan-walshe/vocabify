import { wanikaniApiKeyStorage, useStorage } from '@extension/storage';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'antd';

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
    <div className="m-2">
      <h2 className="font-bold flex items-center text-xs">
        WaniKani API Key
        <Tooltip
          arrow
          title={
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
              The API key doesn't need any additional permissions. When creating the key, you can leave all of the boxes
              unchecked.
            </div>
          }>
          <FontAwesomeIcon icon={faCircleQuestion} className="ml-1 text-gray-500 text-xs mt-3px" />
        </Tooltip>
      </h2>
      <div className="flex mt-1">
        <div className="flex w-full justify-end relative">
          <input
            className="w-full rounded border border-gray-300 p-2 pr-7 text-xs"
            type={inputType}
            defaultValue={apiKey}
            onChange={e => setNewApiKey(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                saveApiKey();
              }
            }}
            placeholder="Enter your WaniKani API key here"
          />
          {/* Gradient overlay to fade text under the eye button */}
          <div className="absolute right-7 top-0.5 bottom-0.5 w-10 pointer-events-none" />
          <FontAwesomeIcon
            icon={eyeIcon}
            onClick={togglePasswordVisibility}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 select-none cursor-pointer text-gray-400 z-10"
          />
        </div>
        <button
          onClick={saveApiKey}
          disabled={saving}
          className="ml-2 w-20 rounded bg-blue-500 font-bold text-white text-xs shadow">
          {savingText}
        </button>
      </div>
    </div>
  );
};

export default APIKeyInput;
