import { createContext, useContext, useState } from 'react';

const PostContext = createContext({
  posts: [],
  setPosts: () => {},
  pagination: null,
  setPagination: () => {},
  userPosts: [],
  setUserPosts: () => {},
});

export default function PostContextProvider({ children }) {
  const [posts, _setPosts] = useState(
    JSON.parse(localStorage.getItem('Posts')) || []
  );
  const [pagination, _setPagination] = useState(
    JSON.parse(localStorage.getItem('PostsPagination')) || null
  );
  
  const setPosts = (posts) => {
    _setPosts(posts);
    if (posts) localStorage.setItem('Posts', JSON.stringify(posts));
    else localStorage.removeItem('Posts');
  };
  
  const setPagination = (paginationData) => {
    _setPagination(paginationData);
    if (paginationData) localStorage.setItem('PostsPagination', JSON.stringify(paginationData));
    else localStorage.removeItem('PostsPagination');
  };
  
  return (
    <PostContext.Provider value={{ posts, setPosts, pagination, setPagination }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePostContext = () => useContext(PostContext);
