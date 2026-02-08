import React from 'react';

function Notification({ message, succeed = true }) {
  return (
    <div
      className={`absolute z-50 ${
        succeed ? 'bg-green-500' : 'bg-red-500'
      } text-white p-5 bottom-5 right-5 rounded-md transition ease duration-300`}
    >
      {message}
    </div>
  );
}

export default Notification;
