import React, { Suspense, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Room3DComponent from './Room3D';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold mb-2">خطأ في عرض 3D</h2>
          <p className="text-sm mb-4">{this.state.error?.message || 'حدث خطأ غير معروف'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            إعادة المحاولة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function FloorPlan3D({ layout, onClose }) {
  if (!layout || !layout.rooms || layout.rooms.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
        <span className="text-4xl mb-4 block">🏠</span>
        لا توجد بيانات مخطط لعرضها
      </div>
    );
  }

  // حساب مركز المشهد
  const centerX = layout.total_width_m / 2;
  const centerZ = layout.total_height_m / 2;
  const maxDimension = Math.max(layout.total_width_m, layout.total_height_m);
  const cameraDistance = maxDimension * 1.5;

  return (
    <ErrorBoundary>
      <div className="relative w-full h-[600px] bg-gray-900 rounded-xl overflow-hidden">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-lg font-medium transition"
            style={{ direction: 'rtl' }}
          >
            ✕ إغلاق العرض 3D
          </button>
        )}
        
        <Canvas
          gl={{ 
            antialias: true, 
            alpha: false,
            // تعطيل تحميل الخطوط من CDN لتجنب الأخطاء
            powerPreference: "high-performance",
            stencil: false,
            depth: true
          }}
          camera={{
            position: [cameraDistance, cameraDistance * 0.7, cameraDistance],
            fov: 50,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor('#1a1a1a');
          }}
          dpr={[1, 2]}
        >
        <Suspense fallback={null}>
          {/* الإضاءة */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          <hemisphereLight intensity={0.3} />

          {/* الكاميرا */}
          <PerspectiveCamera makeDefault position={[cameraDistance, cameraDistance * 0.7, cameraDistance]} />

          {/* التحكم بالكاميرا */}
          <OrbitControls
            target={[centerX, 0, centerZ]}
            minDistance={maxDimension * 0.5}
            maxDistance={maxDimension * 3}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />

          {/* الأرضية الخلفية */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[centerX, -0.1, centerZ]}
          >
            <planeGeometry args={[maxDimension * 3, maxDimension * 3]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>

          {/* رسم الغرف */}
          {layout.rooms.map((room, index) => (
            <Room3DComponent key={room.id || `room-${index}`} room={room} />
          ))}
        </Suspense>
      </Canvas>

      {/* معلومات التحكم */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm" style={{ direction: 'rtl' }}>
        <div>🖱️ اسحب للتدوير | 🔍 عجلة الماوس للتصغير/التكبير</div>
      </div>
    </div>
    </ErrorBoundary>
  );
}

