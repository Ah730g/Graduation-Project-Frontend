/**
 * نظام الأشكال البدائية المحسّنة للأثاث
 * يوفر أشكالاً بدائية أكثر واقعية لكل نوع أثاث بدلاً من BoxGeometry البسيط
 */

import React from 'react';
import * as THREE from 'three';
import { createFurnitureMaterial } from './materials';

/**
 * مكون الأريكة - شكل محسّن مع مساند وظهر
 */
function PrimitiveSofa({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('sofa');
  const seatHeight = height * 0.4;
  const backHeight = height * 0.6;
  const armrestHeight = height * 0.8;
  const armrestWidth = depth * 0.3;

  return (
    <group position={position} rotation={rotation}>
      {/* المقعد الرئيسي */}
      <mesh position={[0, seatHeight / 2, 0]}>
        <boxGeometry args={[width, seatHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الظهر */}
      <mesh position={[0, height - backHeight / 2, -depth / 2 + depth * 0.1]}>
        <boxGeometry args={[width, backHeight, depth * 0.2]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* مسند جانبي أيسر */}
      <mesh position={[-width / 2 + armrestWidth / 2, armrestHeight / 2, 0]}>
        <boxGeometry args={[armrestWidth, armrestHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* مسند جانبي أيمن */}
      <mesh position={[width / 2 - armrestWidth / 2, armrestHeight / 2, 0]}>
        <boxGeometry args={[armrestWidth, armrestHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون الكرسي - شكل محسّن مع ظهر وأرجل
 */
function PrimitiveChair({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('chair');
  const seatHeight = height * 0.45;
  const backHeight = height * 0.55;
  const legRadius = Math.min(width, depth) * 0.05;
  const legHeight = seatHeight;

  return (
    <group position={position} rotation={rotation}>
      {/* المقعد */}
      <mesh position={[0, seatHeight / 2, 0]}>
        <boxGeometry args={[width * 0.9, height * 0.1, depth * 0.9]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الظهر */}
      <mesh position={[0, seatHeight + backHeight / 2, -depth / 2 + depth * 0.1]}>
        <boxGeometry args={[width * 0.9, backHeight, depth * 0.15]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الأرجل الأربع */}
      <mesh position={[-width * 0.35, legHeight / 2, -depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.35, legHeight / 2, -depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-width * 0.35, legHeight / 2, depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.35, legHeight / 2, depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون الطاولة - شكل محسّن مع سطح وأرجل
 */
function PrimitiveTable({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('dining_table');
  const tabletopThickness = height * 0.1;
  const legRadius = Math.min(width, depth) * 0.04;
  const legHeight = height - tabletopThickness;

  return (
    <group position={position} rotation={rotation}>
      {/* سطح الطاولة */}
      <mesh position={[0, height - tabletopThickness / 2, 0]}>
        <boxGeometry args={[width, tabletopThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الأرجل الأربع */}
      <mesh position={[-width * 0.4, legHeight / 2, -depth * 0.4]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.4, legHeight / 2, -depth * 0.4]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-width * 0.4, legHeight / 2, depth * 0.4]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.4, legHeight / 2, depth * 0.4]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون السرير - شكل محسّن مع وسائد
 */
function PrimitiveBed({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('bed');
  const bedHeight = height * 0.7;
  const mattressHeight = height * 0.3;
  const pillowHeight = height * 0.15;

  return (
    <group position={position} rotation={rotation}>
      {/* قاعدة السرير */}
      <mesh position={[0, bedHeight / 2, 0]}>
        <boxGeometry args={[width, bedHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* المرتبة */}
      <mesh position={[0, bedHeight + mattressHeight / 2, 0]}>
        <boxGeometry args={[width * 0.95, mattressHeight, depth * 0.95]} />
        <primitive object={createFurnitureMaterial('bed')} attach="material" />
      </mesh>
      
      {/* وسائد */}
      <mesh position={[0, bedHeight + mattressHeight + pillowHeight / 2, depth * 0.35]}>
        <boxGeometry args={[width * 0.6, pillowHeight, depth * 0.3]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>
      <mesh position={[width * 0.3, bedHeight + mattressHeight + pillowHeight / 2, depth * 0.35]}>
        <boxGeometry args={[width * 0.25, pillowHeight, depth * 0.25]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * مكون التلفاز - شكل محسّن مع شاشة رفيعة وقاعدة
 */
function PrimitiveTV({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('tv');
  const screenThickness = depth * 0.15;
  const standHeight = height * 0.15;
  const standWidth = width * 0.6;

  return (
    <group position={position} rotation={rotation}>
      {/* الشاشة */}
      <mesh position={[0, height / 2 - standHeight, 0]}>
        <boxGeometry args={[width, height - standHeight, screenThickness]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* القاعدة */}
      <mesh position={[0, standHeight / 2, -screenThickness / 2]}>
        <boxGeometry args={[standWidth, standHeight, screenThickness * 1.5]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* إطار الشاشة */}
      <mesh position={[0, height / 2 - standHeight, screenThickness / 2]}>
        <boxGeometry args={[width * 1.02, (height - standHeight) * 1.02, screenThickness * 0.1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    </group>
  );
}

/**
 * مكون الثلاجة - شكل محسّن مع تفاصيل
 */
function PrimitiveFridge({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('fridge');
  const handleWidth = width * 0.05;
  const handleHeight = height * 0.3;

  return (
    <group position={position} rotation={rotation}>
      {/* الجسم الرئيسي */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* مقبض الباب */}
      <mesh position={[width / 2 - depth * 0.1, height * 0.4, 0]}>
        <boxGeometry args={[handleWidth, handleHeight, depth * 0.2]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* خط فاصل (لثلاجة ببابين) */}
      <mesh position={[0, height * 0.55, depth / 2 + depth * 0.01]}>
        <boxGeometry args={[width * 0.9, height * 0.01, depth * 0.05]} />
        <meshStandardMaterial color="#CCCCCC" />
      </mesh>
    </group>
  );
}

/**
 * مكون الموقد - شكل محسّن مع عيون
 */
function PrimitiveStove({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('stove');
  const burnerRadius = width * 0.15;

  return (
    <group position={position} rotation={rotation}>
      {/* الجسم */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* السطح العلوي */}
      <mesh position={[0, height, 0]}>
        <boxGeometry args={[width, height * 0.05, depth]} />
        <meshStandardMaterial color="#2F2F2F" metalness={0.5} roughness={0.3} />
      </mesh>
      
      {/* عيون الموقد */}
      <mesh position={[-width * 0.25, height + height * 0.05, 0]}>
        <cylinderGeometry args={[burnerRadius, burnerRadius, height * 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[width * 0.25, height + height * 0.05, 0]}>
        <cylinderGeometry args={[burnerRadius, burnerRadius, height * 0.02, 16]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

/**
 * مكون الحوض - شكل محسّن مع حوض
 */
function PrimitiveSink({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('sink');
  const sinkDepth = height * 0.4;
  const sinkRadius = Math.min(width, depth) * 0.35;

  return (
    <group position={position} rotation={rotation}>
      {/* الخزانة */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الحوض */}
      <mesh position={[0, height - sinkDepth / 2, depth * 0.1]}>
        <cylinderGeometry args={[sinkRadius, sinkRadius, sinkDepth, 32]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.7} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * مكون المرحاض - شكل بيضاوي محسّن
 */
function PrimitiveToilet({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('toilet');
  const bowlHeight = height * 0.6;
  const tankHeight = height * 0.4;

  return (
    <group position={position} rotation={rotation}>
      {/* الخزان العلوي */}
      <mesh position={[0, height - tankHeight / 2, -depth * 0.2]}>
        <boxGeometry args={[width * 0.8, tankHeight, depth * 0.6]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* القاعدة */}
      <mesh position={[0, bowlHeight / 2, 0]}>
        <boxGeometry args={[width, bowlHeight, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون الحمام - شكل محسّن
 */
function PrimitiveShower({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('shower');
  const baseHeight = height * 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* القاعدة */}
      <mesh position={[0, baseHeight / 2, 0]}>
        <boxGeometry args={[width, baseHeight, depth]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      
      {/* الجدران */}
      <mesh position={[-width / 2 + width * 0.05, height / 2, 0]}>
        <boxGeometry args={[width * 0.1, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width / 2 - width * 0.05, height / 2, 0]}>
        <boxGeometry args={[width * 0.1, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[0, height / 2, -depth / 2 + depth * 0.05]}>
        <boxGeometry args={[width, height, depth * 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون خزانة الملابس - شكل محسّن مع تفاصيل
 */
function PrimitiveWardrobe({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('wardrobe');

  return (
    <group position={position} rotation={rotation}>
      {/* الجسم */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* مقابض الأبواب */}
      <mesh position={[-width * 0.25, height * 0.4, depth / 2 + depth * 0.01]}>
        <cylinderGeometry args={[depth * 0.03, depth * 0.03, depth * 0.1, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      <mesh position={[width * 0.25, height * 0.4, depth / 2 + depth * 0.01]}>
        <cylinderGeometry args={[depth * 0.03, depth * 0.03, depth * 0.1, 8]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
    </group>
  );
}

/**
 * مكون المكتب - شكل محسّن مع سطح ودرج
 */
function PrimitiveDesk({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('desk');
  const tabletopThickness = height * 0.15;

  return (
    <group position={position} rotation={rotation}>
      {/* السطح */}
      <mesh position={[0, height - tabletopThickness / 2, 0]}>
        <boxGeometry args={[width, tabletopThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الخزانة الجانبية */}
      <mesh position={[-width * 0.4, (height - tabletopThickness) / 2, -depth * 0.3]}>
        <boxGeometry args={[width * 0.3, height - tabletopThickness, depth * 0.4]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الأرجل */}
      <mesh position={[width * 0.35, (height - tabletopThickness) / 2, depth * 0.35]}>
        <boxGeometry args={[width * 0.1, height - tabletopThickness, depth * 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.35, (height - tabletopThickness) / 2, -depth * 0.35]}>
        <boxGeometry args={[width * 0.1, height - tabletopThickness, depth * 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون مكتبة الكتب - شكل محسّن مع رفوف
 */
function PrimitiveBookshelf({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('bookshelf');
  const shelfThickness = height * 0.02;
  const numShelves = 4;

  return (
    <group position={position} rotation={rotation}>
      {/* الجدران الجانبية */}
      <mesh position={[-width / 2 + depth * 0.1, height / 2, 0]}>
        <boxGeometry args={[depth * 0.2, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width / 2 - depth * 0.1, height / 2, 0]}>
        <boxGeometry args={[depth * 0.2, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الرفوف */}
      {Array.from({ length: numShelves }).map((_, i) => {
        const shelfY = (height / numShelves) * (i + 1) - height / 2;
        return (
          <mesh key={i} position={[0, shelfY, 0]}>
            <boxGeometry args={[width, shelfThickness, depth]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}
      
      {/* الخلفية */}
      <mesh position={[0, height / 2, -depth / 2 + depth * 0.05]}>
        <boxGeometry args={[width, height, depth * 0.1]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون النبات - شكل مخروطي بسيط
 */
function PrimitivePlant({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const potHeight = height * 0.4;
  const plantHeight = height * 0.6;

  return (
    <group position={position} rotation={rotation}>
      {/* الأصيص */}
      <mesh position={[0, potHeight / 2, 0]}>
        <cylinderGeometry args={[width * 0.4, width * 0.35, potHeight, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* النبات */}
      <mesh position={[0, potHeight + plantHeight / 2, 0]}>
        <coneGeometry args={[width * 0.35, plantHeight, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

/**
 * مكون رف الأحذية - شكل محسّن مع رفوف
 */
function PrimitiveShoeRack({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('shoe_rack');
  const shelfThickness = height * 0.1;
  const numShelves = 3;

  return (
    <group position={position} rotation={rotation}>
      {/* الإطار */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الرفوف */}
      {Array.from({ length: numShelves }).map((_, i) => {
        const shelfY = (height / numShelves) * (i + 1) - height / 2;
        return (
          <mesh key={i} position={[0, shelfY, 0]}>
            <boxGeometry args={[width * 0.9, shelfThickness, depth * 0.9]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * مكون الرف - شكل محسّن بسيط
 */
function PrimitiveShelves({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('shelves');
  const shelfThickness = height * 0.03;
  const numShelves = 5;

  return (
    <group position={position} rotation={rotation}>
      {/* الجدران الجانبية */}
      <mesh position={[-width / 2 + depth * 0.1, height / 2, 0]}>
        <boxGeometry args={[depth * 0.2, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width / 2 - depth * 0.1, height / 2, 0]}>
        <boxGeometry args={[depth * 0.2, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الرفوف */}
      {Array.from({ length: numShelves }).map((_, i) => {
        const shelfY = (height / numShelves) * (i + 1) - height / 2;
        return (
          <mesh key={i} position={[0, shelfY, 0]}>
            <boxGeometry args={[width, shelfThickness, depth]} />
            <primitive object={material} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * مكون طاولة القهوة - شكل دائري بسيط
 */
function PrimitiveCoffeeTable({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('coffee_table');
  const tabletopThickness = height * 0.15;
  const legRadius = Math.min(width, depth) * 0.06;
  const legHeight = height - tabletopThickness;

  return (
    <group position={position} rotation={rotation}>
      {/* السطح */}
      <mesh position={[0, height - tabletopThickness / 2, 0]}>
        <boxGeometry args={[width, tabletopThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الأرجل */}
      <mesh position={[-width * 0.35, legHeight / 2, -depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.35, legHeight / 2, -depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[-width * 0.35, legHeight / 2, depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
      <mesh position={[width * 0.35, legHeight / 2, depth * 0.35]}>
        <cylinderGeometry args={[legRadius, legRadius, legHeight, 8]} />
        <primitive object={material} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * مكون المنضدة - شكل محسّن
 */
function PrimitiveCounter({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('counter');
  const countertopThickness = height * 0.1;

  return (
    <group position={position} rotation={rotation}>
      {/* الجسم */}
      <mesh position={[0, (height - countertopThickness) / 2, 0]}>
        <boxGeometry args={[width, height - countertopThickness, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* السطح */}
      <mesh position={[0, height - countertopThickness / 2, 0]}>
        <boxGeometry args={[width, countertopThickness, depth]} />
        <meshStandardMaterial color="#F5F5DC" roughness={0.3} />
      </mesh>
    </group>
  );
}

/**
 * مكون منضدة الزينة - شكل محسّن مع مرآة
 */
function PrimitiveVanity({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('vanity');
  const mirrorHeight = height * 0.4;

  return (
    <group position={position} rotation={rotation}>
      {/* الخزانة */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height * 0.6, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* المرآة */}
      <mesh position={[0, height * 0.8, depth * 0.1]}>
        <boxGeometry args={[width * 0.9, mirrorHeight, depth * 0.05]} />
        <meshStandardMaterial color="#E0F2F7" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

/**
 * مكون طاولة السرير - شكل بسيط محسّن
 */
function PrimitiveNightstand({ size, position = [0, 0, 0], rotation }) {
  const [width, height, depth] = size;
  const material = createFurnitureMaterial('nightstand');
  const drawerThickness = height * 0.05;

  return (
    <group position={position} rotation={rotation}>
      {/* الجسم */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <primitive object={material} attach="material" />
      </mesh>
      
      {/* الدرج */}
      <mesh position={[0, height * 0.3, depth / 2 + depth * 0.01]}>
        <boxGeometry args={[width * 0.7, drawerThickness, depth * 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </group>
  );
}

/**
 * الدالة الرئيسية لإرجاع المكون المناسب حسب نوع الأثاث
 */
export function PrimitiveFurniture({ type, size, position = [0, 0, 0], rotation }) {
  const normalizedType = type.toLowerCase().trim();

  switch (normalizedType) {
    case 'sofa':
      return <PrimitiveSofa type={type} size={size} position={position} rotation={rotation} />;
    
    case 'chair':
    case 'chairs':
      return <PrimitiveChair type={type} size={size} position={position} rotation={rotation} />;
    
    case 'dining_table':
      return <PrimitiveTable type={type} size={size} position={position} rotation={rotation} />;
    
    case 'coffee_table':
      return <PrimitiveCoffeeTable type={type} size={size} position={position} rotation={rotation} />;
    
    case 'bed':
    case 'king_bed':
      return <PrimitiveBed type={type} size={size} position={position} rotation={rotation} />;
    
    case 'tv':
      return <PrimitiveTV type={type} size={size} position={position} rotation={rotation} />;
    
    case 'fridge':
      return <PrimitiveFridge type={type} size={size} position={position} rotation={rotation} />;
    
    case 'stove':
      return <PrimitiveStove type={type} size={size} position={position} rotation={rotation} />;
    
    case 'sink':
      return <PrimitiveSink type={type} size={size} position={position} rotation={rotation} />;
    
    case 'toilet':
      return <PrimitiveToilet type={type} size={size} position={position} rotation={rotation} />;
    
    case 'shower':
      return <PrimitiveShower type={type} size={size} position={position} rotation={rotation} />;
    
    case 'wardrobe':
      return <PrimitiveWardrobe type={type} size={size} position={position} rotation={rotation} />;
    
    case 'desk':
      return <PrimitiveDesk type={type} size={size} position={position} rotation={rotation} />;
    
    case 'bookshelf':
      return <PrimitiveBookshelf type={type} size={size} position={position} rotation={rotation} />;
    
    case 'plants':
      return <PrimitivePlant type={type} size={size} position={position} rotation={rotation} />;
    
    case 'shoe_rack':
      return <PrimitiveShoeRack type={type} size={size} position={position} rotation={rotation} />;
    
    case 'shelves':
      return <PrimitiveShelves type={type} size={size} position={position} rotation={rotation} />;
    
    case 'counter':
      return <PrimitiveCounter type={type} size={size} position={position} rotation={rotation} />;
    
    case 'vanity':
      return <PrimitiveVanity type={type} size={size} position={position} rotation={rotation} />;
    
    case 'nightstand':
      return <PrimitiveNightstand type={type} size={size} position={position} rotation={rotation} />;
    
    default:
      // Fallback: استخدام boxGeometry بسيط
      const material = createFurnitureMaterial(type);
      return (
        <mesh position={position} rotation={rotation}>
          <boxGeometry args={size} />
          <primitive object={material} attach="material" />
        </mesh>
      );
  }
}


