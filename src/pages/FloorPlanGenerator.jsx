import React, { useState, useRef, useMemo } from "react";
import AxiosClient from "../AxiosClient";
import FloorPlanSVG from "./FloorPlanSVG";
import FloorPlanEditor from "./FloorPlanEditor";
import FloorPlan3D from "../components/floorplan/FloorPlan3D";
import { convert2DTo3D } from "../lib/floorplan3d/converter";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function FloorPlanGenerator({ onFloorPlanCreated = null }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get('returnTo');
  const mode = searchParams.get('mode');
  const [description, setDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const svgContainerRef = useRef(null);

  // تحويل المخطط إلى 3D - يجب أن يكون خارج الشرط لضمان استدعاء useMemo دائماً
  const layout3D = useMemo(() => {
    if (result?.layout) {
      return convert2DTo3D(result.layout);
    }
    return null;
  }, [result?.layout]);

  const handleGenerate = async () => {
    const trimmedDescription = description.trim();
    
    // ✅ تحسين Validation
    if (!trimmedDescription) {
      setError("الرجاء إدخال وصف تفصيلي للعقار");
      return;
    }
    
    if (trimmedDescription.length < 10) {
      setError("الوصف يجب أن يكون 10 أحرف على الأقل");
      return;
    }
    
    if (trimmedDescription.length > 2000) {
      setError("الوصف يجب أن يكون أقل من 2000 حرف");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await AxiosClient.post("/floor-plan/generate", {
        description: trimmedDescription,
      }, {
        timeout: 240000, // ✅ زيادة timeout إلى 240 ثانية (4 دقائق)
      });
      setResult(response.data);
    } catch (err) {
      // ✅ تحسين معالجة الأخطاء
      if (err.response) {
        // خطأ من السيرفر
        const errorData = err.response.data;
        const errorMessage = errorData?.error || errorData?.message || "حدث خطأ أثناء توليد المخطط";
        setError(errorMessage);
        
        // معالجة Rate Limiting
        if (err.response.status === 429) {
          setError("تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً والمحاولة مرة أخرى");
        }
      } else if (err.request) {
        // لم يتم استلام استجابة
        if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
          setError("انتهت مهلة الاتصال. الطلب يستغرق وقتاً طويلاً. يرجى المحاولة مرة أخرى أو تقصير الوصف.");
        } else {
          setError("فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى");
        }
      } else {
        // خطأ آخر
        if (err.message?.includes('timeout')) {
          setError("انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.");
        } else {
          setError(err.message || "حدث خطأ غير متوقع");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ تحسين تصدير PNG مع معالجة الأخطاء
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
          // ✅ تحديد حجم Canvas بناءً على حجم SVG
          const maxDimension = 8000; // حد أقصى لتجنب مشاكل الذاكرة
          const scale = 2;
          let width = img.width * scale;
          let height = img.height * scale;

          // تقليل الحجم إذا كان كبيراً جداً
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
          link.download = `floor-plan-${Date.now()}.png`;
          
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

  // ✅ تصدير SVG
  const handleExportSVG = () => {
    const svgElement = svgContainerRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `floor-plan-${Date.now()}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const examples = [
    "شقة سكنية 140 متر مربع - الدور الرابع: غرفة نوم رئيسية (5.5م × 4.5م) مع حمام خاص (2.8م × 2.5م) يحتوي على دش وبانيو، غرفتان نوم أطفال (4.2م × 3.8م) و (4م × 3.6م)، صالة معيشة (7م × 5.5م) تطل على الشارع، مطبخ (4.5م × 3.8م) مجهز بالكامل، غرفة طعام (4.5م × 3.5م)، حمام ضيوف (2.5م × 2.2م)، بلكونة رئيسية (6م × 2م) تطل على الشارع، بلكونة خدمة (3م × 1.5م)، ممر رئيسي (9م × 1.5م)، مخزن (2.5م × 1.8م)، مدخل (3م × 2م)",
    "شقة عائلية 200 متر مربع - الدور السادس: غرفة نوم رئيسية (6م × 5.5م) مع حمام خاص (3.5م × 2.8م) يحتوي على جاكوزي، غرفة ملابس (3.5م × 2.5م)، 3 غرف نوم (4.8م × 4.2م) و (4.5م × 4م) و (4.2م × 3.8م)، صالة معيشة كبيرة (8م × 6.5م) مع منطقة جلوس منفصلة، مطبخ واسع (5.5م × 4.5م) مع جزيرة وسطية، غرفة طعام (5.5م × 4.5م)، حمام ضيوف (2.8م × 2.5م)، حمام خدمة (2.5م × 2م)، بلكونة رئيسية (7م × 2.5م)، بلكونة خدمة (4م × 2م)، ممر رئيسي (12م × 1.8م)، مخزن كبير (3م × 2.5م)، مدخل واسع (4م × 2.5م)",
    "استوديو عصري 70 متر مربع - الدور الثالث: غرفة معيشة ونوم مفتوحة (7م × 5.5م) مع منطقة نوم منفصلة، مطبخ أمريكي (4.5م × 2.8م) مفتوح على الصالة مع بار إفطار، حمام (2.8م × 2.5م) مع دش حديث، بلكونة (4م × 2م) تطل على الواجهة، منطقة تخزين (2.5م × 2م)، مدخل (2.5م × 1.8م)",
    "شقة راقية 110 متر مربع - الدور الثاني: غرفة نوم رئيسية (5م × 4.5م) مع حمام خاص (2.8م × 2.3م)، غرفتان نوم (4.5م × 4م) و (4.2م × 3.8م)، صالة معيشة (6.5م × 5.5م)، مطبخ (4.5م × 3.5م) مفتوح على الصالة، غرفة طعام (4.5م × 3.8م)، حمام ضيوف (2.5م × 2.2م)، بلكونة (5.5م × 2م)، ممر (8م × 1.5م)، مخزن (2.5م × 1.5م)، مدخل (3.5م × 2م)",
    "شقة دوبلكس فاخرة 250 متر مربع - الدورين الأول والثاني: الدور الأرضي - صالة استقبال كبيرة (9م × 7م)، مطبخ واسع (6م × 5م) مع جزيرة وجلسة إفطار، غرفة طعام رسمية (6.5م × 5م)، حمام ضيوف (3م × 2.5م)، مكتب منزلي (5م × 4.5م)، بلكونة أرضية (7م × 3م)، ممر (10م × 2م)، مخزن (3.5م × 2.5م)، مدخل فاخر (5م × 3م). الدور الأول - غرفة نوم رئيسية (7م × 6م) مع حمام خاص (4م × 3م) يحتوي على جاكوزي وساونا، غرفة ملابس كبيرة (4م × 3.5م)، 3 غرف نوم (5م × 4.5م) و (4.8م × 4.2م) و (4.5م × 4م)، حمام مشترك (3م × 2.5م)، صالة عائلية (6م × 5م)، بلكونة علوية (6م × 3م)، ممر (11م × 1.8م)",
  ];

  // إذا كان المحرر مفتوحاً، اعرض المحرر
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
          // تحديث المخطط في حالة result عند العودة من المحرر
          setResult((prevResult) => ({
            ...prevResult,
            layout: updatedLayout,
          }));
        }}
      />
    );
  }
  
  // إذا حاول المستخدم فتح المحرر بدون مخطط
  if (showEditor && (!result || !result.layout)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50 p-6 flex items-center justify-center" style={{ direction: "rtl", fontFamily: "Tahoma, Arial" }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">لا يوجد مخطط للتحرير</h2>
          <p className="text-gray-600 mb-6">يرجى توليد مخطط أولاً</p>
          <button
            onClick={() => setShowEditor(false)}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            ← العودة
          </button>
        </div>
      </div>
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
          <h1 className="text-4xl font-bold text-green-800 mb-3">🏗️ مولّد المخططات الهندسية الذكي</h1>
          <p className="text-gray-600 text-lg">أدخل وصف العقار وسيتم توليد مخطط هندسي تفصيلي مع الأثاث والأبعاد</p>
        </div>

        {/* منطقة الإدخال */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <label className="block text-xl font-bold text-gray-800 mb-4">✍️ وصف العقار:</label>
          <textarea
            value={description}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 2000) {
                setDescription(value);
              }
            }}
            placeholder="مثال: شقة فاخرة 150 متر في الدور الثالث، تحتوي على 3 غرف نوم (غرفة ماستر مع حمام خاص)، صالة كبيرة، مطبخ مفتوح، غرفة طعام، 2 حمام، بلكونة..."
            className="w-full h-36 p-5 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none text-lg"
            disabled={loading}
            maxLength={2000}
          />
          <div className="mt-2 text-sm text-gray-500 text-left">
            {description.length} / 2000 حرف
          </div>

          {/* الأمثلة */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-3">💡 أمثلة جاهزة:</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setDescription(ex)}
                  className="text-sm bg-yellow-100 hover:bg-yellow-200 px-4 py-2 rounded-full text-[#444] transition border border-yellow-300"
                >
                  مثال {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg text-white transition transform hover:scale-[1.02] ${
              loading || !description.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري توليد المخطط الذكي...
              </span>
            ) : (
              "🏠 توليد المخطط الهندسي"
            )}
          </button>
        </div>

        {/* الخطأ */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center gap-3">
            <span className="text-2xl">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* النتيجة */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* معلومات المخطط */}
            <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
              <div className="flex flex-wrap gap-3">
                {result.title && (
                  <span className="bg-yellow-100 text-[#444] px-4 py-2 rounded-full font-medium">📋 {result.title}</span>
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
                className="flex items-center gap-2 bg-yellow-300 hover:bg-yellow-400 text-[#444] px-5 py-2 rounded-lg font-medium transition"
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

        {/* عرض استجابة الـ AI للاختبار */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">🤖 استجابة الـ AI (للاختبار)</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const jsonString = JSON.stringify(result, null, 2);
                    navigator.clipboard.writeText(jsonString);
                    alert("تم نسخ الاستجابة إلى الحافظة!");
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                >
                  📋 نسخ JSON
                </button>
                <button
                  onClick={() => setShowAIResponse(!showAIResponse)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition"
                >
                  {showAIResponse ? "⬆️ إخفاء" : "⬇️ عرض"}
                </button>
              </div>
            </div>
            
            {showAIResponse && (
              <div className="mt-4 border-2 border-gray-200 rounded-xl overflow-hidden">
                <pre className="bg-gray-900 text-green-400 p-4 overflow-auto max-h-96 text-sm font-mono" style={{ direction: "ltr", textAlign: "left" }}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}