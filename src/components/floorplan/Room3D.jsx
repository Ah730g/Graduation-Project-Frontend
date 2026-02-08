import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createFloorMaterial, createInternalWallMaterial, createExternalWallMaterial } from '../../lib/floorplan3d/materials';
import Wall3D from './Wall3D';
import Furniture3D from './Furniture3D';
import Window3D from './Window3D';

export default function Room3DComponent({ room }) {
  // Defensive check: ensure room has required geometry
  if (!room || !room.geometry || !room.geometry.floor || !room.geometry.floor.position) {
    console.error('Room3D: Missing required geometry data', room);
    return null;
  }

  const floorMaterial = useMemo(() => createFloorMaterial(room.type), [room.type]);
  const internalWallMaterial = useMemo(() => createInternalWallMaterial(), []);
  const externalWallMaterial = useMemo(() => createExternalWallMaterial(), []);

  // حساب موضع اسم الغرفة - بمستوى السقف (أعلى من الأثاث)
  // نضع اسم الغرفة في النصف العلوي من الغرفة
  const ceilingHeight = room.ceilingHeight || 2.7; // ارتفاع السقف
  const textHeight = ceilingHeight - 0.1; // 10 سم تحت السقف
  
  const roomNamePosition = [
    room.geometry.floor.position[0],
    textHeight, // ارتفاع قريب من السقف (أعلى من الأثاث)
    room.geometry.floor.position[2] + ((room.height_m || 0) * 0.2), // إزاحة أكبر للأمام (النصف العلوي)
  ];

  // حساب موضع المقاسات أسفل اسم الغرفة - بمستوى السقف
  // نضع المقاسات في النصف السفلي من الغرفة لتجنب التداخل
  const dimensionsPosition = [
    room.geometry.floor.position[0],
    textHeight - 0.15, // ارتفاع أقل قليلاً من اسم الغرفة لكن لا يزال قريب من السقف
    room.geometry.floor.position[2] - ((room.height_m || 0) * 0.2), // إزاحة أكبر للخلف (النصف السفلي)
  ];

  // مادة شفافة للنص
  const textMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      transparent: true,
      opacity: 0.9,
      depthWrite: false, // لا يكتب في depth buffer حتى لا يحجب العناصر
    });
  }, []);

  // مادة شفافة للمقاسات (أفتح قليلاً)
  const dimensionsMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#4a4a4a',
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
  }, []);

  // نص المقاسات
  const dimensionsText = `${room.width_m || 0} × ${room.height_m || 0} م`;

  // حساب حجم الخط بناءً على حجم الغرفة (مشابه لما كان في Text)
  const roomNameFontSize = Math.min((room.width_m || 1) * 0.13 * 16, 16);
  const dimensionsFontSize = Math.min((room.width_m || 1) * 0.1 * 14, 14);

  return (
    <group>
      {/* اسم الغرفة - في النصف العلوي من الغرفة، موازي للسقف */}
      <Html
        position={roomNamePosition}
        center
        transform
        occlude
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '6px 14px',
            borderRadius: '6px',
            border: '2px solid #1a1a1a',
            fontSize: `${roomNameFontSize}px`,
            fontWeight: 'bold',
            color: '#1a1a1a',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontFamily: 'Tahoma, Arial, sans-serif',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            transform: 'rotateX(90deg)',
            transformStyle: 'preserve-3d',
            maxWidth: `${room.width_m * 0.8 * 16}px`,
          }}
        >
          {room.name}
        </div>
      </Html>

      {/* المقاسات - في النصف السفلي من الغرفة، موازية للسقف */}
      <Html
        position={dimensionsPosition}
        center
        transform
        occlude
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '4px 12px',
            borderRadius: '6px',
            border: '1.5px solid #4a4a4a',
            fontSize: `${dimensionsFontSize}px`,
            fontWeight: '600',
            color: '#4a4a4a',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontFamily: 'Tahoma, Arial, sans-serif',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            transform: 'rotateX(90deg)',
            transformStyle: 'preserve-3d',
            maxWidth: `${room.width_m * 0.75 * 14}px`,
          }}
        >
          {dimensionsText}
        </div>
      </Html>

      {/* الأرضية */}
      <mesh
        position={room.geometry.floor.position}
      >
        <boxGeometry args={room.geometry.floor.size} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* الجدران */}
      {(room.geometry.walls || []).map((wall, index) => (
        <Wall3D
          key={`wall-${room.id}-${index}`}
          position={wall.position}
          size={wall.size}
          rotation={wall.rotation}
          material={wall.isExternal ? externalWallMaterial : internalWallMaterial}
        />
      ))}

      {/* السقف - تم إزالته للسماح برؤية داخل الشقة */}

      {/* الأثاث */}
      {(room.furniture3D || []).map((furniture, index) => (
        <Furniture3D
          key={`furniture-${room.id}-${index}`}
          type={furniture.type}
          position={furniture.position}
          size={furniture.size}
          rotation={furniture.rotation}
        />
      ))}

      {/* النوافذ */}
      {(room.windows3D || []).map((window, index) => (
        <Window3D
          key={`window-${room.id}-${index}`}
          position={window.position}
          size={window.size}
          rotation={window.rotation}
        />
      ))}
    </group>
  );
}

