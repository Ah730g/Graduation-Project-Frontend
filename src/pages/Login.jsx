import React, { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

function Login() {
  const { setUser, setToken, token } = useUserContext();
  const { t } = useLanguage();
  const [errors, setErrors] = useState(null);
  const refEmail = useRef();
  const refPassword = useRef();
  const [loading, setLoading] = useState(false);
  const onSubmit = (ev) => {
    ev.preventDefault();
    const payload = {
      email: refEmail.current.value,
      password: refPassword.current.value,
    };
    setLoading(true);
    setErrors(null);
    AxiosClient.post('/login', payload)
      .then(({ data }) => {
        setUser(data.userDTO);
        setToken(data.token);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        const response = error.response;
        if (response) {
          if (response.status === 404) {
            setErrors({ message: [response.data?.message || 'User not found'] });
          } else if (response.status === 403 && response.data?.status === 'disabled') {
            // Account disabled - show detailed message with reason
            const errorMessage = response.data?.message || 'Your account has been disabled.';
            const reason = response.data?.reason;
            const disabledAt = response.data?.disabled_at;
            
            let fullMessage = errorMessage;
            if (reason) {
              fullMessage += `\nReason: ${reason}`;
            }
            if (disabledAt) {
              const date = new Date(disabledAt).toLocaleDateString();
              fullMessage += `\nDisabled on: ${date}`;
            }
            
            setErrors({ message: [fullMessage] });
          } else if (response.status === 422) {
            setErrors(response.data?.errors || { message: ['Validation error'] });
          } else if (response.status === 500) {
            setErrors({ message: [response.data?.message || 'Server error. Please try again.'] });
          } else {
            setErrors({ message: [response.data?.message || 'An error occurred'] });
          }
        } else {
          // Network error or no response
          setErrors({ message: ['Network error. Please check your connection.'] });
        }
      });
  };

  if (token) return <Navigate to="/" />;

  return (
    <div className="flex justify-center items-center flex-1 dark:bg-gray-900">
      <form action="" className="w-80 flex flex-col gap-4" onSubmit={onSubmit}>
        <h3 className="font-bold text-3xl text-center dark:text-white">{t('auth.login')}</h3>
        {errors && (
          <div className="bg-red-500 dark:bg-red-600 text-white p-3 rounded-md whitespace-pre-line">
            {Object.keys(errors).map((e, i) => {
              return <p key={i} className="mb-1 last:mb-0">{errors[e][0]}</p>;
            })}
          </div>
        )}
        <input
          type="email"
          placeholder={t('auth.email')}
          className="w-full px-3 py-5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none rounded-md"
          ref={refEmail}
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none rounded-md px-3 py-5"
          ref={refPassword}
        />
        <button
          className="w-full bg-green-600 dark:bg-green-700 text-white px-3 py-5 rounded-md disabled:bg-[#444] dark:disabled:bg-gray-600 disabled:cursor-none"
          disabled={loading}
        >
          {t('auth.login')}
        </button>
        <Link className="underline text-sm text-[#444] dark:text-gray-300 font-bold" to="/signup">
          {t('auth.noAccount')}
        </Link>
      </form>
    </div>
  );
}

export default Login;
