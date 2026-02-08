import React from 'react';
import { createWindowMaterial, createWallMaterial } from '../../lib/floorplan3d/materials';
import * as THREE from 'three';

export default function Window3D({ position, size, rotation }) {
  const windowMaterial = createWindowMaterial();
  const frameMaterial = createWallMaterial();
  
  // النافذة عبارة عن فتحة مفتوحة في الجدار مع إطار رفيع
  const [depth, height, width] = size;
  const frameThickness = 0.05; // سماكة الإطار (أرفع)
  const frameDepth = 0.05; // عمق الإطار (أقل)

  return (
    <group position={position} rotation={rotation}>
      {/* إطار النافذة العلوي */}
      <mesh
        position={[0, height / 2 - frameThickness / 2, 0]}
      >
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* إطار النافذة السفلي */}
      <mesh
        position={[0, -height / 2 + frameThickness / 2, 0]}
      >
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* إطار النافذة الأيمن */}
      <mesh
        position={[width / 2 - frameThickness / 2, 0, 0]}
      >
        <boxGeometry args={[frameThickness, height - frameThickness * 2, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* إطار النافذة الأيسر */}
      <mesh
        position={[-width / 2 + frameThickness / 2, 0, 0]}
      >
        <boxGeometry args={[frameThickness, height - frameThickness * 2, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* الزجاج الشفاف (فتحة مفتوحة) - سطح رفيع جداً */}
      <mesh
        position={[0, 0, 0]}
      >
        <planeGeometry args={[width, height]} />
        <primitive object={windowMaterial} attach="material" />
      </mesh>
    </group>
  );
}

