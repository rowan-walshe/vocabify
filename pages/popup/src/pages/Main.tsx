// import { domainSettingsStorage, translationSettingsStorage, useStorage } from '@extension/storage';
// import { useState, useEffect, ChangeEventHandler, ChangeEvent } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faLanguage } from '@fortawesome/free-solid-svg-icons';

// import { LeftTextSliderCheckbox, RightTextSliderCheckbox } from '@src/components/Sliders';

import Status from '@src/components/Status';
import SiteOptions from '@src/components/SiteOptions';

// import { LeftTextSliderCheckbox } from '@src/components/Sliders';

const Main = () => {
  return (
    <div className="flex flex-col justify-start page-height">
      <Status />
      <SiteOptions />
    </div>
  );
};

export default Main;
