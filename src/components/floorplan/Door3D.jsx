import React from 'react';
import { createDoorMaterial } from '../../lib/floorplan3d/materials';

export default function Door3D({ position, size, rotation }) {
  const material = createDoorMaterial();

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

