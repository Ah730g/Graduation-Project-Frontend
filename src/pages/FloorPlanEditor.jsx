import React, { useState, useRef } from "react";
import AxiosClient from "../AxiosClient";
import FloorPlanSVG from "./FloorPlanSVG";

export default function FloorPlanEditor({ initialLayout, title, onClose, originalResult = null, onLayoutUpdate = null }) {
  const [editableLayout, setEditableLayout] = useState(() => {
    // إنشاء نسخة عميقة من المخطط للتعديل
    if (!initialLayout) {
      console.error("initialLayout is missing");
      return null;
    }
    return JSON.parse(JSON.stringify(initialLayout));
  });
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState(null);
  const [selectedFurnitureItem, setSelectedFurnitureItem] = useState(null);
  const [selectedDoorIndex, setSelectedDoorIndex] = useState(null);
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [selectedWindowIndex, setSelectedWindowIndex] = useState(null);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [showDoorsWindowsModal, setShowDoorsWindowsModal] = useState(false);
  const [showFurnitureModal, setShowFurnitureModal] = useState(false);
  const [showDoorModal, setShowDoorModal] = useState(false);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const svgContainerRef = useRef(null);

  // التحقق من وجود المخطط
  if (!editableLayout || !editableLayout.rooms) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6 flex items-center justify-center" style={{ direction: "rtl", fontFamily: "Tahoma, Arial" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">لا يوجد مخطط للتحرير</h2>
          <p className="text-gray-600 mb-6">يرجى العودة وتوليد مخطط أولاً</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            ← العودة
          </button>
        </div>
      </div>
    );
  }

  // العثور على الغرفة المحددة
  const selectedRoom = editableLayout.rooms?.find((r) => r.id === selectedRoomId) || null;

  // ═══════════════════════════════════════════════
  // 🖱️ معالجة السحب والإفلات
  // ═══════════════════════════════════════════════
  const handleRoomDrag = (roomId, newX_m, newY_m) => {
    setEditableLayout((prev) => {
      const scale = prev.scale_px_per_m || 50;
      const newLayout = { ...prev };
      newLayout.rooms = prev.rooms.map((room) => {
        if (room.id === roomId) {
          return {
            ...room,
            x_m: Math.max(0, newX_m),
            y_m: Math.max(0, newY_m),
            x_px: Math.max(0, newX_m * scale),
            y_px: Math.max(0, newY_m * scale),
          };
        }
        return room;
      });
      
      // تحديث الأبعاد الكلية
      let maxX = 0;
      let maxY = 0;
      newLayout.rooms.forEach((room) => {
        maxX = Math.max(maxX, room.x_m + room.width_m);
        maxY = Math.max(maxY, room.y_m + room.height_m);
      });
      newLayout.total_width_m = Math.round(maxX * 100) / 100;
      newLayout.total_height_m = Math.round(maxY * 100) / 100;
      newLayout.total_width_px = Math.round(maxX * scale);
      newLayout.total_height_px = Math.round(maxY * scale);
      
      return newLayout;
    });
  };

  // ═══════════════════════════════════════════════
  // 👆 معالجة النقر على الغرفة
  // ═══════════════════════════════════════════════
  const handleRoomClick = (roomId) => {
    setSelectedRoomId(roomId);
  };

  // ═══════════════════════════════════════════════
  // 🖱️ معالجة النقر على الخلفية لإلغاء التحديد
  // ═══════════════════════════════════════════════
  const handleBackgroundClick = () => {
    setSelectedRoomId(null);
  };

  // ═══════════════════════════════════════════════
  // 🔍 التحقق من التداخل بين الأبواب والنوافذ
  // ═══════════════════════════════════════════════
  const checkDoorWindowOverlap = (room, newItem, itemType, excludeIndex = -1) => {
    // itemType: 'door' أو 'window'
    // newItem: { wall, position, width_m }
    // excludeIndex: فهرس العنصر المستبعد من الفحص (عند التعديل)
    
    if (!room) return false;
    
    // حساب طول الجدار بناءً على اتجاهه
    const wallLength = (newItem.wall === 'north' || newItem.wall === 'south') 
      ? room.width_m 
      : room.height_m;
    
    if (!wallLength || wallLength <= 0) return false;
    
    const threshold = 0.05; // مسافة الحد الأدنى بين الباب والنافذة (5% من طول الجدار)
    const newWidth = newItem.width_m || (itemType === 'door' ? 0.9 : 1.2);
    
    // حساب نطاق الموضع للعنصر الجديد (بالنسبة المئوية من 0 إلى 1)
    const newCenter = newItem.position;
    const newHalfWidth = (newWidth / wallLength) / 2;
    const newStart = newCenter - newHalfWidth;
    const newEnd = newCenter + newHalfWidth;
    
    // التحقق من التداخل مع الأبواب
    if (room.doors && room.doors.length > 0) {
      for (let idx = 0; idx < room.doors.length; idx++) {
        const door = room.doors[idx];
        
        // تخطي الباب الحالي إذا كنا نعدله
        if (itemType === 'door' && idx === excludeIndex) continue;
        
        if (door.wall === newItem.wall) {
          const doorWidth = door.width_m || 0.9;
          const doorHalfWidth = (doorWidth / wallLength) / 2;
          const doorStart = door.position - doorHalfWidth;
          const doorEnd = door.position + doorHalfWidth;
          
          // التحقق من التداخل (مع مسافة حد أدنى)
          if (!(newEnd < doorStart - threshold || newStart > doorEnd + threshold)) {
            return true; // يوجد تداخل
          }
        }
      }
    }
    
    // التحقق من التداخل مع النوافذ
    if (room.windows && room.windows.length > 0) {
      for (let idx = 0; idx < room.windows.length; idx++) {
        const window = room.windows[idx];
        
        // تخطي النافذة الحالية إذا كنا نعدلها
        if (itemType === 'window' && idx === excludeIndex) continue;
        
        if (window.wall === newItem.wall) {
          const windowWidth = window.width_m || 1.2;
          const windowHalfWidth = (windowWidth / wallLength) / 2;
          const windowStart = window.position - windowHalfWidth;
          const windowEnd = window.position + windowHalfWidth;
          
          // التحقق من التداخل (مع مسافة حد أدنى)
          if (!(newEnd < windowStart - threshold || newStart > windowEnd + threshold)) {
            return true; // يوجد تداخل
          }
        }
      }
    }
    
    return false; // لا يوجد تداخل
  };

  // ═══════════════════════════════════════════════
  // ➕ إضافة غرفة جديدة
  // ═══════════════════════════════════════════════
  const handleAddRoom = () => {
    const scale = editableLayout.scale_px_per_m || 50;
    const newRoom = {
      id: `room-${Date.now()}`,
      name: "غرفة جديدة",
      type: "other",
      shape: "rectangle",
      width_m: 4,
      height_m: 4,
      x_m: 0,
      y_m: 0,
      width_px: 4 * scale,
      height_px: 4 * scale,
      x_px: 0,
      y_px: 0,
      area_m2: 16,
      doors: [{ wall: "south", position: 0.5, width_m: 0.9, type: "single" }],
      windows: [],
      furniture: [],
      furniture_items: [],
      shape_data: {},
    };

    setEditableLayout((prev) => ({
      ...prev,
      rooms: [...prev.rooms, newRoom],
    }));
    setSelectedRoomId(newRoom.id);
  };

  // ═══════════════════════════════════════════════
  // 🗑️ حذف غرفة
  // ═══════════════════════════════════════════════
  const handleDeleteRoom = () => {
    if (!selectedRoomId) return;
    
    setEditableLayout((prev) => {
      const newRooms = prev.rooms.filter((r) => r.id !== selectedRoomId);
      
      // تحديث الأبعاد الكلية
      let maxX = 0;
      let maxY = 0;
      const scale = prev.scale_px_per_m || 50;
      newRooms.forEach((room) => {
        maxX = Math.max(maxX, room.x_m + room.width_m);
        maxY = Math.max(maxY, room.y_m + room.height_m);
      });
      
      return {
        ...prev,
        rooms: newRooms,
        total_width_m: Math.round(maxX * 100) / 100,
        total_height_m: Math.round(maxY * 100) / 100,
        total_width_px: Math.round(maxX * scale),
        total_height_px: Math.round(maxY * scale),
      };
    });
    
    setSelectedRoomId(null);
  };

  // ═══════════════════════════════════════════════
  // ✏️ تحديث خصائص الغرفة
  // ═══════════════════════════════════════════════
  const handleUpdateRoom = (updates) => {
    if (!selectedRoomId) return;

    setEditableLayout((prev) => {
      const scale = prev.scale_px_per_m || 50;
      const newRooms = prev.rooms.map((room) => {
        if (room.id === selectedRoomId) {
          const updated = { ...room, ...updates };
          
          // إعادة حساب الأبعاد بالبكسل
          if (updates.width_m !== undefined) {
            updated.width_px = updated.width_m * scale;
          }
          if (updates.height_m !== undefined) {
            updated.height_px = updated.height_m * scale;
          }
          
          // إعادة حساب المساحة
          if (updates.width_m !== undefined || updates.height_m !== undefined) {
            updated.area_m2 = Math.round((updated.width_m || room.width_m) * (updated.height_m || room.height_m) * 100) / 100;
          }
          
          // إعادة حساب بيانات الشكل إذا تغير الشكل
          if (updates.shape !== undefined && updates.shape !== room.shape) {
            updated.shape_data = {};
          }
          
          return updated;
        }
        return room;
      });
      
      // تحديث الأبعاد الكلية
      let maxX = 0;
      let maxY = 0;
      newRooms.forEach((room) => {
        maxX = Math.max(maxX, room.x_m + room.width_m);
        maxY = Math.max(maxY, room.y_m + room.height_m);
      });
      
      return {
        ...prev,
        rooms: newRooms,
        total_width_m: Math.round(maxX * 100) / 100,
        total_height_m: Math.round(maxY * 100) / 100,
        total_width_px: Math.round(maxX * scale),
        total_height_px: Math.round(maxY * scale),
      };
    });
  };

  // ═══════════════════════════════════════════════
  // تصدير PNG
  // ═══════════════════════════════════════════════
  const handleExportPNG = () => {
    try {
      const svgElement = svgContainerRef.current?.querySelector("svg");
      if (!svgElement) {
        alert("لم يتم العثور على المخطط للتصدير");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        alert("المتصفح لا يدعم تصدير PNG");
        return;
      }

      // تحويل SVG إلى base64 مباشرة لتجنب مشكلة Tainted Canvas
      const svgData = new XMLSerializer().serializeToString(svgElement);
      
      // إزالة أي روابط خارجية من SVG لتجنب مشكلة CORS
      const cleanedSvgData = svgData.replace(/<image[^>]*>/gi, '');
      
      // تحويل SVG إلى base64
      const svgBase64 = btoa(unescape(encodeURIComponent(cleanedSvgData)));
      const svgDataUrl = `data:image/svg+xml;base64,${svgBase64}`;

      const img = new Image();
      
      // إضافة crossOrigin لتجنب مشكلة Tainted Canvas
      img.crossOrigin = 'anonymous';
      
      img.onerror = () => {
        // إذا فشل التحميل، جرب طريقة بديلة
        try {
          // طريقة بديلة: استخدام canvas مباشرة من SVG
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(cleanedSvgData, 'image/svg+xml');
          const svgElementClone = svgDoc.documentElement;
          
          // إنشاء canvas جديد
          const rect = svgElement.getBoundingClientRect();
          canvas.width = rect.width * 2;
          canvas.height = rect.height * 2;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // رسم SVG مباشرة على canvas
          const svgString = new XMLSerializer().serializeToString(svgElementClone);
          const img2 = new Image();
          img2.crossOrigin = 'anonymous';
          img2.onload = () => {
            ctx.drawImage(img2, 0, 0, canvas.width, canvas.height);
            const link = document.createElement("a");
            link.download = `floor-plan-edited-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
          };
          img2.onerror = () => {
            alert("فشل تصدير الصورة. يرجى المحاولة مرة أخرى أو استخدام تصدير SVG بدلاً من ذلك.");
          };
          img2.src = svgDataUrl;
        } catch (fallbackErr) {
          alert("فشل تحميل الصورة للتصدير: " + (fallbackErr.message || "خطأ غير معروف"));
        }
      };

      img.onload = () => {
        try {
          const maxDimension = 8000;
          const scale = 2;
          let width = img.width * scale;
          let height = img.height * scale;

          if (width > maxDimension || height > maxDimension) {
            const ratio = Math.min(maxDimension / width, maxDimension / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);

          const link = document.createElement("a");
          link.download = `floor-plan-edited-${Date.now()}.png`;
          
          try {
            link.href = canvas.toDataURL("image/png");
            link.click();
          } catch (dataUrlErr) {
            // إذا فشل toDataURL، استخدم طريقة بديلة
            if (dataUrlErr.message.includes('tainted') || dataUrlErr.message.includes('Tainted')) {
              // استخدام html2canvas كبديل (إذا كان متاحاً) أو تحويل مباشر
              alert("تعذر تصدير PNG بسبب قيود الأمان. يرجى استخدام تصدير SVG بدلاً من ذلك.");
            } else {
              throw dataUrlErr;
            }
          }
        } catch (err) {
          if (err.message && (err.message.includes('tainted') || err.message.includes('Tainted'))) {
            alert("تعذر تصدير PNG بسبب قيود الأمان. يرجى استخدام تصدير SVG بدلاً من ذلك.");
          } else {
            alert("فشل تصدير الصورة: " + (err.message || "خطأ غير معروف"));
          }
        }
      };

      img.src = svgDataUrl;
    } catch (err) {
      alert("حدث خطأ أثناء تصدير PNG: " + (err.message || "خطأ غير معروف"));
    }
  };

  // ═══════════════════════════════════════════════
  // 🖼️ تصدير SVG
  // ═══════════════════════════════════════════════
  const handleExportSVG = () => {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `floor-plan-edited-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // ═══════════════════════════════════════════════
  // 🪑 إدارة الأثاث
  // ═══════════════════════════════════════════════
  
  // قائمة قطع الأثاث المتاحة
  const furnitureTypes = [
    { type: "sofa", label: "كنبة", width: 80, height: 35, icon: "🛋️" },
    { type: "tv", label: "تلفاز", width: 50, height: 10, icon: "📺" },
    { type: "coffee_table", label: "طاولة قهوة", width: 40, height: 25, icon: "☕" },
    { type: "bed", label: "سرير", width: 60, height: 70, icon: "🛏️" },
    { type: "king_bed", label: "سرير كبير", width: 75, height: 80, icon: "🛏️" },
    { type: "wardrobe", label: "خزانة", width: 50, height: 20, icon: "🚪" },
    { type: "nightstand", label: "منضدة", width: 20, height: 20, icon: "🪑" },
    { type: "desk", label: "مكتب", width: 45, height: 25, icon: "🖥️" },
    { type: "chair", label: "كرسي", width: 25, height: 25, icon: "💺" },
    { type: "dining_table", label: "طاولة طعام", width: 60, height: 40, icon: "🍽️" },
    { type: "bookshelf", label: "رف كتب", width: 40, height: 15, icon: "📚" },
    { type: "counter", label: "كونتر", width: 70, height: 20, icon: "🍳" },
    { type: "stove", label: "موقد", width: 30, height: 25, icon: "🔥" },
    { type: "fridge", label: "ثلاجة", width: 30, height: 30, icon: "❄️" },
    { type: "sink", label: "حوض", width: 25, height: 20, icon: "🚿" },
    { type: "toilet", label: "مرحاض", width: 20, height: 25, icon: "🚽" },
    { type: "shower", label: "دش", width: 35, height: 35, icon: "🚿" },
    { type: "bathtub", label: "بانيو", width: 50, height: 30, icon: "🛁" },
    { type: "plants", label: "نباتات", width: 20, height: 20, icon: "🌿" },
    { type: "vanity", label: "طاولة زينة", width: 35, height: 20, icon: "💄" },
  ];

  // إضافة قطعة أثاث جديدة
  const handleAddFurniture = (furnitureType) => {
    if (!selectedRoomId) {
      alert("يرجى اختيار غرفة أولاً");
      return;
    }

    const furniture = furnitureTypes.find((f) => f.type === furnitureType);
    if (!furniture) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((room) => {
          if (room.id === selectedRoomId) {
            const scale = prev.scale_px_per_m || 50;
            const newFurniture = {
              id: `furniture-${Date.now()}`,
              type: furniture.type,
              x: (room.width_px - furniture.width) / 2, // في المنتصف
              y: (room.height_px - furniture.height) / 2,
              width: furniture.width,
              height: furniture.height,
            };

            return {
              ...room,
              furniture_items: [...(room.furniture_items || []), newFurniture],
            };
          }
          return room;
        }),
      };
    });
  };

  // حذف قطعة أثاث
  const handleDeleteFurniture = (furnitureId) => {
    if (!selectedRoomId) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((room) => {
          if (room.id === selectedRoomId) {
            return {
              ...room,
              furniture_items: (room.furniture_items || []).filter(
                (item) => item.id !== furnitureId
              ),
            };
          }
          return room;
        }),
      };
    });
    setSelectedFurnitureId(null);
  };

  // سحب الأثاث
  const handleFurnitureDrag = (furnitureId, newX, newY) => {
    if (!selectedRoomId) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((room) => {
          if (room.id === selectedRoomId) {
            return {
              ...room,
              furniture_items: (room.furniture_items || []).map((item) => {
                if (item.id === furnitureId) {
                  // التأكد من أن الأثاث داخل حدود الغرفة
                  const maxX = room.width_px - item.width;
                  const maxY = room.height_px - item.height;
                  return {
                    ...item,
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY)),
                  };
                }
                return item;
              }),
            };
          }
          return room;
        }),
      };
    });
  };

  // معالجة النقر على الأثاث
  const handleFurnitureClick = (furnitureId) => {
    if (!selectedRoomId) return;
    const room = editableLayout.rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;
    const furniture = room.furniture_items?.find((item) => item.id === furnitureId);
    if (furniture) {
      setSelectedFurnitureId(furnitureId);
      setSelectedFurnitureItem(furniture);
      setShowFurnitureModal(true);
    }
  };

  // معالجة تغيير حجم الأثاث
  const handleFurnitureResize = (furnitureId, newX, newY, newWidth, newHeight) => {
    if (!selectedRoomId) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((room) => {
          if (room.id === selectedRoomId) {
            return {
              ...room,
              furniture_items: (room.furniture_items || []).map((item) => {
                if (item.id === furnitureId) {
                  // التأكد من أن الأثاث داخل حدود الغرفة
                  const maxX = room.width_px - newWidth;
                  const maxY = room.height_px - newHeight;
                  return {
                    ...item,
                    x: Math.max(0, Math.min(newX, maxX)),
                    y: Math.max(0, Math.min(newY, maxY)),
                    width: Math.max(10, Math.min(newWidth, room.width_px)),
                    height: Math.max(10, Math.min(newHeight, room.height_px)),
                  };
                }
                return item;
              }),
            };
          }
          return room;
        }),
      };
    });
  };

  // معالجة النقر على الباب
  const handleDoorClick = (doorIndex) => {
    if (!selectedRoomId) return;
    const room = editableLayout.rooms.find((r) => r.id === selectedRoomId);
    if (!room || !room.doors || !room.doors[doorIndex]) return;
    // فقط تحديث التحديد بدون فتح النافذة المنبثقة
    setSelectedDoorIndex(doorIndex);
    setSelectedDoor(room.doors[doorIndex]);
    // تم إلغاء فتح النافذة المنبثقة: setShowDoorModal(true);
  };

  // معالجة النقر على النافذة
  const handleWindowClick = (windowIndex) => {
    if (!selectedRoomId) return;
    const room = editableLayout.rooms.find((r) => r.id === selectedRoomId);
    if (!room || !room.windows || !room.windows[windowIndex]) return;
    // فقط تحديث التحديد بدون فتح النافذة المنبثقة
    setSelectedWindowIndex(windowIndex);
    setSelectedWindow(room.windows[windowIndex]);
    // تم إلغاء فتح النافذة المنبثقة: setShowWindowModal(true);
  };

  // معالجة تغيير حجم الباب
  const handleDoorResize = (doorIndex, newPosition, newWidth_m) => {
    if (!selectedRoomId) return;
    const room = editableLayout.rooms.find((r) => r.id === selectedRoomId);
    if (!room || !room.doors || !room.doors[doorIndex]) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id === selectedRoomId) {
            const newDoors = [...r.doors];
            newDoors[doorIndex] = {
              ...newDoors[doorIndex],
              position: newPosition,
              width_m: Math.max(0.6, Math.min(newWidth_m, 2.5)),
            };
            return { ...r, doors: newDoors };
          }
          return r;
        }),
      };
    });
  };

  // معالجة تغيير حجم النافذة
  const handleWindowResize = (windowIndex, newPosition, newWidth_m) => {
    if (!selectedRoomId) return;
    const room = editableLayout.rooms.find((r) => r.id === selectedRoomId);
    if (!room || !room.windows || !room.windows[windowIndex]) return;

    setEditableLayout((prev) => {
      return {
        ...prev,
        rooms: prev.rooms.map((r) => {
          if (r.id === selectedRoomId) {
            const newWindows = [...r.windows];
            newWindows[windowIndex] = {
              ...newWindows[windowIndex],
              position: newPosition,
              width_m: Math.max(0.5, Math.min(newWidth_m, 3)),
            };
            return { ...r, windows: newWindows };
          }
          return r;
        }),
      };
    });
  };

  // ═══════════════════════════════════════════════
  // 💾 حفظ المخطط في قاعدة البيانات
  // ═══════════════════════════════════════════════
  const handleSave = async () => {
    if (!editableLayout) {
      alert("لا يوجد مخطط للحفظ");
      return;
    }

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await AxiosClient.post("/floor-plan/save", {
        title: title || "مخطط معدل",
        property_type: originalResult?.property_type || "apartment",
        total_area_m2: editableLayout.total_width_m * editableLayout.total_height_m,
        orientation: editableLayout.north_direction || "north",
        layout: editableLayout,
        description: originalResult?.description || null,
      }, {
        timeout: 10000,
      });

      if (response.data.success) {
        setSaveMessage({ type: "success", text: "✅ تم حفظ المخطط بنجاح!" });
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        throw new Error(response.data.message || "فشل الحفظ");
      }
    } catch (err) {
      console.error("Save error:", err);
      const errorMessage = err.response?.data?.message || err.message || "حدث خطأ أثناء الحفظ";
      setSaveMessage({ type: "error", text: `❌ ${errorMessage}` });
      setTimeout(() => setSaveMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // أنواع الغرف المتاحة
  const roomTypes = [
    { value: "living", label: "صالة" },
    { value: "kitchen", label: "مطبخ" },
    { value: "bedroom", label: "غرفة نوم" },
    { value: "master_bedroom", label: "غرفة رئيسية" },
    { value: "bathroom", label: "حمام" },
    { value: "dining", label: "غرفة طعام" },
    { value: "corridor", label: "ممر" },
    { value: "entrance", label: "مدخل" },
    { value: "storage", label: "مخزن" },
    { value: "office", label: "مكتب" },
    { value: "balcony", label: "بلكونة" },
    { value: "other", label: "أخرى" },
  ];

  // الأشكال المتاحة
  const roomShapes = [
    { value: "rectangle", label: "مستطيل" },
    { value: "l_shape", label: "حرف L" },
    { value: "triangle", label: "مثلث" },
    { value: "trapezoid", label: "شبه منحرف" },
    { value: "pentagon", label: "خماسي" },
    { value: "hexagon", label: "سداسي" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6" style={{ direction: "rtl", fontFamily: "Tahoma, Arial" }}>
      <div className="max-w-[1800px] mx-auto">
        {/* رأس الصفحة */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-800">✏️ محرر المخطط الهندسي</h1>
            <button
              onClick={() => {
                // تمرير المخطط المعدل عند العودة
                if (onLayoutUpdate && editableLayout) {
                  onLayoutUpdate(editableLayout);
                }
                onClose();
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              ← العودة
            </button>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAddRoom}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              ➕ إضافة غرفة
            </button>
            <button
              onClick={handleDeleteRoom}
              disabled={!selectedRoomId}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                selectedRoomId
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              🗑️ حذف الغرفة المحددة
            </button>
            <button
              onClick={handleExportPNG}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              📷 تصدير PNG
            </button>
            <button
              onClick={handleExportSVG}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
            >
              🖼️ تصدير SVG
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                saving
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-yellow-300 hover:bg-yellow-400 text-[#444]"
              }`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                "💾 حفظ المخطط"
              )}
            </button>
          </div>
          
          {/* رسالة الحفظ */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg ${
              saveMessage.type === "success" 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {saveMessage.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ═══════════ اللوحة الجانبية ═══════════ */}
          <div className="lg:col-span-1 space-y-6">
            {/* قائمة الغرف */}
            <div className="bg-white rounded-xl shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4 text-gray-800">📋 قائمة الغرف</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editableLayout.rooms?.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3 rounded-lg cursor-pointer transition ${
                      selectedRoomId === room.id
                        ? "bg-yellow-100 border-2 border-yellow-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="font-bold text-gray-800">{room.name}</div>
                    <div className="text-sm text-gray-600">
                      {room.width_m} × {room.height_m} م | {room.area_m2} م²
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* نموذج تعديل الغرفة */}
            {selectedRoom && (
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4 text-gray-800">✏️ تعديل الغرفة</h2>
                <div className="space-y-4">
                  {/* الاسم */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم:</label>
                    <input
                      type="text"
                      value={selectedRoom.name}
                      onChange={(e) => handleUpdateRoom({ name: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* النوع */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">النوع:</label>
                    <select
                      value={selectedRoom.type}
                      onChange={(e) => handleUpdateRoom({ type: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {roomTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* الشكل */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الشكل:</label>
                    <select
                      value={selectedRoom.shape || "rectangle"}
                      onChange={(e) => handleUpdateRoom({ shape: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {roomShapes.map((shape) => (
                        <option key={shape.value} value={shape.value}>
                          {shape.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* العرض */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="0.1"
                      value={selectedRoom.width_m}
                      onChange={(e) => handleUpdateRoom({ width_m: parseFloat(e.target.value) || 1 })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* الطول */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الطول (متر):</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      step="0.1"
                      value={selectedRoom.height_m}
                      onChange={(e) => handleUpdateRoom({ height_m: parseFloat(e.target.value) || 1 })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* معلومات إضافية */}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📐 المساحة: {selectedRoom.area_m2} م²</div>
                      <div>📍 الموقع: ({selectedRoom.x_m.toFixed(2)}, {selectedRoom.y_m.toFixed(2)})</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedRoom && (
              <div className="bg-gray-50 rounded-xl p-5 text-center text-gray-500">
                👈 اختر غرفة من القائمة لتعديلها
              </div>
            )}

            {/* ═══════════ قسم النوافذ والأبواب - زر فقط ═══════════ */}
            {selectedRoom && (
              <div className="bg-white rounded-xl shadow-lg p-5">
                <button
                  onClick={() => setShowDoorsWindowsModal(true)}
                  className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  🚪 إدارة الأبواب والنوافذ
                </button>
              </div>
            )}

            {/* ═══════════ Modal للأبواب والنوافذ ═══════════ */}
            {showDoorsWindowsModal && selectedRoom && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                onClick={() => setShowDoorsWindowsModal(false)}
              >
                <div 
                  className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{ direction: "rtl" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">🚪 إدارة الأبواب والنوافذ - {selectedRoom.name}</h2>
                    <button
                      onClick={() => setShowDoorsWindowsModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ✕
                    </button>
                  </div>
                
                  {/* الأبواب */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      🚪 الأبواب ({selectedRoom.doors?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedRoom.doors?.map((door, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-700">
                              باب {idx + 1} - {door.wall === "north" ? "شمال" : door.wall === "south" ? "جنوب" : door.wall === "east" ? "شرق" : "غرب"}
                            </span>
                            <button
                              onClick={() => {
                                const newDoors = selectedRoom.doors.filter((_, i) => i !== idx);
                                handleUpdateRoom({ doors: newDoors });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                            >
                              🗑️ حذف
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الموضع (0-1):</label>
                              <input
                                type="number"
                                min="0.1"
                                max="0.9"
                                step="0.05"
                                value={door.position}
                                onChange={(e) => {
                                  const newPosition = parseFloat(e.target.value);
                                  const updatedDoor = { ...door, position: newPosition };
                                  
                                  // التحقق من التداخل قبل التحديث (استبعاد الباب الحالي)
                                  if (checkDoorWindowOverlap(selectedRoom, updatedDoor, 'door', idx)) {
                                    alert("⚠️ لا يمكن وضع الباب في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                                    return;
                                  }
                                  
                                  const newDoors = [...selectedRoom.doors];
                                  newDoors[idx] = updatedDoor;
                                  handleUpdateRoom({ doors: newDoors });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                              <input
                                type="number"
                                min="0.6"
                                max="2"
                                step="0.1"
                                value={door.width_m}
                                onChange={(e) => {
                                  const newDoors = [...selectedRoom.doors];
                                  newDoors[idx] = { ...door, width_m: parseFloat(e.target.value) };
                                  handleUpdateRoom({ doors: newDoors });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الجدار:</label>
                              <select
                                value={door.wall}
                                onChange={(e) => {
                                  const newWall = e.target.value;
                                  const updatedDoor = { ...door, wall: newWall };
                                  
                                  // التحقق من التداخل قبل التحديث (استبعاد الباب الحالي)
                                  if (checkDoorWindowOverlap(selectedRoom, updatedDoor, 'door', idx)) {
                                    alert("⚠️ لا يمكن وضع الباب في هذا الجدار! يوجد باب أو نافذة في نفس الموقع.");
                                    return;
                                  }
                                  
                                  const newDoors = [...selectedRoom.doors];
                                  newDoors[idx] = updatedDoor;
                                  handleUpdateRoom({ doors: newDoors });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="north">شمال</option>
                                <option value="south">جنوب</option>
                                <option value="east">شرق</option>
                                <option value="west">غرب</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedRoom.doors || selectedRoom.doors.length === 0) && (
                        <div className="text-center text-gray-400 py-4">لا توجد أبواب</div>
                      )}
                      <button
                        onClick={() => {
                          const newDoor = { wall: "south", position: 0.5, width_m: 0.9, type: "single" };
                          
                          // التحقق من التداخل مع النوافذ والأبواب الأخرى
                          if (checkDoorWindowOverlap(selectedRoom, newDoor, 'door')) {
                            alert("⚠️ لا يمكن إضافة الباب في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                            return;
                          }
                          
                          const newDoors = [...(selectedRoom.doors || []), newDoor];
                          handleUpdateRoom({ doors: newDoors });
                        }}
                        className="w-full p-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition"
                      >
                        ➕ إضافة باب جديد
                      </button>
                    </div>
                  </div>

                  {/* النوافذ */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      🪟 النوافذ ({selectedRoom.windows?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedRoom.windows?.map((win, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-gray-700">
                              نافذة {idx + 1} - {win.wall === "north" ? "شمال" : win.wall === "south" ? "جنوب" : win.wall === "east" ? "شرق" : "غرب"}
                            </span>
                            <button
                              onClick={() => {
                                const newWindows = selectedRoom.windows.filter((_, i) => i !== idx);
                                handleUpdateRoom({ windows: newWindows });
                              }}
                              className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
                            >
                              🗑️ حذف
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الموضع (0-1):</label>
                              <input
                                type="number"
                                min="0.1"
                                max="0.9"
                                step="0.05"
                                value={win.position}
                                onChange={(e) => {
                                  const newPosition = parseFloat(e.target.value);
                                  const updatedWindow = { ...win, position: newPosition };
                                  
                                  // التحقق من التداخل قبل التحديث (استبعاد النافذة الحالية)
                                  if (checkDoorWindowOverlap(selectedRoom, updatedWindow, 'window', idx)) {
                                    alert("⚠️ لا يمكن وضع النافذة في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                                    return;
                                  }
                                  
                                  const newWindows = [...selectedRoom.windows];
                                  newWindows[idx] = updatedWindow;
                                  handleUpdateRoom({ windows: newWindows });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                              <input
                                type="number"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={win.width_m}
                                onChange={(e) => {
                                  const newWindows = [...selectedRoom.windows];
                                  newWindows[idx] = { ...win, width_m: parseFloat(e.target.value) };
                                  handleUpdateRoom({ windows: newWindows });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الجدار:</label>
                              <select
                                value={win.wall}
                                onChange={(e) => {
                                  const newWall = e.target.value;
                                  const updatedWindow = { ...win, wall: newWall };
                                  
                                  // التحقق من التداخل قبل التحديث (استبعاد النافذة الحالية)
                                  if (checkDoorWindowOverlap(selectedRoom, updatedWindow, 'window', idx)) {
                                    alert("⚠️ لا يمكن وضع النافذة في هذا الجدار! يوجد باب أو نافذة في نفس الموقع.");
                                    return;
                                  }
                                  
                                  const newWindows = [...selectedRoom.windows];
                                  newWindows[idx] = updatedWindow;
                                  handleUpdateRoom({ windows: newWindows });
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="north">شمال</option>
                                <option value="south">جنوب</option>
                                <option value="east">شرق</option>
                                <option value="west">غرب</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!selectedRoom.windows || selectedRoom.windows.length === 0) && (
                        <div className="text-center text-gray-400 py-4">لا توجد نوافذ</div>
                      )}
                      <button
                        onClick={() => {
                          const newWindow = { wall: "north", position: 0.5, width_m: 1.2 };
                          
                          // التحقق من التداخل مع الأبواب والنوافذ الأخرى
                          if (checkDoorWindowOverlap(selectedRoom, newWindow, 'window')) {
                            alert("⚠️ لا يمكن إضافة النافذة في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                            return;
                          }
                          
                          const newWindows = [...(selectedRoom.windows || []), newWindow];
                          handleUpdateRoom({ windows: newWindows });
                        }}
                        className="w-full p-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition"
                      >
                        ➕ إضافة نافذة جديدة
                      </button>
                    </div>
                  </div>

                  {/* زر الإغلاق */}
                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={() => setShowDoorsWindowsModal(false)}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════ قسم الأثاث ═══════════ */}
            {selectedRoom && (
              <div className="bg-white rounded-xl shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4 text-gray-800">🪑 الأثاث</h2>
                
                {/* قائمة الأثاث الموجود */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">الأثاث الموجود:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedRoom.furniture_items?.map((item) => {
                      const furnitureInfo = furnitureTypes.find((f) => f.type === item.type);
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedFurnitureId(item.id)}
                          className={`p-2 rounded-lg cursor-pointer transition text-sm ${
                            selectedFurnitureId === item.id
                              ? "bg-yellow-100 border-2 border-yellow-500"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>
                              {furnitureInfo?.icon || "🪑"} {furnitureInfo?.label || item.type}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFurniture(item.id);
                              }}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {(!selectedRoom.furniture_items || selectedRoom.furniture_items.length === 0) && (
                      <div className="text-sm text-gray-400 text-center py-2">لا يوجد أثاث</div>
                    )}
                  </div>
                </div>

                {/* إضافة أثاث جديد */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">إضافة أثاث:</h3>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {furnitureTypes.map((furniture) => (
                      <button
                        key={furniture.type}
                        onClick={() => handleAddFurniture(furniture.type)}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition text-sm flex items-center gap-2"
                      >
                        <span>{furniture.icon}</span>
                        <span>{furniture.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ═══════════ منطقة المخطط ═══════════ */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">🎨 المخطط التفاعلي</h2>
                <p className="text-sm text-gray-600">
                  اسحب الغرف لتحريكها | انقر مرتين على غرفة لتحديدها وتعديلها | أو اخترها من قائمة الغرف
                </p>
              </div>
              <div ref={svgContainerRef} className="overflow-x-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <FloorPlanSVG
                  layout={editableLayout}
                  title={title}
                  interactive={true}
                  selectedRoomId={selectedRoomId}
                  onRoomClick={handleRoomClick}
                  onRoomDrag={handleRoomDrag}
                  selectedFurnitureId={selectedFurnitureId}
                  onFurnitureDrag={handleFurnitureDrag}
                  onFurnitureClick={handleFurnitureClick}
                  onFurnitureResize={handleFurnitureResize}
                  selectedDoorIndex={selectedDoorIndex}
                  onDoorClick={handleDoorClick}
                  onDoorResize={handleDoorResize}
                  selectedWindowIndex={selectedWindowIndex}
                  onWindowClick={handleWindowClick}
                  onWindowResize={handleWindowResize}
                  onBackgroundClick={handleBackgroundClick}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ Modal لإدارة الأثاث ═══════════ */}
        {showFurnitureModal && selectedFurnitureItem && selectedRoom && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowFurnitureModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ direction: "rtl" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  🪑 إدارة الأثاث - {furnitureTypes.find(f => f.type === selectedFurnitureItem.type)?.label || selectedFurnitureItem.type}
                </h2>
                <button
                  onClick={() => setShowFurnitureModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموقع X (بكسل):</label>
                  <input
                    type="number"
                    value={selectedFurnitureItem.x}
                    onChange={(e) => {
                      const newX = Math.max(0, Math.min(parseInt(e.target.value), selectedRoom.width_px - selectedFurnitureItem.width));
                      setEditableLayout((prev) => ({
                        ...prev,
                        rooms: prev.rooms.map((r) =>
                          r.id === selectedRoomId
                            ? {
                                ...r,
                                furniture_items: r.furniture_items.map((item) =>
                                  item.id === selectedFurnitureId
                                    ? { ...item, x: newX }
                                    : item
                                ),
                              }
                            : r
                        ),
                      }));
                      setSelectedFurnitureItem({ ...selectedFurnitureItem, x: newX });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموقع Y (بكسل):</label>
                  <input
                    type="number"
                    value={selectedFurnitureItem.y}
                    onChange={(e) => {
                      const newY = Math.max(0, Math.min(parseInt(e.target.value), selectedRoom.height_px - selectedFurnitureItem.height));
                      setEditableLayout((prev) => ({
                        ...prev,
                        rooms: prev.rooms.map((r) =>
                          r.id === selectedRoomId
                            ? {
                                ...r,
                                furniture_items: r.furniture_items.map((item) =>
                                  item.id === selectedFurnitureId
                                    ? { ...item, y: newY }
                                    : item
                                ),
                              }
                            : r
                        ),
                      }));
                      setSelectedFurnitureItem({ ...selectedFurnitureItem, y: newY });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleDeleteFurniture(selectedFurnitureId);
                      setShowFurnitureModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    🗑️ حذف
                  </button>
                  <button
                    onClick={() => setShowFurnitureModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ Modal لإدارة الباب ═══════════ */}
        {showDoorModal && selectedDoor && selectedRoom && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDoorModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ direction: "rtl" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">🚪 إدارة الباب</h2>
                <button
                  onClick={() => setShowDoorModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموضع (0-1):</label>
                  <input
                    type="number"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={selectedDoor.position}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value);
                      const updatedDoor = { ...selectedDoor, position: newPosition };
                      
                      // التحقق من التداخل قبل التحديث (استبعاد الباب الحالي)
                      if (checkDoorWindowOverlap(selectedRoom, updatedDoor, 'door', selectedDoorIndex)) {
                        alert("⚠️ لا يمكن وضع الباب في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                        return;
                      }
                      
                      const newDoors = [...selectedRoom.doors];
                      newDoors[selectedDoorIndex] = updatedDoor;
                      handleUpdateRoom({ doors: newDoors });
                      setSelectedDoor(updatedDoor);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                  <input
                    type="number"
                    min="0.6"
                    max="2"
                    step="0.1"
                    value={selectedDoor.width_m}
                    onChange={(e) => {
                      const newDoors = [...selectedRoom.doors];
                      newDoors[selectedDoorIndex] = { ...selectedDoor, width_m: parseFloat(e.target.value) };
                      handleUpdateRoom({ doors: newDoors });
                      setSelectedDoor({ ...selectedDoor, width_m: parseFloat(e.target.value) });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجدار:</label>
                  <select
                    value={selectedDoor.wall}
                    onChange={(e) => {
                      const newWall = e.target.value;
                      const updatedDoor = { ...selectedDoor, wall: newWall };
                      
                      // التحقق من التداخل قبل التحديث (استبعاد الباب الحالي)
                      if (checkDoorWindowOverlap(selectedRoom, updatedDoor, 'door', selectedDoorIndex)) {
                        alert("⚠️ لا يمكن وضع الباب في هذا الجدار! يوجد باب أو نافذة في نفس الموقع.");
                        return;
                      }
                      
                      const newDoors = [...selectedRoom.doors];
                      newDoors[selectedDoorIndex] = updatedDoor;
                      handleUpdateRoom({ doors: newDoors });
                      setSelectedDoor(updatedDoor);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="north">شمال</option>
                    <option value="south">جنوب</option>
                    <option value="east">شرق</option>
                    <option value="west">غرب</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const newDoors = selectedRoom.doors.filter((_, i) => i !== selectedDoorIndex);
                      handleUpdateRoom({ doors: newDoors });
                      setShowDoorModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    🗑️ حذف
                  </button>
                  <button
                    onClick={() => setShowDoorModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ Modal لإدارة النافذة ═══════════ */}
        {showWindowModal && selectedWindow && selectedRoom && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowWindowModal(false)}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ direction: "rtl" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">🪟 إدارة النافذة</h2>
                <button
                  onClick={() => setShowWindowModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموضع (0-1):</label>
                  <input
                    type="number"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={selectedWindow.position}
                    onChange={(e) => {
                      const newPosition = parseFloat(e.target.value);
                      const updatedWindow = { ...selectedWindow, position: newPosition };
                      
                      // التحقق من التداخل قبل التحديث (استبعاد النافذة الحالية)
                      if (checkDoorWindowOverlap(selectedRoom, updatedWindow, 'window', selectedWindowIndex)) {
                        alert("⚠️ لا يمكن وضع النافذة في هذا المكان! يوجد باب أو نافذة في نفس الموقع.");
                        return;
                      }
                      
                      const newWindows = [...selectedRoom.windows];
                      newWindows[selectedWindowIndex] = updatedWindow;
                      handleUpdateRoom({ windows: newWindows });
                      setSelectedWindow(updatedWindow);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                  <input
                    type="number"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={selectedWindow.width_m}
                    onChange={(e) => {
                      const newWindows = [...selectedRoom.windows];
                      newWindows[selectedWindowIndex] = { ...selectedWindow, width_m: parseFloat(e.target.value) };
                      handleUpdateRoom({ windows: newWindows });
                      setSelectedWindow({ ...selectedWindow, width_m: parseFloat(e.target.value) });
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجدار:</label>
                  <select
                    value={selectedWindow.wall}
                    onChange={(e) => {
                      const newWall = e.target.value;
                      const updatedWindow = { ...selectedWindow, wall: newWall };
                      
                      // التحقق من التداخل قبل التحديث (استبعاد النافذة الحالية)
                      if (checkDoorWindowOverlap(selectedRoom, updatedWindow, 'window', selectedWindowIndex)) {
                        alert("⚠️ لا يمكن وضع النافذة في هذا الجدار! يوجد باب أو نافذة في نفس الموقع.");
                        return;
                      }
                      
                      const newWindows = [...selectedRoom.windows];
                      newWindows[selectedWindowIndex] = updatedWindow;
                      handleUpdateRoom({ windows: newWindows });
                      setSelectedWindow(updatedWindow);
                    }}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="north">شمال</option>
                    <option value="south">جنوب</option>
                    <option value="east">شرق</option>
                    <option value="west">غرب</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const newWindows = selectedRoom.windows.filter((_, i) => i !== selectedWindowIndex);
                      handleUpdateRoom({ windows: newWindows });
                      setShowWindowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                  >
                    🗑️ حذف
                  </button>
                  <button
                    onClick={() => setShowWindowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

