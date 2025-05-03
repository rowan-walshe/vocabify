import { useStorage, wanikaniSubjectStylePreferenceStorage } from '@extension/storage';
import { LeftTextSliderCheckbox } from './Sliders';

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

export default OtherSettings;
