import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { RouterProvider } from 'react-router-dom';
import route from './Routes.jsx';
import UserContextProvider from './contexts/UserContext.jsx';
import PostContextProvider from './contexts/PostContext.jsx';
import LanguageProvider from './contexts/LanguageContext.jsx';
import { PopupProvider } from './contexts/PopupContext.jsx';
import DarkModeProvider from './contexts/DarkModeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DarkModeProvider>
      <LanguageProvider>
        <UserContextProvider>
          <PostContextProvider>
            <PopupProvider>
              <RouterProvider router={route} />
            </PopupProvider>
          </PostContextProvider>
        </UserContextProvider>
      </LanguageProvider>
    </DarkModeProvider>
  </StrictMode>
);
