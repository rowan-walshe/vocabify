import { type SubjectType, withErrorBoundary, withSuspense } from '@extension/shared';
import {
  excludedDomainStorage,
  wanikaniApiKeyStorage,
  useStorage,
  wanikaniSrsRangeStorage,
  waniKaniSubjectTypeSelectionStorage,
  wanikaniSubjectStylePreferenceStorage,
} from '@extension/storage';
import { useState, useEffect, type ChangeEventHandler } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage, faLock, faFire } from '@fortawesome/free-solid-svg-icons';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { Slider } from 'antd';
import type { SliderMarks } from 'antd/es/slider';

const Popup = () => {
  return (
    <div className="">
      <div className="flex justify-center">
        <ToggleIcon />
      </div>
      <APIKeyInput />
      <SrsLevelSlider />
      <SubjectTypeSelection />
      <OtherSettings />
    </div>
  );
};

const RightTextSliderCheckbox = ({
  onChange = () => {},
  text = '',
  defaultChecked = false,
}: {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  text?: string;
  defaultChecked?: boolean;
}) => {
  return (
    <div>
      <label className="relative flex items-center">
        <input
          type="checkbox"
          className="peer absolute left-0 h-6 w-10 appearance-none rounded-full"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <span className="mr-2 flex h-6 w-10 shrink-0 items-center rounded-full bg-gray-300 p-0.5 duration-300 ease-in-out after:size-5 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:bg-green-400 peer-checked:after:translate-x-4"></span>
        {text}
      </label>
    </div>
  );
};

const LeftTextSliderCheckbox = ({
  onChange = () => {},
  text = '',
  defaultChecked = false,
}: {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  text?: string;
  defaultChecked?: boolean;
}) => {
  return (
    <div className="flex">
      <label className="relative flex items-center p-2">
        {text}
        <input
          type="checkbox"
          className="peer absolute right-2 h-6 w-10 appearance-none rounded-full"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <span className="ml-2 flex h-6 w-10 shrink-0 items-center rounded-full bg-gray-300 p-0.5 duration-300 ease-in-out after:size-5 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:bg-green-400 peer-checked:after:translate-x-4"></span>
      </label>
    </div>
  );
};

const OtherSettings = () => {
  const wanikaniSubjectStylePreference = useStorage(wanikaniSubjectStylePreferenceStorage);
  return (
    <div>
      <h2 className="ml-2 font-bold">Other Settings</h2>
      <LeftTextSliderCheckbox
        text="Style Translated Text"
        defaultChecked={wanikaniSubjectStylePreference}
        onChange={() => wanikaniSubjectStylePreferenceStorage.set(x => !x)}
      />
    </div>
  );
};

const SubjectTypeSelection = () => {
  const subjectTypeSelection = useStorage(waniKaniSubjectTypeSelectionStorage);

  const handleCheckboxChange = async (subject: SubjectType) => {
    await waniKaniSubjectTypeSelectionStorage.toggleSelect(subject);
  };

  return (
    <div>
      <h2 className="ml-2 font-bold">Subject Types to Translate</h2>
      <div className="grid grid-cols-2 gap-2 p-2">
        <RightTextSliderCheckbox
          text="Radicals"
          defaultChecked={subjectTypeSelection.radical}
          onChange={() => handleCheckboxChange('radical')}
        />
        <RightTextSliderCheckbox
          text="Kanji"
          defaultChecked={subjectTypeSelection.kanji}
          onChange={() => handleCheckboxChange('kanji')}
        />
        <RightTextSliderCheckbox
          text="Vocabulary"
          defaultChecked={subjectTypeSelection.vocabulary}
          onChange={() => handleCheckboxChange('vocabulary')}
        />
        <RightTextSliderCheckbox
          text="Kana Vocabulary"
          defaultChecked={subjectTypeSelection.kana_vocabulary}
          onChange={() => handleCheckboxChange('kana_vocabulary')}
        />
      </div>
    </div>
  );
};

const LevelLookup: { [key: number]: string | JSX.Element } = {
  0: <FontAwesomeIcon icon={faLock} />,
  1: 'Apprentice 1',
  2: 'Apprentice 2',
  3: 'Apprentice 3',
  4: 'Apprentice 4',
  5: 'Guru 1',
  6: 'Guru 2',
  7: 'Master',
  8: 'Enlightened',
  9: <FontAwesomeIcon icon={faFire} />,
};

const tooltipFormatter = (value?: number) => {
  if (value === undefined || value < 0 || value > 9) return '';
  return LevelLookup[value];
};

const SrsLevelSlider = () => {
  const srsRange = useStorage(wanikaniSrsRangeStorage);
  const marks: SliderMarks = {
    0: <FontAwesomeIcon icon={faLock} />,
    1: <div className="text-apprentice">A1</div>,
    2: <div className="text-apprentice">A2</div>,
    3: <div className="text-apprentice">A3</div>,
    4: <div className="text-apprentice">A4</div>,
    5: <div className="text-guru">G1</div>,
    6: <div className="text-guru">G2</div>,
    7: <div className="text-master">M</div>,
    8: <div className="text-enlightened">E</div>,
    9: <FontAwesomeIcon icon={faFire} />,
  };
  return (
    <div>
      <h2 className="ml-2 font-bold">SRS Level Range</h2>
      <Slider
        className="mx-4"
        min={0}
        max={9}
        range={true}
        defaultValue={[srsRange.min, srsRange.max]}
        marks={marks}
        tooltip={{ formatter: tooltipFormatter }}
        onChangeComplete={(value: number[]) => {
          wanikaniSrsRangeStorage.setMin(value[0]);
          wanikaniSrsRangeStorage.setMax(value[1]);
        }}
      />
    </div>
  );
};

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
      <h2 className="ml-2 font-bold">WaniKani API Key</h2>
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

const ToggleIcon = () => {
  const [currentDomain, setCurrentDomain] = useState('');
  const excludedDomains = useStorage(excludedDomainStorage);

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

  const styleClass =
    currentDomain !== '' && excludedDomains.includes(currentDomain)
      ? 'select-none text-red-600'
      : 'select-none text-green-600';

  const toggleDomain = async () => {
    if (currentDomain) {
      await excludedDomainStorage.toggleDomain(currentDomain);
    }
  };

  return <FontAwesomeIcon icon={faLanguage} className={styleClass} onClick={toggleDomain} size="10x" />;
};

export default withErrorBoundary(withSuspense(Popup, <div> Loading ... </div>), <div> Error Occur </div>);
