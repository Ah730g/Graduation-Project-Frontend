/**
 * نظام تحميل وإدارة نماذج 3D للأثاث
 * يدعم GLTF/GLB models مع caching لتحسين الأداء
 */

import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useMemo } from 'react';
import * as THREE from 'three';

// إعداد DRACOLoader - سيتم استخدامه في extension function
// استخدام CDN من Google لملفات Draco decoder
const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

// إنشاء DRACOLoader مرة واحدة فقط (shared instance)
let dracoLoaderInstance = null;
let dracoLoaderFailed = false;

function getDracoLoader() {
  if (dracoLoaderFailed) {
    return null; // لا تحاول استخدام Draco إذا فشل سابقاً
  }
  
  if (!dracoLoaderInstance) {
    try {
      dracoLoaderInstance = new DRACOLoader();
      dracoLoaderInstance.setDecoderPath(DRACO_DECODER_PATH);
    } catch (error) {
      console.warn('[modelLoader] Failed to initialize DRACOLoader, will skip Draco compression:', error);
      dracoLoaderFailed = true;
      return null;
    }
  }
  return dracoLoaderInstance;
}

// خريطة مسارات النماذج حسب نوع الأثاث
// يمكن إضافة نماذج جديدة هنا
export const FURNITURE_MODELS = {
  'sofa': '/models/furniture/sofa.glb',
  'bed': '/models/furniture/bed.glb',
  'chair': '/models/furniture/chair.glb',
};

// إعدادات الدوران التصحيحي لكل نوع أثاث (بالراديان)
// بعض النماذج قد تكون محفوظة باتجاه مختلف، نصححها هنا
// [rotationX, rotationY, rotationZ] - الدوران بالراديان
// Math.PI = 180 درجة، Math.PI/2 = 90 درجة، -Math.PI/2 = -90 درجة
// راجع FIX_SOFA_ROTATION.md للقيم المتاحة
export const FURNITURE_ROTATION_CORRECTION = {
  'sofa': [0, -Math.PI / 2, 0], // دوران -90 درجة حول المحور Y
  // إذا لم تعمل، جرب: [0, Math.PI, 0] أو [0, Math.PI / 2, 0] أو [0, 0, 0]
  // يمكن إضافة المزيد هنا حسب الحاجة
  // 'bed': [0, Math.PI, 0], // مثال: دوران 180 درجة
  // 'chair': [0, -Math.PI / 2, 0], // مثال: دوران -90 درجة
};

// Cache للنماذج المحملة
const modelCache = new Map();

/**
 * Hook لتحميل نموذج 3D للأثاث
 * يعيد النموذج إذا كان متوفراً، وإلا يعيد null
 * يجب استخدامه داخل Suspense boundary
 */
export function useFurnitureModel(furnitureType) {
  const modelPath = FURNITURE_MODELS[furnitureType];
  
  if (!modelPath) {
    return null; // لا يوجد نموذج لهذا النوع
  }

  // useLoader من react-three/fiber مع GLTFLoader
  // إذا فشل التحميل، useLoader سيرمي خطأ وسيتم التعامل معه في ErrorBoundary
  // extension function لربط DRACOLoader (للملفات المضغوطة بـ Draco)
  const gltf = useLoader(
    GLTFLoader,
    modelPath,
    (loader) => {
      const dracoLoader = getDracoLoader();
      if (dracoLoader) {
        try {
          loader.setDRACOLoader(dracoLoader);
        } catch (dracoError) {
          console.warn(`[modelLoader] Failed to set DRACOLoader for ${furnitureType}, continuing without Draco:`, dracoError);
          dracoLoaderFailed = true;
        }
      }
    }
  );
  
  // نسخ النموذج لتجنب تعديل النموذج الأصلي
  const clonedScene = useMemo(() => {
    if (!gltf || !gltf.scene) {
      console.warn(`[Furniture3D] Scene is null for ${furnitureType} from ${modelPath}`);
      return null;
    }
    
    try {
      const clone = gltf.scene.clone();
      
      // تطبيق الدوران التصحيحي إذا كان موجوداً
      const rotationCorrection = FURNITURE_ROTATION_CORRECTION[furnitureType];
      if (rotationCorrection) {
        clone.rotation.set(...rotationCorrection);
        console.log(`[Furniture3D] Applied rotation correction for ${furnitureType}:`, rotationCorrection);
      }
      
      // تحسين الأداء
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;
          // تحسين المواد
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.roughness = 0.7;
            child.material.metalness = 0.1;
          }
        }
      });
      console.log(`[Furniture3D] Successfully loaded model: ${furnitureType} from ${modelPath}`);
      return clone;
    } catch (cloneError) {
      console.error(`[Furniture3D] Error cloning model ${furnitureType}:`, cloneError);
      return null;
    }
  }, [gltf, furnitureType, modelPath]);

  return clonedScene;
}

/**
 * تحميل نماذج مسبقاً لتحسين الأداء
 * يمكن استدعاؤها من component useEffect
 * 
 * مثال الاستخدام:
 * useEffect(() => {
 *   preloadFurnitureModels();
 * }, []);
 * 
 * ملاحظة: useGLTF من drei يقوم بالـ caching تلقائياً،
 * لذا التحميل المسبق اختياري لكنه يحسن تجربة المستخدم
 */
export function preloadFurnitureModels() {
  if (typeof window === 'undefined') return; // SSR check
  
  // useGLTF.preload متوفر كـ static method
  // لكن يجب استدعاؤه من داخل React component
  // لذا سنترك التحميل التلقائي عند الحاجة
}

/**
 * إضافة نموذج جديد للأثاث
 */
export function registerFurnitureModel(furnitureType, modelPath) {
  FURNITURE_MODELS[furnitureType] = modelPath;
}

