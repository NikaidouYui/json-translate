import React, { useState } from 'react';
import '@/components/Drawer.css';

const DrawerToggle = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="drawer-container flex flex-col pb-2">
      <button onClick={toggleDrawer} className="toggle-button">
        {isOpen ? '隐藏文本框' : '显示文本框'}
      </button>

      <div >
        <div className="drawer-content">
          <textarea placeholder="在此输入内容..." ></textarea>
        </div>
      </div>
    </div>
  );
};

export default DrawerToggle;
