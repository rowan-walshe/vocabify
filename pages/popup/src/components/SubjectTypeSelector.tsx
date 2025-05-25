import { type SubjectType } from '@extension/shared';
import { useStorage, waniKaniSubjectTypeSelectionStorage } from '@extension/storage';
import { Switch } from 'antd';

const SubjectTypeSelector = () => {
  const subjectTypeSelection = useStorage(waniKaniSubjectTypeSelectionStorage);

  const handleCheckboxChange = async (subject: SubjectType) => {
    await waniKaniSubjectTypeSelectionStorage.toggleSelect(subject);
  };

  return (
    <div className="m-2">
      <h2 className="font-bold">Subject Types to Translate</h2>
      <div className="grid grid-cols-2 gap-2 p-2">
        <div className="flex items-center space-x-3">
          <Switch checked={subjectTypeSelection.radical} onChange={() => handleCheckboxChange('radical')} />
          <span className="text-sm">Radicals</span>
        </div>
        <div className="flex items-center space-x-3">
          <Switch checked={subjectTypeSelection.kanji} onChange={() => handleCheckboxChange('kanji')} />
          <span className="text-sm">Kanji</span>
        </div>
        <div className="flex items-center space-x-3">
          <Switch checked={subjectTypeSelection.vocabulary} onChange={() => handleCheckboxChange('vocabulary')} />
          <span className="text-sm">Vocabulary</span>
        </div>
        <div className="flex items-center space-x-3">
          <Switch
            checked={subjectTypeSelection.kana_vocabulary}
            onChange={() => handleCheckboxChange('kana_vocabulary')}
          />
          <span className="text-sm">Kana Vocabulary</span>
        </div>
      </div>
    </div>
  );
};

export default SubjectTypeSelector;
