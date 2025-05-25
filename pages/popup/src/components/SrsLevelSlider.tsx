import { useStorage, wanikaniSrsRangeStorage } from '@extension/storage';
import { type JSX } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faFire } from '@fortawesome/free-solid-svg-icons';
import { Slider } from 'antd';
import type { SliderMarks } from 'antd/es/slider';

const LevelLookup: { [key: number]: string | JSX.Element } = {
  0: <FontAwesomeIcon icon={faLock} />,
  1: 'Apprentice 1',
  2: 'Apprentice 2',
  3: 'Apprentice 3',
  4: 'Apprentice 4',
  5: 'Guru 1',
  6: 'Guru 2',
  7: 'Master',
  8: 'Enlightened',
  9: <FontAwesomeIcon icon={faFire} />,
};

const tooltipFormatter = (value?: number) => {
  if (value === undefined || value < 0 || value > 9) return '';
  return LevelLookup[value];
};

const SrsLevelSlider = () => {
  const srsRange = useStorage(wanikaniSrsRangeStorage);
  const marks: SliderMarks = {
    0: <FontAwesomeIcon icon={faLock} />,
    1: <div className="text-apprentice">A1</div>,
    2: <div className="text-apprentice">A2</div>,
    3: <div className="text-apprentice">A3</div>,
    4: <div className="text-apprentice">A4</div>,
    5: <div className="text-guru">G1</div>,
    6: <div className="text-guru">G2</div>,
    7: <div className="text-master">M</div>,
    8: <div className="text-enlightened">E</div>,
    9: <FontAwesomeIcon icon={faFire} />,
  };
  return (
    <div className="m-2">
      <h2 className="font-bold">SRS Level Range</h2>
      <Slider
        className="mx-3"
        min={0}
        max={9}
        range={true}
        defaultValue={[srsRange.min, srsRange.max]}
        marks={marks}
        tooltip={{ formatter: tooltipFormatter }}
        onChangeComplete={(value: number[]) => {
          wanikaniSrsRangeStorage.setMin(value[0]);
          wanikaniSrsRangeStorage.setMax(value[1]);
        }}
      />
    </div>
  );
};

export default SrsLevelSlider;
