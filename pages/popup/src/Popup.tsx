import { withErrorBoundary, withSuspense } from '@extension/shared';
import { excludedDomainStorage, useStorage } from '@extension/storage';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';

import APIKeyInput from './ApiKeyInput';
import SrsLevelSlider from './SrsLevelSlider';
import SubjectTypeSelector from './SubjectTypeSelector';
import OtherSettings from './OtherSettings';

const Popup = () => {
  return (
    <div className="">
      <div className="flex justify-center">
        <ToggleIcon />
      </div>
      <APIKeyInput />
      <SrsLevelSlider />
      <SubjectTypeSelector />
      <OtherSettings />
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
