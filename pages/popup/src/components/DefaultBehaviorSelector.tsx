import { translationSettingsStorage, useStorage } from '@extension/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { Tooltip, Switch } from 'antd';

const DefaultBehaviorSelector = () => {
  const translationSettings = useStorage(translationSettingsStorage);

  return (
    <div className="p-2">
      <h2 className="font-bold flex items-center">
        Default Behavior
        <Tooltip
          arrow
          title={
            <div className="w-48 text-xs">
              This changes the default behavior of the extension.
              <br />
              <br />
              If enabled, the options in the main tab can be used to disable translation for a period of time, for
              example if you don't want the extension to translate text during a meeting.
              <br />
              <br />
              Conversely, if disabled, the options in the main tab can be used to enable translation for a period of
              time, for example if you only want to use the extension during a set period of practice.
            </div>
          }>
          <FontAwesomeIcon icon={faCircleQuestion} className="ml-1 text-gray-500 text-xs mt-3px" />
        </Tooltip>
      </h2>
      <div className="flex items-center space-x-3 ml-2 mt-2">
        <span className="text-sm">Translate by Default</span>
        <Switch
          checked={translationSettings.translateByDefault}
          onChange={() => translationSettingsStorage.toggleTranslateByDefault()}
        />
      </div>
    </div>
  );
};

export default DefaultBehaviorSelector;
