import React, { useEffect, useState } from 'react';
import Filter from '../components/Filter';
import EstateCard from '../components/EstateCard';
import Map from '../components/Map';
import AxiosClient from '../AxiosClient';
import { usePostContext } from '../contexts/PostContext';
import { useLanguage } from '../contexts/LanguageContext';

function ListPage() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const { posts } = usePostContext();
  const { t, language } = useLanguage();

  useEffect(() => {
    AxiosClient.get('/property').then((response) => {
      setProperties(response.data);
      setLoading(false);
      console.log(posts);
    });
  }, []);
  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)] dark:bg-gray-900"
    >
      {loading ? (
        <div className={`text-3xl text-green-600 font-bold absolute top-1/2 ${
          language === 'ar' 
            ? 'left-1/2 -translate-x-1/2' 
            : 'right-1/2 translate-x-1/2'
        }`}>
          {t('common.loading')}
        </div>
      ) : (
        <>
          <div className={`content lg:w-3/5 flex flex-col gap-12 overflow-y-scroll mb-3 ${
            language === 'ar' ? 'lg:pl-24' : 'lg:pr-24'
          }`}>
            <Filter properties={properties} loading={setLoading} />
            <div className="flex flex-col gap-5 mt-5">
              {posts.map((es) => {
                return <EstateCard key={es.id} estate={es} />;
              })}
            </div>
          </div>
          <div className="map lg:flex-1 md:bg-[#fcf5f3] dark:md:bg-gray-800">
            <Map data={posts} />
          </div>
        </>
      )}
    </div>
  );
}

export default ListPage;
