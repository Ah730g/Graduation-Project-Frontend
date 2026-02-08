import * as THREE from 'three';
import { MATERIAL_COLORS, ROOM_COLORS } from './constants';

/**
 * إنشاء مواد Three.js للعرض ثلاثي الأبعاد
 */

/**
 * مادة الأرضية
 */
export function createFloorMaterial(roomType) {
  const color = ROOM_COLORS[roomType] || ROOM_COLORS.other;
  return new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.8,
    metalness: 0.1,
  });
}

/**
 * مادة الجدار الداخلي - غير شفافة
 */
export function createInternalWallMaterial() {
  return new THREE.MeshStandardMaterial({
    color: MATERIAL_COLORS.wall.paint,
    roughness: 0.7,
    metalness: 0.0,
    transparent: false,
    opacity: 1.0,
    side: THREE.DoubleSide,
  });
}

/**
 * مادة الجدار الخارجي - شفافة 40%
 */
export function createExternalWallMaterial() {
  return new THREE.MeshStandardMaterial({
    color: MATERIAL_COLORS.wall.paint,
    roughness: 0.7,
    metalness: 0.0,
    transparent: true,
    opacity: 0.4, // شفافية 40% (كانت 20%)
    side: THREE.DoubleSide,
  });
}

/**
 * مادة الجدار (للتوافق مع الكود القديم - تستخدم الداخلية)
 */
export function createWallMaterial() {
  return createInternalWallMaterial();
}

/**
 * مادة السقف
 */
export function createCeilingMaterial() {
  return new THREE.MeshStandardMaterial({
    color: MATERIAL_COLORS.ceiling.default,
    roughness: 0.9,
    metalness: 0.0,
  });
}

/**
 * مادة الباب
 */
export function createDoorMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#8B4513', // بني خشبي
    roughness: 0.6,
    metalness: 0.1,
  });
}

/**
 * مادة النافذة
 */
export function createWindowMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#E0F2F7', // أزرق فاتح
    roughness: 0.1,
    metalness: 0.5,
    transparent: true,
    opacity: 0.5, // شفافية 50% (كانت 30%)
    side: THREE.DoubleSide,
  });
}

/**
 * مادة الأثاث حسب النوع
 */
export function createFurnitureMaterial(furnitureType) {
  const colors = {
    sofa: '#8B4513',
    tv: '#1a1a1a',
    coffee_table: '#654321',
    bed: '#4169E1',
    king_bed: '#4169E1',
    wardrobe: '#8B7355',
    nightstand: '#8B7355',
    vanity: '#F5DEB3',
    desk: '#8B7355',
    counter: '#F5F5DC',
    stove: '#2F4F4F',
    fridge: '#FFFFFF',
    sink: '#C0C0C0',
    toilet: '#FFFFFF',
    shower: '#C0C0C0',
    dining_table: '#8B4513',
    chairs: '#8B4513',
    chair: '#8B4513',
    bookshelf: '#8B4513',
    plants: '#228B22',
    shoe_rack: '#8B4513',
    shelves: '#8B4513',
  };

  return new THREE.MeshStandardMaterial({
    color: colors[furnitureType] || '#808080',
    roughness: 0.7,
    metalness: 0.1,
  });
}

