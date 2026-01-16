import { createContext, useContext, useState } from 'react';

const PostContext = createContext({
  posts: [],
  setPosts: () => {},
  userPosts: [],
  setUserPosts: () => {},
});

export default function PostContextProvider({ children }) {
  const [posts, _setPosts] = useState(
    JSON.parse(localStorage.getItem('Posts'))
  );
  const setPosts = (posts) => {
    _setPosts(posts);
    if (posts) localStorage.setItem('Posts', JSON.stringify(posts));
    else localStorage.removeItem('Posts');
  };
  return (
    <PostContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostContext.Provider>
  );
}

export const usePostContext = () => useContext(PostContext);
