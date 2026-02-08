import React from 'react';
import { MeshStandardMaterial } from 'three';

export default function Wall3D({ position, size, rotation, material }) {
  return (
    <mesh
      position={position}
      rotation={rotation}
    >
      <boxGeometry args={size} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

