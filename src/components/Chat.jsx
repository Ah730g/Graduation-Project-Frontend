import React, { useState } from 'react';

function Chat() {
  const repeat = Array(10).fill(null);
  const [chat, setChat] = useState(true);
  return (
    <div className="flex flex-col h-full">
      <div className="h-1/2 overflow-y-scroll flex flex-col gap-4">
        <h3 className="text-3xl font-light dark:text-white">Messages</h3>

        {repeat.map((v, i) => {
          return (
            <div
              className="flex items-center p-5 bg-white dark:bg-gray-800 rounded-md gap-5 cursor-pointer"
              key={i}
            >
              <img
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-bold dark:text-white">Homady Senan</span>
              <p className="dark:text-gray-300">Lorem ipsum dolor sit, amet...</p>
            </div>
          );
        })}
      </div>
      {chat && (
        <div className="chat-box flex-1 flex flex-col">
          <div className="top bg-[#f7c14b85] dark:bg-yellow-600/50 p-4 flex justify-between items-center rounded-md">
            <div className="flex gap-2 items-center">
              <img
                src="https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="font-bold dark:text-white">Homady Senan</span>
            </div>
            <span
              className="text-xl cursor-pointer font-bold dark:text-white"
              onClick={() => {
                setChat(false);
              }}
            >
              X
            </span>
          </div>
          <div className="center h-[350px] bg-white dark:bg-gray-800 p-4 flex flex-col gap-5 overflow-y-scroll">
            <div>
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
            <div className="flex items-end flex-col ">
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
            <div>
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
            <div className="flex items-end flex-col ">
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
            <div>
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
            <div className="flex items-end flex-col ">
              <p>Lorem ipsum, dolor sit amet</p>
              <span>1 hour ago</span>
            </div>
          </div>
          <div className="bottom h-[70px] border border-t-[#f7c14b85] flex">
            <input
              type="text"
              className="h-full px-2 w-3/4 border-none outline-none"
            />
            <button className="h-full flex-1 bg-[#f7c14b85] font-bold rounded-md">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
