import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';

function Pin({ item }) {
  // Get first image or use placeholder
  const getFirstImage = () => {
    if (!item || !item.images) {
      return '/placeholder-image.png';
    }
    
    if (Array.isArray(item.images) && item.images.length > 0) {
      const firstImg = item.images[0];
      // Handle different possible structures
      return firstImg?.Image_URL || firstImg?.image_url || firstImg?.url || firstImg || '/placeholder-image.png';
    }
    
    return '/placeholder-image.png';
  };
  
  const firstImage = getFirstImage();
  
  return (
    <>
      <Marker position={[item?.latitude || 0, item?.longitude || 0]}>
        <Popup>
          <div className="flex gap-3">
            <img
              src={firstImage}
              alt={item?.Title || 'Apartment'}
              className="w-16 h-12 object-cover rounded-sm flex-shrink-0 bg-gray-200"
              onError={(e) => {
                e.target.src = '/placeholder-image.png';
              }}
            />
            <div className="flex flex-col justify-between">
              <Link className="m-0" to={`/${item?.id || '#'}`}>
                {item?.Title || 'Untitled'}
              </Link>
              <span>{item?.Bedrooms || 0} bedroom</span>
              <span>${item?.Price || 0}</span>
            </div>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default Pin;
