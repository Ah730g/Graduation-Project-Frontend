import React from 'react';
import Searchbar from '../components/Searchbar';
import { useLanguage } from '../contexts/LanguageContext';

function Home() {
  const { t, language } = useLanguage();
  
  return (
    <>
      <div className="content-container flex-1 gap-6 flex flex-col justify-center max-md:justify-start relative z-10">
        <h1 
          className={`max-w-xl text-6xl font-bold max-xl:text-5xl dark:text-white ${
            language === 'ar' ? 'lg:pr-24' : 'lg:pl-24'
          }`}
        >
          {t('home.title')}
        </h1>
        <p 
          className={`text-sm dark:text-gray-300 ${
            language === 'ar' ? 'lg:pr-24' : 'lg:pl-24'
          }`}
        >
          {t('home.description')}
        </p>
        <Searchbar />
        <div 
          className={`boxes flex justify-between max-md:hidden gap-6 mt-4 ${
            language === 'ar' ? 'pr-24' : 'pl-24'
          }`}
        >
          <div>
            <h1 className="text-4xl font-bold dark:text-white mb-1">5000+</h1>
            <h2 className="text-sm font-light dark:text-gray-300 leading-tight">{t('home.apartmentsCount')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold dark:text-white mb-1">10,000+</h1>
            <h2 className="text-sm font-light dark:text-gray-300 leading-tight">{t('home.clientsCount')}</h2>
          </div>
          <div>
            <h1 className="text-4xl font-bold dark:text-white mb-1">25,000+</h1>
            <h2 className="text-sm font-light dark:text-gray-300 leading-tight">{t('home.transactionsCount')}</h2>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
