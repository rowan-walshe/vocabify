import type React from 'react';

interface PopupTooltipProps {
  children: React.ReactNode;
  element: React.ReactElement;
}

const PopupTooltip: React.FC<PopupTooltipProps> = ({ children, element }) => {
  return (
    <div className="relative group">
      {element}
      <div className="absolute left-1/2 transform -translate-x-1/2 top-full hidden group-hover:block hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
        {children}
      </div>
    </div>
  );
};

export default PopupTooltip;
