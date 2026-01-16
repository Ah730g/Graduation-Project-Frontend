import React, { useState } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import UploadWidget from '../components/UploadWidget';

function UpdateUser() {
  const { user, setUser, setMessage } = useUserContext();
  const [updatedUser, setUpdatedUser] = useState(user);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const setAvatarURL = (URL) => {
    if (URL) setUpdatedUser({ ...updatedUser, avatar: URL[0] });
  };
  const navigate = useNavigate();

  const onSubmit = (en) => {
    en.preventDefault();
    setErrors(null);
    setLoading(true);
    AxiosClient.put('/users/' + updatedUser.id, updatedUser)
      .then((response) => {
        setUser(response.data);
        setLoading(false);
        setMessage('User Updated Successfully');
        navigate('/user/profile');
      })
      .catch((error) => {
        setErrors(error.response.data.errors);
        setLoading(false);
      });
  };
  return (
    <div
      className="px-5 mx-auto max-w-[1366px] max-md:max-w-[640px] max-lg:max-w-[768px] max-xl:max-w-[1280px]
     lg:flex lg:justify-between h-[calc(100vh-100px)] relative"
    >
      <div className="left lg:w-3/5 lg:pr-10 flex flex-col gap-12 mb-3">
        <div className="flex justify-center items-center flex-1">
          <form
            action=""
            className="w-80 flex flex-col gap-4"
            onSubmit={onSubmit}
          >
            <h3 className="font-bold text-3xl text-center">Update User</h3>
            {errors && (
              <div className="bg-red-500 text-white p-3 rounded-md">
                {Object.keys(errors).map((e) => {
                  return <p>{errors[e][0]}</p>;
                })}
              </div>
            )}
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-3 py-5 border outline-none rounded-md"
              defaultValue={updatedUser.name}
              onChange={(e) => {
                return setUpdatedUser({
                  ...updatedUser,
                  name: e.currentTarget.value,
                });
              }}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-3 py-5 border outline-none rounded-md"
              defaultValue={updatedUser.email}
              onChange={(e) => {
                return setUpdatedUser({
                  ...updatedUser,
                  email: e.currentTarget.value,
                });
              }}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border outline-none rounded-md px-3 py-5"
              onChange={(e) => {
                return setUpdatedUser({
                  ...updatedUser,
                  password: e.currentTarget.value,
                });
              }}
            />
            <input
              type="password"
              placeholder="Password Confirmation"
              className="w-full border outline-none rounded-md px-3 py-5"
              onChange={(e) => {
                return setUpdatedUser({
                  ...updatedUser,
                  password_confirmation: e.currentTarget.value,
                });
              }}
            />
            <button
              className="w-full bg-green-600 text-white px-3 py-5 rounded-md disabled:bg-[#444] disabled:cursor-none"
              disabled={loading}
            >
              Update
            </button>
          </form>
        </div>
      </div>
      <div
        className="right flex-1 md:bg-[#fcf5f3] px-5 overflow-hidden 
      flex justify-center items-center"
      >
        <UploadWidget setAvatarURL={setAvatarURL} isMultiple={false} />
      </div>
    </div>
  );
}

export default UpdateUser;
