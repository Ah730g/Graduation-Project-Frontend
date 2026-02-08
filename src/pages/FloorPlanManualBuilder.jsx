import React, { useState, useRef, useMemo } from "react";
import AxiosClient from "../AxiosClient";
import FloorPlanSVG from "./FloorPlanSVG";
import FloorPlanEditor from "./FloorPlanEditor";
import FloorPlan3D from "../components/floorplan/FloorPlan3D";
import { convert2DTo3D } from "../lib/floorplan3d/converter";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function FloorPlanManualBuilder({ onFloorPlanCreated = null }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get('returnTo');
  const [propertyInfo, setPropertyInfo] = useState({
    title: "",
    property_type: "apartment",
    total_area_m2: "",
    orientation: "north"
  });

  const [rooms, setRooms] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [selectedRoomForFurniture, setSelectedRoomForFurniture] = useState(null);
  const [roomErrors, setRoomErrors] = useState({});
  const svgContainerRef = useRef(null);

  // تحويل المخطط إلى 3D
  const layout3D = useMemo(() => {
    if (result?.layout) {
      return convert2DTo3D(result.layout);
    }
    return null;
  }, [result?.layout]);

  // حساب تقدم الإدخال
  const getFormProgress = () => {
    if (rooms.length === 0) return 0;
    const completedRooms = rooms.filter(r => 
      r.name?.trim() && r.width_m > 0 && r.height_m > 0
    ).length;
    return Math.round((completedRooms / rooms.length) * 100);
  };

  // تبديل حالة توسيع/طي الغرفة
  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  // الحصول على الأثاث حسب نوع الغرفة
  const getFurnitureByRoomType = (roomType) => {
    const furnitureMap = {
      living: [
        { type: "sofa", label: "كنبة", icon: "🛋️" },
        { type: "tv", label: "تلفاز", icon: "📺" },
        { type: "coffee_table", label: "طاولة قهوة", icon: "☕" },
        { type: "bookshelf", label: "رف كتب", icon: "📚" },
        { type: "chair", label: "كرسي", icon: "💺" },
      ],
      bedroom: [
        { type: "bed", label: "سرير", icon: "🛏️" },
        { type: "wardrobe", label: "خزانة", icon: "🚪" },
        { type: "nightstand", label: "منضدة", icon: "🪑" },
        { type: "desk", label: "مكتب", icon: "🖥️" },
        { type: "chair", label: "كرسي", icon: "💺" },
      ],
      master_bedroom: [
        { type: "king_bed", label: "سرير كبير", icon: "🛏️" },
        { type: "wardrobe", label: "خزانة", icon: "🚪" },
        { type: "nightstand", label: "منضدة", icon: "🪑" },
        { type: "vanity", label: "طاولة زينة", icon: "💄" },
        { type: "bookshelf", label: "رف كتب", icon: "📚" },
        { type: "chair", label: "كرسي", icon: "💺" },
      ],
      kitchen: [
        { type: "counter", label: "كونتر", icon: "🍳" },
        { type: "sink", label: "حوض", icon: "🚿" },
        { type: "stove", label: "موقد", icon: "🔥" },
        { type: "fridge", label: "ثلاجة", icon: "❄️" },
        { type: "dining_table", label: "طاولة طعام", icon: "🍽️" },
      ],
      bathroom: [
        { type: "toilet", label: "مرحاض", icon: "🚽" },
        { type: "sink", label: "حوض", icon: "🚿" },
        { type: "shower", label: "دش", icon: "🚿" },
        { type: "bathtub", label: "بانيو", icon: "🛁" },
      ],
      dining: [
        { type: "dining_table", label: "طاولة طعام", icon: "🍽️" },
        { type: "chairs", label: "كراسي", icon: "💺" },
        { type: "bookshelf", label: "رف كتب", icon: "📚" },
      ],
      office: [
        { type: "desk", label: "مكتب", icon: "🖥️" },
        { type: "chair", label: "كرسي", icon: "💺" },
        { type: "bookshelf", label: "رف كتب", icon: "📚" },
        { type: "coffee_table", label: "طاولة قهوة", icon: "☕" },
      ],
      balcony: [
        { type: "plants", label: "نباتات", icon: "🌿" },
        { type: "chair", label: "كرسي", icon: "💺" },
        { type: "coffee_table", label: "طاولة قهوة", icon: "☕" },
      ],
      entrance: [
        { type: "shoe_rack", label: "رف أحذية", icon: "👟" },
        { type: "chair", label: "كرسي", icon: "💺" },
      ],
      storage: [
        { type: "shelves", label: "رفوف", icon: "📦" },
      ],
      corridor: [],
      other: [
        { type: "chair", label: "كرسي", icon: "💺" },
        { type: "desk", label: "مكتب", icon: "🖥️" },
      ],
    };
    return furnitureMap[roomType] || [];
  };

  // إضافة غرفة جديدة
  const addRoom = () => {
    const newRoom = {
      id: `room-${Date.now()}`,
      name: "",
      type: "other",
      shape: "rectangle",
      width_m: 4,
      height_m: 4,
      doors: [{ wall: "south", position: 0.5, width_m: 0.9, type: "single" }],
      windows: [],
      furniture: []
    };
    setRooms([...rooms, newRoom]);
    // توسيع الغرفة الجديدة تلقائياً
    setExpandedRooms(prev => ({ ...prev, [newRoom.id]: true }));
    // إزالة أخطاء الغرفة القديمة
    setRoomErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[newRoom.id];
      return newErrors;
    });
  };

  // إضافة غرفة شائعة سريعاً
  const addCommonRoom = (type, name, width, height) => {
    const newRoom = {
      id: `room-${Date.now()}`,
      name: name,
      type: type,
      shape: "rectangle",
      width_m: width,
      height_m: height,
      doors: [{ wall: "south", position: 0.5, width_m: 0.9, type: "single" }],
      windows: type === 'bedroom' || type === 'living' ? [{ wall: "north", position: 0.5, width_m: 1.2 }] : [],
      furniture: []
    };
    setRooms([...rooms, newRoom]);
    setExpandedRooms(prev => ({ ...prev, [newRoom.id]: true }));
  };

  // تحديث غرفة
  const updateRoom = (roomId, updates) => {
    setRooms(rooms.map(r => r.id === roomId ? { ...r, ...updates } : r));
    
    // التحقق من الأخطاء عند التحديث
    const updatedRoom = { ...rooms.find(r => r.id === roomId), ...updates };
    const errors = validateRoom(updatedRoom);
    setRoomErrors(prev => ({
      ...prev,
      [roomId]: errors
    }));
  };

  // التحقق من صحة بيانات الغرفة
  const validateRoom = (room) => {
    const errors = {};
    if (!room.name?.trim()) {
      errors.name = 'يرجى إدخال اسم الغرفة';
    }
    if (!room.width_m || room.width_m <= 0) {
      errors.width_m = 'يرجى إدخال عرض صحيح (أكبر من 0)';
    }
    if (!room.height_m || room.height_m <= 0) {
      errors.height_m = 'يرجى إدخال طول صحيح (أكبر من 0)';
    }
    return errors;
  };

  // إضافة أثاث لغرفة
  const addFurnitureToRoom = (roomId, furnitureType) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const currentFurniture = room.furniture || [];
    if (!currentFurniture.includes(furnitureType)) {
      updateRoom(roomId, { 
        furniture: [...currentFurniture, furnitureType] 
      });
    }
  };

  // حذف أثاث من غرفة
  const removeFurnitureFromRoom = (roomId, furnitureType) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const currentFurniture = room.furniture || [];
    updateRoom(roomId, { 
      furniture: currentFurniture.filter(f => f !== furnitureType) 
    });
  };

  // إضافة باب
  const addDoor = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newDoor = { wall: "south", position: 0.5, width_m: 0.9, type: "single" };
    updateRoom(roomId, {
      doors: [...(room.doors || []), newDoor]
    });
  };

  // حذف باب
  const removeDoor = (roomId, doorIndex) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newDoors = room.doors.filter((_, i) => i !== doorIndex);
    updateRoom(roomId, { doors: newDoors });
  };

  // تحديث باب
  const updateDoor = (roomId, doorIndex, updates) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newDoors = [...room.doors];
    newDoors[doorIndex] = { ...newDoors[doorIndex], ...updates };
    updateRoom(roomId, { doors: newDoors });
  };

  // إضافة نافذة
  const addWindow = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newWindow = { wall: "north", position: 0.5, width_m: 1.2 };
    updateRoom(roomId, {
      windows: [...(room.windows || []), newWindow]
    });
  };

  // حذف نافذة
  const removeWindow = (roomId, windowIndex) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newWindows = room.windows.filter((_, i) => i !== windowIndex);
    updateRoom(roomId, { windows: newWindows });
  };

  // تحديث نافذة
  const updateWindow = (roomId, windowIndex, updates) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const newWindows = [...room.windows];
    newWindows[windowIndex] = { ...newWindows[windowIndex], ...updates };
    updateRoom(roomId, { windows: newWindows });
  };

  // حذف غرفة
  const removeRoom = (roomId) => {
    setRooms(rooms.filter(r => r.id !== roomId));
    setExpandedRooms(prev => {
      const newExpanded = { ...prev };
      delete newExpanded[roomId];
      return newExpanded;
    });
    setRoomErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[roomId];
      return newErrors;
    });
  };

  // توليد المخطط
  const handleGenerate = async () => {
    // التحقق من البيانات
    if (!propertyInfo.title.trim()) {
      setError("الرجاء إدخال عنوان للمخطط");
      return;
    }

    if (rooms.length === 0) {
      setError("الرجاء إضافة غرفة واحدة على الأقل");
      return;
    }

    // التحقق من صحة جميع الغرف
    let hasErrors = false;
    const newRoomErrors = {};
    for (const room of rooms) {
      const errors = validateRoom(room);
      if (Object.keys(errors).length > 0) {
        hasErrors = true;
        newRoomErrors[room.id] = errors;
      }
    }
    setRoomErrors(newRoomErrors);

    if (hasErrors) {
      setError("يرجى تصحيح الأخطاء في بيانات الغرف");
      // توسيع جميع الغرف التي بها أخطاء
      const roomsWithErrors = rooms.filter(r => newRoomErrors[r.id]);
      setExpandedRooms(prev => {
        const newExpanded = { ...prev };
        roomsWithErrors.forEach(r => {
          newExpanded[r.id] = true;
        });
        return newExpanded;
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await AxiosClient.post("/floor-plan/generate-manual", {
        title: propertyInfo.title,
        property_type: propertyInfo.property_type,
        total_area_m2: propertyInfo.total_area_m2 ? parseFloat(propertyInfo.total_area_m2) : null,
        orientation: propertyInfo.orientation,
        rooms: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          shape: room.shape,
          width_m: parseFloat(room.width_m),
          height_m: parseFloat(room.height_m),
          doors: room.doors || [],
          windows: room.windows || [],
          furniture: room.furniture || []
        }))
      }, {
        timeout: 30000,
      });

      setResult(response.data);
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        setError(errorData?.error || errorData?.message || "حدث خطأ أثناء توليد المخطط");
      } else if (err.request) {
        setError("فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت");
      } else {
        setError(err.message || "حدث خطأ غير متوقع");
      }
    } finally {
      setLoading(false);
    }
  };

  // تصدير PNG
  const handleExportPNG = () => {
    try {
      const svgElement = svgContainerRef.current?.querySelector("svg");
      if (!svgElement) {
        setError("لم يتم العثور على المخطط للتصدير");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setError("المتصفح لا يدعم تصدير PNG");
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
        setError("فشل تحميل الصورة للتصدير. يرجى المحاولة مرة أخرى أو استخدام تصدير SVG.");
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
          link.download = `floor-plan-manual-${Date.now()}.png`;
          
          try {
            link.href = canvas.toDataURL("image/png");
            link.click();
          } catch (dataUrlErr) {
            // إذا فشل toDataURL، استخدم طريقة بديلة
            if (dataUrlErr.message && (dataUrlErr.message.includes('tainted') || dataUrlErr.message.includes('Tainted'))) {
              setError("تعذر تصدير PNG بسبب قيود الأمان. يرجى استخدام تصدير SVG بدلاً من ذلك.");
            } else {
              throw dataUrlErr;
            }
          }
        } catch (err) {
          if (err.message && (err.message.includes('tainted') || err.message.includes('Tainted'))) {
            setError("تعذر تصدير PNG بسبب قيود الأمان. يرجى استخدام تصدير SVG بدلاً من ذلك.");
          } else {
            setError("فشل تصدير الصورة: " + (err.message || "خطأ غير معروف"));
          }
        }
      };

      img.src = svgDataUrl;
    } catch (err) {
      setError("حدث خطأ أثناء تصدير PNG: " + (err.message || "خطأ غير معروف"));
    }
  };

  // تصدير SVG
  const handleExportSVG = () => {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `floor-plan-manual-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  // أنواع الغرف
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

  // إذا كان المحرر مفتوحاً
  if (showEditor && result && result.layout) {
    return (
      <FloorPlanEditor
        initialLayout={result.layout}
        title={result.title}
        originalResult={result}
        onClose={() => {
          setShowEditor(false);
          // إذا كان هناك callback وتم التعديل، استدعيه
          if (onFloorPlanCreated) {
            onFloorPlanCreated(result);
          } else if (returnTo === 'addPost') {
            // حفظ المخطط المحدث والعودة
            localStorage.setItem('savedFloorPlanForAddPost', JSON.stringify(result));
            const returnUrl = localStorage.getItem('floorPlanReturnUrl') || '/post/add';
            localStorage.removeItem('floorPlanReturnUrl');
            localStorage.removeItem('floorPlanReturnData');
            navigate(returnUrl);
          }
        }}
        onLayoutUpdate={(updatedLayout) => {
          setResult((prevResult) => ({
            ...prevResult,
            layout: updatedLayout,
          }));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6" style={{ direction: "rtl", fontFamily: "Tahoma, Arial" }}>
      <div className="max-w-7xl mx-auto">
        {/* زر العودة */}
        {returnTo === 'addPost' && (
          <div className="mb-4">
            <button
              onClick={() => {
                const returnUrl = localStorage.getItem('floorPlanReturnUrl') || '/post/add';
                localStorage.removeItem('floorPlanReturnUrl');
                localStorage.removeItem('floorPlanReturnData');
                navigate(returnUrl);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              ← العودة إلى إضافة الشقة
            </button>
          </div>
        )}
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-3">🏗️ بناء المخطط يدوياً</h1>
          <p className="text-gray-600 text-lg">أدخل بيانات العقار والغرف يدوياً لإنشاء مخطط هندسي تفصيلي</p>
        </div>

        {/* Progress Indicator */}
        {rooms.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">تقدم الإدخال</span>
              <span className="text-sm font-bold text-green-600">{getFormProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getFormProgress()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {rooms.filter(r => r.name?.trim() && r.width_m > 0 && r.height_m > 0).length} من {rooms.length} غرفة مكتملة
            </p>
          </div>
        )}

        {/* معلومات العقار */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 معلومات العقار</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">العنوان:</label>
              <input
                type="text"
                value={propertyInfo.title}
                onChange={(e) => setPropertyInfo({...propertyInfo, title: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="مثال: شقة سكنية 140 متر مربع"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار:</label>
              <select
                value={propertyInfo.property_type}
                onChange={(e) => setPropertyInfo({...propertyInfo, property_type: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="apartment">شقة</option>
                <option value="villa">فيلا</option>
                <option value="duplex">دوبلكس</option>
                <option value="studio">استوديو</option>
                <option value="office">مكتب</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المساحة الإجمالية (م²) - اختياري:</label>
              <input
                type="number"
                min="10"
                max="10000"
                step="0.1"
                value={propertyInfo.total_area_m2}
                onChange={(e) => setPropertyInfo({...propertyInfo, total_area_m2: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="مثال: 140"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الاتجاه:</label>
              <select
                value={propertyInfo.orientation}
                onChange={(e) => setPropertyInfo({...propertyInfo, orientation: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="north">شمال</option>
                <option value="south">جنوب</option>
                <option value="east">شرق</option>
                <option value="west">غرب</option>
              </select>
            </div>
          </div>
        </div>

        {/* قائمة الغرف */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🏠 الغرف ({rooms.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={addRoom}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2"
              >
                ➕ إضافة غرفة
              </button>
            </div>
          </div>

          {/* Quick Actions - دائماً ظاهرة */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">➕ إضافة سريعة:</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => addCommonRoom('living', 'صالة', 6, 4)} 
                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition"
              >
                🛋️ صالة
              </button>
              <button 
                onClick={() => addCommonRoom('bedroom', 'غرفة نوم', 4, 3.5)} 
                className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition"
              >
                🛏️ غرفة نوم
              </button>
              <button 
                onClick={() => addCommonRoom('kitchen', 'مطبخ', 3, 2.5)} 
                className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition"
              >
                🍳 مطبخ
              </button>
              <button 
                onClick={() => addCommonRoom('bathroom', 'حمام', 2.5, 2.5)} 
                className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-[#444] rounded-lg text-sm font-medium transition"
              >
                🚿 حمام
              </button>
              <button 
                onClick={() => addCommonRoom('master_bedroom', 'غرفة رئيسية', 5, 4.5)} 
                className="px-3 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-lg text-sm font-medium transition"
              >
                👑 غرفة رئيسية
              </button>
            </div>
          </div>

          {rooms.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-lg">لا توجد غرف بعد. اضغط على "إضافة غرفة" أو استخدم الأزرار السريعة أعلاه</p>
            </div>
          )}

          <div className="space-y-4">
            {rooms.map((room, idx) => (
              <div 
                key={room.id} 
                className={`border-2 rounded-xl p-5 transition ${
                  roomErrors[room.id] && Object.keys(roomErrors[room.id]).length > 0
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                {/* Header مع Collapse */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleRoomExpand(room.id)}
                      className="text-xl text-gray-600 hover:text-gray-800 transition"
                    >
                      {expandedRooms[room.id] ? '▼' : '▶'}
                    </button>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">
                        {room.name || `غرفة #${idx + 1}`}
                      </h3>
                      {room.name && (
                        <div className="flex gap-2 mt-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {room.width_m} × {room.height_m} م
                          </span>
                          <span className="px-2 py-1 bg-yellow-100 text-[#444] rounded text-xs">
                            {room.furniture?.length || 0} قطعة أثاث
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeRoom(room.id)}
                    className="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1 hover:bg-red-50 rounded-lg transition"
                  >
                    🗑️ حذف
                  </button>
                </div>
                
                {/* محتوى الغرفة (Collapsible) */}
                {expandedRooms[room.id] && (
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {/* معلومات أساسية */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الاسم:</label>
                        <input
                          type="text"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            roomErrors[room.id]?.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="مثال: صالة معيشة"
                        />
                        {roomErrors[room.id]?.name && (
                          <p className="text-red-500 text-xs mt-1">{roomErrors[room.id].name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">النوع:</label>
                        <select
                          value={room.type}
                          onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          {roomTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الشكل:</label>
                        <select
                          value={room.shape}
                          onChange={(e) => updateRoom(room.id, { shape: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          {roomShapes.map((shape) => (
                            <option key={shape.value} value={shape.value}>
                              {shape.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* الأبعاد */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العرض (متر):</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          step="0.1"
                          value={room.width_m}
                          onChange={(e) => updateRoom(room.id, { width_m: parseFloat(e.target.value) || 1 })}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            roomErrors[room.id]?.width_m ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {roomErrors[room.id]?.width_m && (
                          <p className="text-red-500 text-xs mt-1">{roomErrors[room.id].width_m}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الطول (متر):</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          step="0.1"
                          value={room.height_m}
                          onChange={(e) => updateRoom(room.id, { height_m: parseFloat(e.target.value) || 1 })}
                          className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                            roomErrors[room.id]?.height_m ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {roomErrors[room.id]?.height_m && (
                          <p className="text-red-500 text-xs mt-1">{roomErrors[room.id].height_m}</p>
                        )}
                      </div>
                    </div>

                    {/* الأثاث */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          🪑 الأثاث ({room.furniture?.length || 0}):
                        </label>
                        <button
                          onClick={() => setSelectedRoomForFurniture(room.id)}
                          className="text-sm bg-yellow-100 hover:bg-yellow-200 text-[#444] px-3 py-1 rounded-lg font-medium transition"
                        >
                          ➕ إضافة أثاث
                        </button>
                      </div>
                      
                      {/* عرض الأثاث الموجود */}
                      {room.furniture && room.furniture.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          {room.furniture.map((furnitureType, furnitureIdx) => {
                            const furnitureOptions = getFurnitureByRoomType(room.type);
                            const furnitureInfo = furnitureOptions.find(f => f.type === furnitureType);
                            return furnitureInfo ? (
                              <span
                                key={furnitureIdx}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-purple-300 rounded-lg text-sm shadow-sm"
                              >
                                <span>{furnitureInfo.icon}</span>
                                <span>{furnitureInfo.label}</span>
                                <button
                                  onClick={() => removeFurnitureFromRoom(room.id, furnitureType)}
                                  className="text-red-500 hover:text-red-700 mr-1 font-bold"
                                >
                                  ✕
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                      {(!room.furniture || room.furniture.length === 0) && (
                        <p className="text-sm text-gray-400 text-center py-2 bg-gray-50 rounded-lg">لا يوجد أثاث</p>
                      )}
                    </div>

                    {/* الأبواب */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">🚪 الأبواب ({room.doors?.length || 0}):</label>
                        <button
                          onClick={() => addDoor(room.id)}
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium transition"
                        >
                          ➕ إضافة باب
                        </button>
                      </div>
                      {room.doors?.map((door, doorIdx) => (
                        <div key={doorIdx} className="flex gap-2 mb-2 p-2 bg-white rounded-lg border border-gray-200">
                          <select
                            value={door.wall}
                            onChange={(e) => updateDoor(room.id, doorIdx, { wall: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="north">شمال</option>
                            <option value="south">جنوب</option>
                            <option value="east">شرق</option>
                            <option value="west">غرب</option>
                          </select>
                          <input
                            type="number"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={door.position}
                            onChange={(e) => updateDoor(room.id, doorIdx, { position: parseFloat(e.target.value) })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="الموضع (0-1)"
                          />
                          <input
                            type="number"
                            min="0.6"
                            max="2"
                            step="0.1"
                            value={door.width_m}
                            onChange={(e) => updateDoor(room.id, doorIdx, { width_m: parseFloat(e.target.value) })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="العرض (م)"
                          />
                          <button
                            onClick={() => removeDoor(room.id, doorIdx)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      {(!room.doors || room.doors.length === 0) && (
                        <p className="text-sm text-gray-400 text-center py-2">لا توجد أبواب</p>
                      )}
                    </div>

                    {/* النوافذ */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">🪟 النوافذ ({room.windows?.length || 0}):</label>
                        <button
                          onClick={() => addWindow(room.id)}
                          className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg font-medium transition"
                        >
                          ➕ إضافة نافذة
                        </button>
                      </div>
                      {room.windows?.map((window, winIdx) => (
                        <div key={winIdx} className="flex gap-2 mb-2 p-2 bg-white rounded-lg border border-gray-200">
                          <select
                            value={window.wall}
                            onChange={(e) => updateWindow(room.id, winIdx, { wall: e.target.value })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="north">شمال</option>
                            <option value="south">جنوب</option>
                            <option value="east">شرق</option>
                            <option value="west">غرب</option>
                          </select>
                          <input
                            type="number"
                            min="0.1"
                            max="0.9"
                            step="0.05"
                            value={window.position}
                            onChange={(e) => updateWindow(room.id, winIdx, { position: parseFloat(e.target.value) })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="الموضع (0-1)"
                          />
                          <input
                            type="number"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={window.width_m}
                            onChange={(e) => updateWindow(room.id, winIdx, { width_m: parseFloat(e.target.value) })}
                            className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="العرض (م)"
                          />
                          <button
                            onClick={() => removeWindow(room.id, winIdx)}
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      {(!room.windows || room.windows.length === 0) && (
                        <p className="text-sm text-gray-400 text-center py-2">لا توجد نوافذ</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal لإضافة الأثاث */}
        {selectedRoomForFurniture && (() => {
          const room = rooms.find(r => r.id === selectedRoomForFurniture);
          if (!room) return null;
          
          return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedRoomForFurniture(null)}>
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ direction: 'rtl' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">اختر الأثاث للغرفة: {room.name || `غرفة #${rooms.indexOf(room) + 1}`}</h3>
                  <button
                    onClick={() => setSelectedRoomForFurniture(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {getFurnitureByRoomType(room.type).map((furniture) => {
                    const isSelected = room.furniture?.includes(furniture.type);
                    return (
                      <button
                        key={furniture.type}
                        onClick={() => {
                          if (isSelected) {
                            removeFurnitureFromRoom(room.id, furniture.type);
                          } else {
                            addFurnitureToRoom(room.id, furniture.type);
                          }
                        }}
                        className={`p-4 rounded-lg border-2 transition ${
                          isSelected
                            ? 'bg-yellow-100 border-yellow-500 text-[#444]'
                            : 'bg-gray-50 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                        }`}
                      >
                        <div className="text-3xl mb-2">{furniture.icon}</div>
                        <div className="text-sm font-medium">{furniture.label}</div>
                        {isSelected && (
                          <div className="text-xs mt-1 text-green-600">✓ محددة</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {getFurnitureByRoomType(room.type).length === 0 && (
                  <p className="text-center text-gray-500 py-4">لا يوجد أثاث متاح لهذا النوع من الغرف</p>
                )}
                
                <button
                  onClick={() => setSelectedRoomForFurniture(null)}
                  className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                >
                  إغلاق
                </button>
              </div>
            </div>
          );
        })()}

        {/* زر التوليد */}
        <div className="text-center mb-6">
          <button
            onClick={handleGenerate}
            disabled={loading || rooms.length === 0}
            className={`px-8 py-4 rounded-xl font-bold text-lg text-white transition transform hover:scale-[1.02] ${
              loading || rooms.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري توليد المخطط...
              </span>
            ) : (
              "🏠 توليد المخطط"
            )}
          </button>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* عرض النتيجة */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* معلومات المخطط */}
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex flex-wrap gap-3">
                {result.title && (
                  <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-medium">📋 {result.title}</span>
                )}
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  🏠 {result.property_type === "apartment" ? "شقة" : result.property_type}
                </span>
                {result.total_area_m2 && (
                  <span className="bg-yellow-200 text-[#444] px-4 py-2 rounded-full font-medium">📐 {result.total_area_m2} م²</span>
                )}
                <span className="bg-green-200 text-green-800 px-4 py-2 rounded-full font-medium">🚪 {result.layout?.rooms?.length || 0} غرف</span>
              </div>
            </div>

            {/* أزرار التصدير والتعديل */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {(onFloorPlanCreated || returnTo === 'addPost') && (
                <button
                  onClick={() => {
                    if (onFloorPlanCreated) {
                      onFloorPlanCreated(result);
                    } else if (returnTo === 'addPost') {
                      // حفظ المخطط في localStorage والعودة
                      localStorage.setItem('savedFloorPlanForAddPost', JSON.stringify(result));
                      const returnUrl = localStorage.getItem('floorPlanReturnUrl') || '/post/add';
                      localStorage.removeItem('floorPlanReturnUrl');
                      localStorage.removeItem('floorPlanReturnData');
                      navigate(returnUrl);
                    }
                  }}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition shadow-lg"
                >
                  ✅ استخدام هذا المخطط والعودة
                </button>
              )}
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-[#444] px-5 py-2 rounded-lg font-medium transition"
              >
                ✏️ تعديل المخطط
              </button>
              <button
                onClick={() => setShow3D(!show3D)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
              >
                {show3D ? "📐 عرض 2D" : "🎮 عرض 3D"}
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
            </div>

            {/* المخطط */}
            {show3D && layout3D ? (
              <div className="mb-6">
                <FloorPlan3D 
                  layout={layout3D} 
                  onClose={() => setShow3D(false)}
                />
              </div>
            ) : (
              <div ref={svgContainerRef} className="overflow-x-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <FloorPlanSVG layout={result.layout} title={result.title} />
              </div>
            )}

            {/* قائمة الغرف */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">📋 تفاصيل الغرف:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.layout?.rooms?.map((room, idx) => (
                  <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition">
                    <div className="font-bold text-gray-800 text-lg mb-2">{room.name}</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📐 الأبعاد: {room.width_m} × {room.height_m} م</div>
                      <div>📊 المساحة: {room.area_m2} م²</div>
                      <div>🔷 الشكل: {room.shape === "rectangle" ? "مستطيل" : room.shape === "l_shape" ? "حرف L" : room.shape}</div>
                      {room.doors?.length > 0 && (
                        <div>🚪 الأبواب: {room.doors.length}</div>
                      )}
                      {room.windows?.length > 0 && (
                        <div>🪟 النوافذ: {room.windows.length}</div>
                      )}
                      {room.furniture?.length > 0 && (
                        <div>🪑 الأثاث: {room.furniture.length} قطعة</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
