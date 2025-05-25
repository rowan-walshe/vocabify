import { domainSettingsStorage, useStorage } from '@extension/storage';
import { useEffect, useState } from 'react';
import { Switch } from 'antd';

const SiteOptions = () => {
  const [currentDomain, setCurrentDomain] = useState('');
  const domainSettings = useStorage(domainSettingsStorage);
  const [neverTranslateDomainUI, setNeverTranslateDomainUI] = useState(false);
  const [alwaysTranslateDomainUI, setAlwaysTranslateDomainUI] = useState(false);

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

  useEffect(() => {
    if (currentDomain) {
      setNeverTranslateDomainUI(domainSettings.neverTranslateDomain.includes(currentDomain));
      setAlwaysTranslateDomainUI(domainSettings.alwaysTranslateDomain.includes(currentDomain));
    }
  }, [currentDomain, domainSettings]);

  return (
    <div className="ml-2 mb-2">
      <h2 className="font-bold">Site Options</h2>
      <div className="flex flex-col space-y-3 mt-2">
        <div className="flex items-center">
          <span className="text-sm w-44">Never Translate This Site</span>
          <Switch
            checked={neverTranslateDomainUI}
            onChange={() => {
              if (!neverTranslateDomainUI) {
                setAlwaysTranslateDomainUI(false);
              }
              setNeverTranslateDomainUI(!neverTranslateDomainUI);
              domainSettingsStorage.toggleNeverTranslateDomain(currentDomain);
            }}
          />
        </div>
        <div className="flex items-center">
          <span className="text-sm w-44">Always Translate This Site</span>
          <Switch
            checked={alwaysTranslateDomainUI}
            onChange={() => {
              if (!alwaysTranslateDomainUI) {
                setNeverTranslateDomainUI(false);
              }
              setAlwaysTranslateDomainUI(!alwaysTranslateDomainUI);
              domainSettingsStorage.toggleAlwaysTranslateDomain(currentDomain);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SiteOptions;
