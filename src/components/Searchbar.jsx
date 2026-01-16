import React, { useState } from 'react';
import AxiosClient from '../AxiosClient';
import { useNavigate } from 'react-router-dom';
import { usePostContext } from '../contexts/PostContext';
import { useLanguage } from '../contexts/LanguageContext';

function Searchbar() {
  const [type, setType] = useState('rent');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setPosts } = usePostContext();
  const { t } = useLanguage();

  const onsubmit = (e) => {
    e.preventDefault();
    const inputs = new FormData(e.currentTarget);
    const filters = Object.fromEntries(inputs);
    const payload = {
      type: type,
      min: filters.min,
      max: filters.max,
      location: filters.location,
    };
    console.log(payload);
    setLoading(true);
    AxiosClient.get('/post', { params: payload }).then((response) => {
      setLoading(true);
      setPosts(response.data.data);
      console.log(response.data.data);
      navigate('/list');
    });
  };

  return (
    <div className="lg:pr-24">
      <div>
        <button
          className={`px-9 py-4 border dark:border-gray-600 border-r-0 rounded-tl-lg
             ${type === 'buy' ? 'bg-black dark:bg-gray-800 text-white' : 'bg-white dark:bg-gray-800 dark:text-white'}`}
          onClick={() => setType('buy')}
        >
          {t('search.buy')}
        </button>
        <button
          className={`px-9 py-4 border dark:border-gray-600 border-l-0 rounded-tr-lg 
            ${type === 'rent' ? 'bg-black dark:bg-gray-800 text-white' : 'bg-white dark:bg-gray-800 dark:text-white'}`}
          onClick={() => setType('rent')}
        >
          {t('search.rent')}
        </button>
      </div>
      <div>
        <form
          action=""
          className="md:border dark:border-gray-600 flex justify-between h-14 max-md:flex-col max-md:h-auto max-md:mt-1 dark:bg-gray-800"
          onSubmit={onsubmit}
        >
          <input
            type="text"
            placeholder={t('search.location')}
            className="outline-none pl-2.5 w-[200px] max-lg:w-[200px] max-xl:w-[140px] max-md:w-full max-md:p-5 max-md:border-b dark:bg-gray-800 dark:text-white dark:border-gray-600"
            name="location"
          />
          <input
            type="number"
            placeholder={t('search.minPrice')}
            className="outline-none pl-2.5 w-[200px] max-lg:w-[200px] max-xl:w-[140px] max-md:w-full max-md:p-5 max-md:border-b dark:bg-gray-800 dark:text-white dark:border-gray-600"
            name="min"
          />
          <input
            type="number"
            placeholder={t('search.maxPrice')}
            className="outline-none pl-2.5 w-[200px] max-lg:w-[200px] max-xl:w-[140px] max-md:w-full max-md:p-5 max-md:border-b dark:bg-gray-800 dark:text-white dark:border-gray-600"
            name="max"
          />
          <button
            className="bg-[#fece51] dark:bg-yellow-500 flex-1 text-center flex justify-center 
          items-center max-md:p-4 hover:bg-[#e0ab25] dark:hover:bg-yellow-600 transition disabled:bg-[#444] dark:disabled:bg-gray-600"
          >
            <img src="/public/search.png" alt="" className="w-6" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Searchbar;
