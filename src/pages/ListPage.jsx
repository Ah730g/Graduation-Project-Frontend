import React, { useEffect, useState } from 'react';
import Filter from '../components/Filter';
import EstateCard from '../components/EstateCard';
import Map from '../components/Map';
import Pagination from '../components/Pagination';
import AxiosClient from '../AxiosClient';
import { usePostContext } from '../contexts/PostContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';

function ListPage() {
  const [properties, setProperties] = useState(null);
  const [loading, setLoading] = useState(true);
  const { posts, setPosts, pagination, setPagination } = usePostContext();
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);

  useEffect(() => {
    AxiosClient.get('/property').then((response) => {
      setProperties(response.data);
    });
    
    // Load posts on initial mount
    if (!posts || posts.length === 0) {
      loadPosts(currentPage);
    }
  }, []);

  // Load posts when page changes
  useEffect(() => {
    if (currentPage) {
      loadPosts(currentPage);
    }
  }, [currentPage]);

  const loadPosts = (page = 1) => {
    setLoading(true);
    const filters = {
      page: page,
      per_page: 10,
    };

    // Get filters from URL params if available
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const min = searchParams.get('min');
    const max = searchParams.get('max');
    const bedroom = searchParams.get('bedroom');
    const property = searchParams.get('property');

    if (location) filters.location = location;
    if (type) filters.type = type;
    if (min) filters.min = min;
    if (max) filters.max = max;
    if (bedroom) filters.bedroom = bedroom;
    if (property) filters.property = property;

    AxiosClient.get('/post', { params: filters })
      .then((response) => {
        setPosts(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading posts:', error);
        setLoading(false);
      });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)] dark:bg-gray-900"
    >
      {loading ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-300 mx-auto"></div>
        </div>
      ) : (
        <>
          <div className={`content lg:w-3/5 flex flex-col gap-12 overflow-y-scroll mb-3 ${
            language === 'ar' ? 'lg:pl-24' : 'lg:pr-24'
          }`}>
            <Filter properties={properties} loading={setLoading} onFilterChange={() => setCurrentPage(1)} />
            {posts && posts.length > 0 ? (
              <>
                <div className="flex flex-col gap-5 mt-5">
                  {posts.map((es) => {
                    return <EstateCard key={es.id} estate={es} />;
                  })}
                </div>
                {pagination && (
                  <Pagination
                    currentPage={pagination.current_page || currentPage}
                    lastPage={pagination.last_page || 1}
                    onPageChange={handlePageChange}
                    loading={loading}
                  />
                )}
                {pagination && (
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Showing {pagination.from || 0} to {pagination.to || 0} of {pagination.total || 0} results
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {t('apartments.noResults') || 'No posts found. Try adjusting your filters.'}
                </p>
              </div>
            )}
          </div>
          <div className="map lg:flex-1 md:bg-[#fcf5f3] dark:md:bg-gray-800">
            <Map data={posts || []} />
          </div>
        </>
      )}
    </div>
  );
}

export default ListPage;
