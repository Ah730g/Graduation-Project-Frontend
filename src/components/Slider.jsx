import React, { useState } from 'react';

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null);
  const onChange = (direction) => {
    var result = null;
    if (direction === 'right') {
      result = imageIndex == images.length - 1 ? 0 : imageIndex + 1;
    } else {
      result = imageIndex == 0 ? images.length - 1 : imageIndex - 1;
    }
    setImageIndex(result);
  };
  return (
    <div className="flex gap-2 h-[300px] mb-5">
      {imageIndex !== null && (
        <div className="slider absolute bg-black w-full h-full top-0 right-0 flex justify-center items-center z-50">
          <div className="w-3/4 h-auto">
            <img
              src={images[imageIndex].Image_URL}
              alt=""
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <img
            src="/public/arrow.png"
            alt=""
            className="w-8 absolute top-[calc(50% - 16px)] left-6 cursor-pointer max-md:w-5"
            onClick={() => onChange('left')}
          />
          <img
            src="/public/arrow.png"
            alt=""
            className="w-8 absolute top-[calc(50% - 16px)] right-6 cursor-pointer rotate-[180deg] max-md:w-5"
            onClick={() => onChange('right')}
          />
          <p
            className="text-4xl text-white font-bold absolute top-5 right-5 cursor-pointer"
            onClick={() => setImageIndex(null)}
          >
            X
          </p>
        </div>
      )}
      <div className="w-3/4 h-full cursor-pointer">
        <img
          src={images[0].Image_URL}
          alt=""
          className="w-full h-full rounded-md object-cover"
          onClick={() => setImageIndex(0)}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {images.map((img, index) => {
          if (index != 0 && index < 4) {
            return (
              <img
                key={index}
                src={img.Image_URL}
                alt=""
                className="w-full object-cover rounded-md h-[90px] cursor-pointer"
                onClick={() => setImageIndex(index)}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

export default Slider;
