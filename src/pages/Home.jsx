import React from 'react';
import Searchbar from '../components/Searchbar';
import { useLanguage } from '../contexts/LanguageContext';

function Home() {
  const { t, language } = useLanguage();
  return (
    <>
      <div className="content-container flex-1 gap-5 flex flex-col justify-center max-md:justify-start">
        <h1 className={`max-w-xl text-6xl font-bold max-xl:text-5xl dark:text-white ${
          language === 'ar' ? 'lg:pl-14' : 'lg:pr-14'
        }`}>
          {t('home.title')}
        </h1>
        <p className={`text-sm dark:text-gray-300 ${
          language === 'ar' ? 'lg:pl-24' : 'lg:pr-24'
        }`}>
          {t('home.description')}
        </p>
        <Searchbar />
        <div className={`boxes flex justify-between max-md:hidden ${
          language === 'ar' ? 'pl-24' : 'pr-24'
        }`}>
          <div>
            <h1 className="text-4xl font-bold dark:text-white">16+</h1>
            <h2 className="text-xl font-light dark:text-gray-300">{t('home.yearsExperience')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold dark:text-white">200</h1>
            <h2 className="text-xl font-light dark:text-gray-300">{t('home.yearsExperience')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold dark:text-white">2000+</h1>
            <h2 className="text-xl font-light dark:text-gray-300">{t('home.yearsExperience')}</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
