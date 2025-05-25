import APIKeyInput from '@src/components/ApiKeyInput';
import DefaultBehaviorSelector from '@src/components/DefaultBehaviorSelector';
import SrsLevelSlider from '@src/components/SrsLevelSlider';
import SubjectTypeSelector from '@src/components/SubjectTypeSelector';
import OtherSettings from '@src/components/OtherSettings';

const Settings = () => {
  return (
    <div className="page-height">
      <DefaultBehaviorSelector />
      <APIKeyInput />
      <SrsLevelSlider />
      <SubjectTypeSelector />
      <OtherSettings />
    </div>
  );
};

export default Settings;
