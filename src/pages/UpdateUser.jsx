import React, { useState, useEffect } from 'react';
import { useUserContext } from '../contexts/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import AxiosClient from '../AxiosClient';
import UploadWidget from '../components/UploadWidget';

function UpdateUser() {
  const { user, setUser, setMessage } = useUserContext();
  const [updatedUser, setUpdatedUser] = useState({
    id: user?.id || null,
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || null,
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Update form when user data loads or changes
  useEffect(() => {
    if (user) {
      setUpdatedUser(prev => ({
        ...prev,
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  const handleAvatarChange = (urls) => {
    const next = Array.isArray(urls) ? urls[0] : null;
    setUpdatedUser({ ...updatedUser, avatar: next || null });
  };
  const navigate = useNavigate();

  const onSubmit = (en) => {
    en.preventDefault();
    setErrors(null);
    setLoading(true);
    
    // Prepare payload - only include password fields if they're not empty
    const payload = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
    };
    
    // Only include password fields if user provided a new password
    if (updatedUser.password && updatedUser.password.trim() !== '') {
      payload.password = updatedUser.password;
      payload.password_confirmation = updatedUser.password_confirmation;
    }
    
    AxiosClient.put('/users/' + updatedUser.id, payload)
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
              value={updatedUser.name || ''}
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
              value={updatedUser.email || ''}
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
              disabled={loading || avatarUploading}
            >
              {avatarUploading ? "Uploading..." : "Update"}
            </button>
          </form>
        </div>
      </div>
      <div
        className="right flex-1 md:bg-[#fcf5f3] px-5 overflow-hidden 
      flex justify-center items-center"
      >
        <UploadWidget
          value={updatedUser?.avatar ? [updatedUser.avatar] : []}
          onChange={handleAvatarChange}
          onUploadingChange={setAvatarUploading}
          isMultiple={false}
          folder="/avatars"
          label="Change photo"
        />
      </div>
    </div>
  );
}

export default UpdateUser;
