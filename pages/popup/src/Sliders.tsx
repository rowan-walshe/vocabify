import { type ChangeEventHandler } from 'react';

export const RightTextSliderCheckbox = ({
  onChange = () => {},
  text = '',
  defaultChecked = false,
}: {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  text?: string;
  defaultChecked?: boolean;
}) => {
  return (
    <div>
      <label className="relative flex items-center">
        <input
          type="checkbox"
          className="peer absolute left-0 h-6 w-10 appearance-none rounded-full"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <span className="mr-2 flex h-6 w-10 shrink-0 items-center rounded-full bg-gray-300 p-0.5 duration-300 ease-in-out after:size-5 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:bg-green-400 peer-checked:after:translate-x-4"></span>
        {text}
      </label>
    </div>
  );
};

export const LeftTextSliderCheckbox = ({
  onChange = () => {},
  text = '',
  defaultChecked = false,
}: {
  onChange?: ChangeEventHandler<HTMLInputElement>;
  text?: string;
  defaultChecked?: boolean;
}) => {
  return (
    <div className="flex">
      <label className="relative flex items-center p-2">
        {text}
        <input
          type="checkbox"
          className="peer absolute right-2 h-6 w-10 appearance-none rounded-full"
          onChange={onChange}
          defaultChecked={defaultChecked}
        />
        <span className="ml-2 flex h-6 w-10 shrink-0 items-center rounded-full bg-gray-300 p-0.5 duration-300 ease-in-out after:size-5 after:rounded-full after:bg-white after:shadow-md after:duration-300 peer-checked:bg-green-400 peer-checked:after:translate-x-4"></span>
      </label>
    </div>
  );
};
