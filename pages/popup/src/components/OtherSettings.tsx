import { useStorage, wanikaniSubjectStylePreferenceStorage } from '@extension/storage';
import { Switch } from 'antd';

const OtherSettings = () => {
  const wanikaniSubjectStylePreference = useStorage(wanikaniSubjectStylePreferenceStorage);
  return (
    <div className="m-2">
      <h2 className="font-bold">Other Settings</h2>
      <div className="flex items-center space-x-3 ml-2 mt-2">
        <span className="text-sm">Style Translated Text</span>
        <Switch
          checked={wanikaniSubjectStylePreference}
          onChange={() => wanikaniSubjectStylePreferenceStorage.set(x => !x)}
        />
      </div>
    </div>
  );
};

export default OtherSettings;
