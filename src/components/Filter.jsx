import React from 'react';
import AxiosClient from '../AxiosClient';
import { usePostContext } from '../contexts/PostContext';

function Filter({ properties, loading }) {
  const { setPosts } = usePostContext();

  const onSubmit = (e) => {
    e.preventDefault();
    const inputs = new FormData(e.target);
    const data = Object.fromEntries(inputs);
    const payload = {
      type: data.type,
      min: data.min,
      max: data.max,
      location: data.location,
      bedroom: data.bedroom,
      property: data.property,
    };
    loading(true);
    AxiosClient.get('/post', { params: payload })
      .then((response) => {
        setPosts(response.data.data);
        loading(false);
      })
      .catch((error) => {
        console.log(error);
        loading(false);
      });
  };
  return (
    <form onSubmit={onSubmit}>
      <h2 className="text-2xl font-light mb-2 dark:text-white">
        Search result for <b>Sanna'a</b>
      </h2>
      <div className="top flex flex-col gap-1">
        <label htmlFor="city" className="dark:text-gray-200">Location</label>
        <input
          type="text"
          id="city"
          placeholder="City Location"
          className="py-2 pl-2 border dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none rounded-md"
          name="location"
        />
      </div>
      <div className="bottom flex justify-between mt-1 gap-5">
        <div>
          <label htmlFor="type" className="text-sm dark:text-gray-200">
            Type
          </label>
          <select
            name="type"
            id="type"
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white w-24 py-2 pl-1 outline-none rounded-md"
          >
            <option value="">Any</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </div>
        <div>
          <label htmlFor="property" className="text-sm dark:text-gray-200">
            Property
          </label>
          <select
            id="property"
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white w-24 py-2 pl-1 outline-none rounded-md"
            name="property"
          >
            {properties && properties.map((e) => {
              return <option key={e.id} value={e.id}>{e.name}</option>;
            })}
          </select>
        </div>
        <div>
          <label htmlFor="maxPrice" className="text-sm dark:text-gray-200">
            Max Price
          </label>
          <input
            type="number"
            placeholder="any"
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white w-24 py-2 pl-1 outline-none rounded-md"
            name="max"
          />
        </div>
        <div>
          <label htmlFor="minPrice" className="text-sm dark:text-gray-200">
            Min Price
          </label>
          <input
            type="number"
            placeholder="any"
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white w-24 py-2 pl-1 outline-none rounded-md"
            name="min"
          />
        </div>
        <div>
          <label htmlFor="bedroom" className="text-sm dark:text-gray-200">
            Bedrooms
          </label>
          <input
            type="number"
            placeholder="any"
            className="border dark:border-gray-600 dark:bg-gray-800 dark:text-white w-24 py-2 pl-1 outline-none rounded-md"
            name="bedroom"
          />
        </div>
        <button className="bg-yellow-400 dark:bg-yellow-500 px-7">
          <img src="/public/search.png" alt="" />
        </button>
      </div>
    </form>
  );
}

export default Filter;
