import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FloorPlanSVG from '../pages/FloorPlanSVG';
import FloorPlan3D from './floorplan/FloorPlan3D';
import { useLanguage } from '../contexts/LanguageContext';
import { convert2DTo3D } from '../lib/floorplan3d/converter';

function FloorPlanDisplay({ 
  floorPlanData, 
  title = null, 
  show3D = false, 
  compact = false,
  onEdit = null,
  showEditButton = false 
}) {
  const { t, language } = useLanguage();
  const [viewMode, setViewMode] = useState('2d'); // '2d' or '3d'
  const [showFullView, setShowFullView] = useState(false);
  const [showFullScreen2D, setShowFullScreen2D] = useState(false);

  // Handle ESC key to exit full screen and body scroll lock
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && showFullScreen2D) {
        setShowFullScreen2D(false);
      }
      if (event.key === 'Escape' && showFullView) {
        setShowFullView(false);
      }
    };

    // Lock body scroll when full screen is active
    if (showFullScreen2D || showFullView) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showFullScreen2D, showFullView]);

  if (!floorPlanData) {
    return null;
  }

  // Parse floor plan data if it's a string
  let layout = floorPlanData;
  if (typeof floorPlanData === 'string') {
    try {
      layout = JSON.parse(floorPlanData);
    } catch (e) {
      console.error('Error parsing floor plan data:', e);
      return null;
    }
  }

  // Get layout from nested structure if needed
  if (layout.layout) {
    layout = layout.layout;
  }

  if (!layout || !layout.rooms || layout.rooms.length === 0) {
    return null;
  }

  const floorPlanTitle = title || layout.title || (t('apartments.floorPlan') || 'Floor Plan');

  // Check if layout is already in 3D format (has geometry on rooms)
  const is3DLayout = layout.rooms && layout.rooms.length > 0 && layout.rooms[0]?.geometry;

  // Convert to 3D only when needed and if not already 3D
  const layout3D = useMemo(() => {
    if (is3DLayout) {
      return layout; // Already in 3D format
    }
    // Check if rooms have required 2D properties
    if (layout.rooms && layout.rooms.length > 0) {
      const firstRoom = layout.rooms[0];
      if (firstRoom.x_m !== undefined && firstRoom.y_m !== undefined && 
          firstRoom.width_m !== undefined && firstRoom.height_m !== undefined) {
        try {
          return convert2DTo3D(layout);
        } catch (error) {
          console.error('Error converting layout to 3D:', error);
          return layout; // Return original layout on error
        }
      }
    }
    return layout;
  }, [layout, is3DLayout]);

  if (compact) {
    // Compact view for cards
    return (
      <div className="relative">
        <div 
          className="cursor-pointer bg-gray-50 rounded-md p-2 border border-gray-200 hover:border-blue-400 transition"
          onClick={() => setShowFullView(true)}
          title={t('apartments.viewFloorPlan') || 'View Floor Plan'}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="font-semibold">{floorPlanTitle}</span>
            <span className="text-xs text-gray-400">({layout.rooms?.length || 0} {t('apartments.rooms') || 'rooms'})</span>
          </div>
        </div>

        {/* Full View Modal */}
        {showFullView && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowFullView(false)}
            style={{ 
              direction: language === 'ar' ? 'rtl' : 'ltr',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh'
            }}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
                <h2 className="text-2xl font-bold text-white">{floorPlanTitle}</h2>
                <div className="flex gap-2">
                  {show3D && (
                    <button
                      onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-md transition text-sm font-medium"
                    >
                      {viewMode === '2d' ? '3D' : '2D'}
                    </button>
                  )}
                  {showEditButton && onEdit && (
                    <button
                      onClick={onEdit}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition text-sm font-medium"
                    >
                      {t('apartments.edit') || 'Edit'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowFullView(false)}
                    className="text-white hover:bg-white/20 rounded-full p-2 transition"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {viewMode === '2d' ? (
                  <FloorPlanSVG 
                    layout={layout} 
                    title={floorPlanTitle}
                    interactive={false}
                  />
                ) : (
                  <FloorPlan3D layout={layout3D} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{floorPlanTitle}</h3>
          <div className="flex gap-2">
            {viewMode === '2d' && (
              <button
                onClick={() => setShowFullScreen2D(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition text-sm font-medium flex items-center gap-2"
                title={t('apartments.fullScreen') || 'Full Screen'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                {t('apartments.fullScreen') || 'Full Screen'}
              </button>
            )}
            {show3D && (
              <button
                onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition text-sm font-medium"
              >
                {viewMode === '2d' ? '3D View' : '2D View'}
              </button>
            )}
            {showEditButton && onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition text-sm font-medium"
              >
                {t('apartments.edit') || 'Edit'}
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 overflow-auto">
          {viewMode === '2d' ? (
            <FloorPlanSVG 
              layout={layout} 
              title={floorPlanTitle}
              interactive={false}
            />
          ) : (
            <FloorPlan3D layout={layout3D} />
          )}
        </div>
      </div>

      {/* Full Screen 2D Modal - Rendered via Portal */}
      {showFullScreen2D && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setShowFullScreen2D(false)}
          style={{ 
            direction: language === 'ar' ? 'rtl' : 'ltr',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 99999
          }}
        >
          <div 
            className="bg-white w-full h-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100vw',
              height: '100vh',
              maxWidth: '100vw',
              maxHeight: '100vh'
            }}
          >
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg">
              <h2 className="text-2xl font-bold text-white">{floorPlanTitle}</h2>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setShowFullScreen2D(false)}
                  className="text-white hover:bg-white/20 rounded-lg px-4 py-2 transition flex items-center gap-2 font-medium"
                  title={t('apartments.exitFullScreen') || 'Exit Full Screen (ESC)'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>{t('apartments.exitFullScreen') || 'Exit Full Screen'}</span>
                  <span className="text-xs opacity-75 ml-1">(ESC)</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center p-8">
              <div className="w-full h-full flex items-center justify-center max-w-full max-h-full">
                <div className="w-full h-full flex items-center justify-center">
                  <FloorPlanSVG 
                    layout={layout} 
                    title={null}
                    interactive={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default FloorPlanDisplay;
