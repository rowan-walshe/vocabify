import { type SubjectType } from '@extension/shared';
import { useStorage, waniKaniSubjectTypeSelectionStorage } from '@extension/storage';

import { RightTextSliderCheckbox } from './Sliders';

const SubjectTypeSelector = () => {
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

export default SubjectTypeSelector;
