import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

function GuestLayout() {
  const { language } = useLanguage();
  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px] overflow-hidden
     flex justify-between h-[calc(100vh-100px)]"
    >
      <Outlet />
      <div className="image-container md:bg-[#fcf5f3] h-full w-2/5 relative max-lg:hidden overflow-hidden">
        <img
          src="/public/bg.png"
          alt=""
          className={`absolute max-w-[110%] max-xl:max-w-[100%] z-0 ${
            language === 'ar' ? 'left-0' : 'right-0'
          }`}
        />
      </div>
    </div>
  );
}

export default GuestLayout;
