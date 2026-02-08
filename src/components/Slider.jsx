import React, { useState, useEffect } from 'react';

function Slider({ images }) {
  const [imageIndex, setImageIndex] = useState(null);
  
  // Ensure images is always an array
  const safeImages = Array.isArray(images) && images.length > 0 ? images : [];
  
  // If no images, show placeholder
  if (safeImages.length === 0) {
    return (
      <div className="flex gap-2 h-[300px] mb-5">
        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-md">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }
  
  const onChange = (direction) => {
    var result = null;
    if (direction === 'right') {
      result = imageIndex == safeImages.length - 1 ? 0 : imageIndex + 1;
    } else {
      result = imageIndex == 0 ? safeImages.length - 1 : imageIndex - 1;
    }
    setImageIndex(result);
  };
  
  // Get image URL - handle different possible structures
  const getImageUrl = (img) => {
    if (!img) return '/placeholder-image.png';
    return img.Image_URL || img.image_url || img.url || img || '/placeholder-image.png';
  };
  
  return (
    <div className="flex gap-2 h-[300px] mb-5 relative">
      {imageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-[9999]">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Main Image */}
            <div className="max-w-5xl w-full h-full flex items-center justify-center">
              <img
                src={getImageUrl(safeImages[imageIndex])}
                alt={`Image ${imageIndex + 1} of ${safeImages.length}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
            
            {/* Navigation Arrows */}
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={() => onChange('left')}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-yellow-300 hover:bg-yellow-400 text-[#444] p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Previous image"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => onChange('right')}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-yellow-300 hover:bg-yellow-400 text-[#444] p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
                  aria-label="Next image"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Close Button */}
            <button
              onClick={() => setImageIndex(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 bg-yellow-300 hover:bg-yellow-400 text-[#444] p-2 md:p-3 rounded-full shadow-lg transition-all hover:scale-110 z-10"
              aria-label="Close image viewer"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image Counter */}
            {safeImages.length > 1 && (
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm md:text-base">
                {imageIndex + 1} / {safeImages.length}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="w-3/4 h-full cursor-pointer">
        <img
          src={getImageUrl(safeImages[0])}
          alt=""
          className="w-full h-full rounded-md object-cover"
          onClick={() => setImageIndex(0)}
          onError={(e) => {
            e.target.src = '/placeholder-image.png';
          }}
        />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {safeImages.map((img, index) => {
          if (index != 0 && index < 4) {
            return (
              <img
                key={index}
                src={getImageUrl(img)}
                alt=""
                className="w-full object-cover rounded-md h-[90px] cursor-pointer"
                onClick={() => setImageIndex(index)}
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

export default Slider;
