import React, { useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import { useUserContext } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

function Signup() {
  const { setUser, setToken, token } = useUserContext();
  const { t } = useLanguage();
  const [errors, setErrors] = useState(null);
  const refName = useRef();
  const refEmail = useRef();
  const refPassword = useRef();
  const refPasswordConf = useRef();
  const [loading, setLoading] = useState(false);

  const onSubmit = (ev) => {
    ev.preventDefault();
    const payload = {
      name: refName.current.value,
      email: refEmail.current.value,
      password: refPassword.current.value,
      password_confirmation: refPasswordConf.current.value,
    };
    setLoading(true);
    setErrors(null);
    AxiosClient.post('/signup', payload)
      .then(({ data }) => {
        setUser(data.userDTO);
        setToken(data.token);
        setLoading(false);
      })
      .catch((error) => {
        const response = error.response;
        setLoading(false);
        if (response.status == 422) {
          setErrors(response.data.errors);
        }
      });
  };

  if (token) return <Navigate to="/" />;

  return (
    <div className="flex justify-center items-center flex-1 dark:bg-gray-900">
      <form action="" className="w-80 flex flex-col gap-4" onSubmit={onSubmit}>
        <h3 className="font-bold text-3xl text-center dark:text-white">{t('auth.createAccount')}</h3>
        {errors && (
          <div className="bg-red-500 dark:bg-red-600 text-white p-3 rounded-md">
            {Object.keys(errors).map((e) => {
              return <p key={e}>{errors[e][0]}</p>;
            })}
          </div>
        )}
        <input
          type="text"
          placeholder={t('auth.fullName')}
          className="w-full px-3 py-5 border dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none rounded-md"
          ref={refName}
        />
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
        <input
          type="password"
          placeholder={t('auth.passwordConfirmation')}
          className="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none rounded-md px-3 py-5"
          ref={refPasswordConf}
        />
        <button
          className="w-full bg-green-600 dark:bg-green-700 text-white px-3 py-5 rounded-md disabled:bg-[#444] dark:disabled:bg-gray-600 disabled:cursor-none"
          disabled={loading}
        >
          {t('auth.signup')}
        </button>
        <Link className="underline text-sm text-[#444] dark:text-gray-300 font-bold" to="/login">
          {t('auth.haveAccount')}
        </Link>
      </form>
    </div>
  );
}

export default Signup;
