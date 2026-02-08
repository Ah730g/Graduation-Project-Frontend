import { Link } from "react-router-dom";

export default function FloorPlanHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50" style={{ direction: "rtl", fontFamily: "Tahoma, Arial" }}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🏗️ نظام إنشاء المخططات الهندسية</h1>
          <p className="text-xl text-gray-600">اختر الطريقة المناسبة لإنشاء مخططك الهندسي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link
            to="/floor-plan"
            className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-green-500"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">الذكاء الاصطناعي</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              وصف بسيط لعقارك وسنقوم بإنشاء المخطط الهندسي تلقائياً باستخدام الذكاء الاصطناعي المتقدم
            </p>
            <div className="flex items-center text-green-600 font-semibold group-hover:text-green-700">
              ابدأ الآن
              <svg className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">⚡ سريع</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">🎯 دقيق</span>
              </div>
            </div>
          </Link>

          <Link
            to="/floor-plan/manual"
            className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-yellow-400"
          >
            <div className="text-6xl mb-4">✏️</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">الطريقة اليدوية</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              أنشئ مخططك الهندسي خطوة بخطوة مع تحكم كامل في التفاصيل والأبعاد والأثاث
            </p>
            <div className="flex items-center text-[#444] font-semibold group-hover:text-[#333]">
              ابدأ الآن
              <svg className="w-5 h-5 mr-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-yellow-100 text-[#444] rounded-full text-sm">🎨 مخصص</span>
                <span className="px-3 py-1 bg-yellow-100 text-[#444] rounded-full text-sm">📐 دقيق</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            💡 نصيحة: استخدم الذكاء الاصطناعي للسرعة، والطريقة اليدوية للتحكم الكامل في التفاصيل
          </p>
        </div>
      </div>
    </div>
  );
}
