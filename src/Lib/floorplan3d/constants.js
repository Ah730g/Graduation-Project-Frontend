/**
 * ثوابت للعرض ثلاثي الأبعاد
 */

// الأبعاد الافتراضية (بالأمتار)
export const DEFAULT_WALL_HEIGHT = 2.5; // ارتفاع الجدار
export const DEFAULT_CEILING_HEIGHT = 2.7; // ارتفاع السقف
export const DEFAULT_WALL_THICKNESS = 0.2; // سماكة الجدار
export const DEFAULT_FLOOR_THICKNESS = 0.1; // سماكة الأرضية

// أبعاد الأثاث (بالأمتار)
export const FURNITURE_DIMENSIONS = {
  sofa: { width: 2.0, height: 0.9, depth: 0.9 },
  tv: { width: 1.5, height: 0.9, depth: 0.2 },
  coffee_table: { width: 1.2, height: 0.4, depth: 0.6 },
  bed: { width: 1.6, height: 0.5, depth: 2.0 },
  king_bed: { width: 2.0, height: 0.5, depth: 2.0 },
  wardrobe: { width: 1.2, height: 2.0, depth: 0.6 },
  nightstand: { width: 0.5, height: 0.5, depth: 0.4 },
  vanity: { width: 1.0, height: 0.8, depth: 0.5 },
  desk: { width: 1.2, height: 0.75, depth: 0.6 },
  counter: { width: 2.0, height: 0.9, depth: 0.6 },
  stove: { width: 0.6, height: 0.9, depth: 0.6 },
  fridge: { width: 0.7, height: 1.8, depth: 0.7 },
  sink: { width: 0.6, height: 0.85, depth: 0.5 },
  toilet: { width: 0.4, height: 0.4, depth: 0.7 },
  shower: { width: 0.9, height: 1.9, depth: 0.9 },
  dining_table: { width: 1.6, height: 0.75, depth: 0.9 },
  chairs: { width: 0.5, height: 0.9, depth: 0.5 },
  chair: { width: 0.5, height: 0.9, depth: 0.5 },
  bookshelf: { width: 1.0, height: 1.8, depth: 0.4 },
  plants: { width: 0.4, height: 0.6, depth: 0.4 },
  shoe_rack: { width: 0.8, height: 0.4, depth: 0.3 },
  shelves: { width: 1.0, height: 1.5, depth: 0.3 },
};

// ألوان المواد
export const MATERIAL_COLORS = {
  floor: {
    wood: '#8B4513',
    tile: '#F5F5DC',
    marble: '#E6E6FA',
    carpet: '#CD853F',
  },
  wall: {
    paint: '#F5F5F5',
    wallpaper: '#FFF8DC',
    stone: '#A9A9A9',
    brick: '#CD853F',
  },
  ceiling: {
    default: '#FFFFFF',
  },
};

// ألوان الغرف حسب النوع
export const ROOM_COLORS = {
  living: '#E8F5E9',
  bedroom: '#E3F2FD',
  master_bedroom: '#F3E5F5',
  kitchen: '#FFF3E0',
  bathroom: '#E0F2F1',
  dining: '#FCE4EC',
  office: '#E8EAF6',
  balcony: '#F1F8E9',
  entrance: '#FAFAFA',
  corridor: '#ECEFF1',
  storage: '#EFEBE9',
  other: '#F5F5F5',
};

