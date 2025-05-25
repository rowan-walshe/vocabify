import { withErrorBoundary, withSuspense } from '@extension/shared';

import { Tabs } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faGear, faArrowTrendUp } from '@fortawesome/free-solid-svg-icons';
import { welcomeCompletedStorage, useStorage } from '@extension/storage';
import Main from './pages/Main';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import Welcome from './pages/Welcome';

const Popup = () => {
  const welcomeCompleted = useStorage(welcomeCompletedStorage);

  // Show welcome page if user hasn't completed setup yet
  if (!welcomeCompleted) {
    return (
      <div className="app-root">
        <Welcome />
      </div>
    );
  }

  const tabs = [
    {
      label: (
        <div className="flex flex-col">
          <FontAwesomeIcon icon={faHouse} />
          Home
        </div>
      ),
      key: '1',
      children: <Main />,
    },
    {
      label: (
        <div className="flex flex-col">
          <FontAwesomeIcon icon={faArrowTrendUp} />
          Stats
        </div>
      ),
      key: '2',
      children: <Stats />,
    },
    {
      label: (
        <div className="flex flex-col">
          <FontAwesomeIcon icon={faGear} />
          Settings
        </div>
      ),
      key: '3',
      children: <Settings />,
    },
  ];

  return (
    <div className="app-root">
      <Tabs tabPosition="bottom" centered items={tabs} />
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <div></div>), <div> Error Occur </div>);
