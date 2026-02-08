import {
  DEFAULT_WALL_HEIGHT,
  DEFAULT_CEILING_HEIGHT,
  DEFAULT_WALL_THICKNESS,
  DEFAULT_FLOOR_THICKNESS,
  FURNITURE_DIMENSIONS,
} from './constants';

/**
 * تحويل المخطط من 2D إلى 3D
 */
export function convert2DTo3D(layout, wallHeight = DEFAULT_WALL_HEIGHT, ceilingHeight = DEFAULT_CEILING_HEIGHT) {
  const rooms3D = layout.rooms.map((room) => convertRoomTo3D(room, wallHeight, ceilingHeight, layout));

  return {
    ...layout,
    rooms: rooms3D,
  };
}

/**
 * تحويل غرفة واحدة من 2D إلى 3D
 */
function convertRoomTo3D(room, wallHeight, ceilingHeight, layout) {
  // Defensive check: ensure room has required properties
  if (!room || room.x_m === undefined || room.y_m === undefined || 
      room.width_m === undefined || room.height_m === undefined) {
    console.error('convertRoomTo3D: Missing required room properties', room);
    // Return a minimal 3D room structure to prevent crashes
    return {
      ...room,
      geometry: {
        floor: {
          position: [0, 0, 0],
          size: [1, DEFAULT_FLOOR_THICKNESS, 1],
        },
        walls: [],
        ceiling: {
          position: [0, ceilingHeight, 0],
          size: [1, DEFAULT_FLOOR_THICKNESS, 1],
        },
      },
      furniture3D: [],
      doors3D: [],
      windows3D: [],
      wallHeight,
      ceilingHeight,
    };
  }

  const { x_m, y_m, width_m, height_m } = room;

  // حساب موضع الأرضية (في Three.js، Y هو الارتفاع)
  const floorPosition = [x_m + width_m / 2, 0, y_m + height_m / 2];
  const floorSize = [width_m, DEFAULT_FLOOR_THICKNESS, height_m];

  // إنشاء الجدران الأربعة مع تحديد الجدران الخارجية
  const walls = generateWalls(room, wallHeight, layout);

  // حساب موضع السقف
  const ceilingPosition = [x_m + width_m / 2, ceilingHeight, y_m + height_m / 2];
  const ceilingSize = [width_m, DEFAULT_FLOOR_THICKNESS, height_m];

  // تحويل الأثاث إلى 3D
  // Handle both furniture_items and furniture property names
  const furnitureItems = room.furniture_items || room.furniture || [];
  const furniture3D = convertFurnitureTo3D(furnitureItems, room, wallHeight);

  // تحويل الأبواب إلى 3D
  const doors3D = convertDoorsTo3D(room.doors || [], room, wallHeight);

  // تحويل النوافذ إلى 3D
  const windows3D = convertWindowsTo3D(room.windows || [], room, wallHeight);

  return {
    ...room,
    geometry: {
      floor: {
        position: floorPosition,
        size: floorSize,
      },
      walls,
      ceiling: {
        position: ceilingPosition,
        size: ceilingSize,
      },
    },
    furniture3D,
    doors3D,
    windows3D,
    wallHeight,
    ceilingHeight,
  };
}

/**
 * إنشاء الجدران الأربعة للغرفة مع تحديد الجدران الخارجية وإنشاء فراغات للأبواب
 */
function generateWalls(room, wallHeight, layout) {
  const { x_m, y_m, width_m, height_m } = room;
  const wallThickness = DEFAULT_WALL_THICKNESS;
  const halfThickness = wallThickness / 2;
  const tolerance = 0.1; // تسامح للتحقق من الحدود
  const doorHeight = 2.0; // ارتفاع الباب بالأمتار

  const walls = [];
  const doors = room.doors || [];

  // Get layout dimensions with fallback
  const totalWidthM = layout?.total_width_m || (x_m + width_m);
  const totalHeightM = layout?.total_height_m || (y_m + height_m);

  // تحديد الجدران الخارجية (على حدود المخطط الكلي)
  const isNorthExternal = y_m <= tolerance; // الجدار الشمالي على الحد الشمالي
  const isSouthExternal = Math.abs((y_m + height_m) - totalHeightM) <= tolerance; // الجدار الجنوبي على الحد الجنوبي
  const isEastExternal = Math.abs((x_m + width_m) - totalWidthM) <= tolerance; // الجدار الشرقي على الحد الشرقي
  const isWestExternal = x_m <= tolerance; // الجدار الغربي على الحد الغربي

  // الجدار الشمالي (North) - مع فراغات للأبواب
  const northDoors = doors.filter(d => d.wall === 'north');
  if (northDoors.length === 0) {
    // لا توجد أبواب، جدار كامل
    walls.push({
      position: [x_m + width_m / 2, wallHeight / 2, y_m - halfThickness],
      size: [width_m, wallHeight, wallThickness],
      isExternal: isNorthExternal,
    });
  } else {
    // تقسيم الجدار إلى أجزاء مع فراغات للأبواب
    let currentPos = 0;
    for (const door of northDoors.sort((a, b) => a.position - b.position)) {
      const doorStart = door.position - door.width_m / (2 * width_m);
      const doorEnd = door.position + door.width_m / (2 * width_m);
      
      // جزء الجدار قبل الباب
      if (doorStart > currentPos) {
        const segmentWidth = (doorStart - currentPos) * width_m;
        const segmentX = x_m + (currentPos + doorStart) / 2 * width_m;
        walls.push({
          position: [segmentX, wallHeight / 2, y_m - halfThickness],
          size: [segmentWidth, wallHeight, wallThickness],
          isExternal: isNorthExternal,
        });
      }
      
      // جزء الجدار فوق الباب (فقط الجزء العلوي)
      const topWallHeight = wallHeight - doorHeight;
      if (topWallHeight > 0.1) {
        const doorCenterX = x_m + width_m * door.position;
        walls.push({
          position: [doorCenterX, doorHeight + topWallHeight / 2, y_m - halfThickness],
          size: [door.width_m, topWallHeight, wallThickness],
          isExternal: isNorthExternal,
        });
      }
      
      currentPos = doorEnd;
    }
    
    // جزء الجدار بعد آخر باب
    if (currentPos < 1) {
      const segmentWidth = (1 - currentPos) * width_m;
      const segmentX = x_m + (currentPos + 1) / 2 * width_m;
      walls.push({
        position: [segmentX, wallHeight / 2, y_m - halfThickness],
        size: [segmentWidth, wallHeight, wallThickness],
        isExternal: isNorthExternal,
      });
    }
  }

  // الجدار الجنوبي (South) - مع فراغات للأبواب
  const southDoors = doors.filter(d => d.wall === 'south');
  if (southDoors.length === 0) {
    walls.push({
      position: [x_m + width_m / 2, wallHeight / 2, y_m + height_m + halfThickness],
      size: [width_m, wallHeight, wallThickness],
      isExternal: isSouthExternal,
    });
  } else {
    let currentPos = 0;
    for (const door of southDoors.sort((a, b) => a.position - b.position)) {
      const doorStart = door.position - door.width_m / (2 * width_m);
      const doorEnd = door.position + door.width_m / (2 * width_m);
      
      if (doorStart > currentPos) {
        const segmentWidth = (doorStart - currentPos) * width_m;
        const segmentX = x_m + (currentPos + doorStart) / 2 * width_m;
        walls.push({
          position: [segmentX, wallHeight / 2, y_m + height_m + halfThickness],
          size: [segmentWidth, wallHeight, wallThickness],
          isExternal: isSouthExternal,
        });
      }
      
      const topWallHeight = wallHeight - doorHeight;
      if (topWallHeight > 0.1) {
        const doorCenterX = x_m + width_m * door.position;
        walls.push({
          position: [doorCenterX, doorHeight + topWallHeight / 2, y_m + height_m + halfThickness],
          size: [door.width_m, topWallHeight, wallThickness],
          isExternal: isSouthExternal,
        });
      }
      
      currentPos = doorEnd;
    }
    
    if (currentPos < 1) {
      const segmentWidth = (1 - currentPos) * width_m;
      const segmentX = x_m + (currentPos + 1) / 2 * width_m;
      walls.push({
        position: [segmentX, wallHeight / 2, y_m + height_m + halfThickness],
        size: [segmentWidth, wallHeight, wallThickness],
        isExternal: isSouthExternal,
      });
    }
  }

  // الجدار الشرقي (East) - مع فراغات للأبواب
  const eastDoors = doors.filter(d => d.wall === 'east');
  if (eastDoors.length === 0) {
    walls.push({
      position: [x_m + width_m + halfThickness, wallHeight / 2, y_m + height_m / 2],
      size: [wallThickness, wallHeight, height_m],
      isExternal: isEastExternal,
    });
  } else {
    let currentPos = 0;
    for (const door of eastDoors.sort((a, b) => a.position - b.position)) {
      const doorStart = door.position - door.width_m / (2 * height_m);
      const doorEnd = door.position + door.width_m / (2 * height_m);
      
      if (doorStart > currentPos) {
        const segmentHeight = (doorStart - currentPos) * height_m;
        const segmentZ = y_m + (currentPos + doorStart) / 2 * height_m;
        walls.push({
          position: [x_m + width_m + halfThickness, wallHeight / 2, segmentZ],
          size: [wallThickness, wallHeight, segmentHeight],
          isExternal: isEastExternal,
        });
      }
      
      const topWallHeight = wallHeight - doorHeight;
      if (topWallHeight > 0.1) {
        const doorCenterZ = y_m + height_m * door.position;
        walls.push({
          position: [x_m + width_m + halfThickness, doorHeight + topWallHeight / 2, doorCenterZ],
          size: [wallThickness, topWallHeight, door.width_m],
          isExternal: isEastExternal,
        });
      }
      
      currentPos = doorEnd;
    }
    
    if (currentPos < 1) {
      const segmentHeight = (1 - currentPos) * height_m;
      const segmentZ = y_m + (currentPos + 1) / 2 * height_m;
      walls.push({
        position: [x_m + width_m + halfThickness, wallHeight / 2, segmentZ],
        size: [wallThickness, wallHeight, segmentHeight],
        isExternal: isEastExternal,
      });
    }
  }

  // الجدار الغربي (West) - مع فراغات للأبواب
  const westDoors = doors.filter(d => d.wall === 'west');
  if (westDoors.length === 0) {
    walls.push({
      position: [x_m - halfThickness, wallHeight / 2, y_m + height_m / 2],
      size: [wallThickness, wallHeight, height_m],
      isExternal: isWestExternal,
    });
  } else {
    let currentPos = 0;
    for (const door of westDoors.sort((a, b) => a.position - b.position)) {
      const doorStart = door.position - door.width_m / (2 * height_m);
      const doorEnd = door.position + door.width_m / (2 * height_m);
      
      if (doorStart > currentPos) {
        const segmentHeight = (doorStart - currentPos) * height_m;
        const segmentZ = y_m + (currentPos + doorStart) / 2 * height_m;
        walls.push({
          position: [x_m - halfThickness, wallHeight / 2, segmentZ],
          size: [wallThickness, wallHeight, segmentHeight],
          isExternal: isWestExternal,
        });
      }
      
      const topWallHeight = wallHeight - doorHeight;
      if (topWallHeight > 0.1) {
        const doorCenterZ = y_m + height_m * door.position;
        walls.push({
          position: [x_m - halfThickness, doorHeight + topWallHeight / 2, doorCenterZ],
          size: [wallThickness, topWallHeight, door.width_m],
          isExternal: isWestExternal,
        });
      }
      
      currentPos = doorEnd;
    }
    
    if (currentPos < 1) {
      const segmentHeight = (1 - currentPos) * height_m;
      const segmentZ = y_m + (currentPos + 1) / 2 * height_m;
      walls.push({
        position: [x_m - halfThickness, wallHeight / 2, segmentZ],
        size: [wallThickness, wallHeight, segmentHeight],
        isExternal: isWestExternal,
      });
    }
  }

  return walls;
}

/**
 * تحويل الأثاث من 2D إلى 3D
 */
function convertFurnitureTo3D(furnitureItems, room, wallHeight) {
  // Defensive check: ensure room has required properties
  if (!room || !room.width_m || room.width_m <= 0) {
    console.warn('convertFurnitureTo3D: Missing or invalid room dimensions', room);
    return [];
  }

  // Calculate scale - use width_px if available, otherwise estimate from width_m
  const scale = room.width_px && room.width_px > 0 
    ? room.width_px / room.width_m 
    : 50; // Default scale (50px per meter)
  const furniture3D = [];
  const wallThickness = DEFAULT_WALL_THICKNESS;
  const padding = 0.1; // مسافة أمان من الجدران (10 سم)

  if (!Array.isArray(furnitureItems)) {
    return [];
  }

  for (const item of furnitureItems) {
    const dimensions = FURNITURE_DIMENSIONS[item.type] || { width: 0.5, height: 0.5, depth: 0.5 };

    // تحويل الإحداثيات من pixels إلى meters
    // item.x و item.y هما من الزاوية العلوية اليسرى، نحتاج المركز
    // نضيف نصف العرض والارتفاع للحصول على المركز
    const itemCenterX_px = item.x + item.width / 2;
    const itemCenterY_px = item.y + item.height / 2;
    
    const x_m = room.x_m + itemCenterX_px / scale;
    const z_m = room.y_m + itemCenterY_px / scale;

    // التأكد من أن الأثاث لا يخرج من حدود الغرفة (مع مراعاة الجدران)
    // حدود الغرفة الفعلية (داخل الجدران)
    const roomMinX = room.x_m + wallThickness / 2 + padding;
    const roomMaxX = room.x_m + room.width_m - wallThickness / 2 - padding;
    const roomMinZ = room.y_m + wallThickness / 2 + padding;
    const roomMaxZ = room.y_m + room.height_m - wallThickness / 2 - padding;

    // التأكد من أن مركز الأثاث لا يخرج من الحدود
    const clampedX_m = Math.max(roomMinX + dimensions.width / 2, Math.min(roomMaxX - dimensions.width / 2, x_m));
    const clampedZ_m = Math.max(roomMinZ + dimensions.depth / 2, Math.min(roomMaxZ - dimensions.depth / 2, z_m));

    furniture3D.push({
      type: item.type,
      position: [clampedX_m, dimensions.height / 2, clampedZ_m],
      size: [dimensions.width, dimensions.height, dimensions.depth],
    });
  }

  return furniture3D;
}

/**
 * تحويل الأبواب من 2D إلى 3D
 */
function convertDoorsTo3D(doors, room, wallHeight) {
  const doors3D = [];
  const doorHeight = 2.0; // ارتفاع الباب بالأمتار
  const doorThickness = 0.05; // سماكة الباب

  for (const door of doors) {
    const { wall, position, width_m } = door;
    const { x_m, y_m, width_m: roomWidth, height_m: roomHeight } = room;

    let doorX = 0;
    let doorZ = 0;
    let rotation = [0, 0, 0];

    switch (wall) {
      case 'north':
        doorX = x_m + roomWidth * position;
        doorZ = y_m;
        rotation = [0, 0, 0];
        break;
      case 'south':
        doorX = x_m + roomWidth * position;
        doorZ = y_m + roomHeight;
        rotation = [0, Math.PI, 0];
        break;
      case 'east':
        doorX = x_m + roomWidth;
        doorZ = y_m + roomHeight * position;
        rotation = [0, Math.PI / 2, 0];
        break;
      case 'west':
        doorX = x_m;
        doorZ = y_m + roomHeight * position;
        rotation = [0, -Math.PI / 2, 0];
        break;
    }

    doors3D.push({
      position: [doorX, doorHeight / 2, doorZ],
      size: [doorThickness, doorHeight, width_m],
      rotation,
    });
  }

  return doors3D;
}

/**
 * تحويل النوافذ من 2D إلى 3D
 */
function convertWindowsTo3D(windows, room, wallHeight) {
  const windows3D = [];
  const windowHeight = 1.2; // ارتفاع النافذة
  const windowDepth = 0.3; // عمق النافذة
  const windowBottomHeight = 0.9; // ارتفاع أسفل النافذة من الأرض

  for (const window of windows) {
    const { wall, position, width_m } = window;
    const { x_m, y_m, width_m: roomWidth, height_m: roomHeight } = room;

    let windowX = 0;
    let windowZ = 0;
    let rotation = [0, 0, 0];

    switch (wall) {
      case 'north':
        windowX = x_m + roomWidth * position;
        windowZ = y_m;
        rotation = [0, 0, 0];
        break;
      case 'south':
        windowX = x_m + roomWidth * position;
        windowZ = y_m + roomHeight;
        rotation = [0, Math.PI, 0];
        break;
      case 'east':
        windowX = x_m + roomWidth;
        windowZ = y_m + roomHeight * position;
        rotation = [0, Math.PI / 2, 0];
        break;
      case 'west':
        windowX = x_m;
        windowZ = y_m + roomHeight * position;
        rotation = [0, -Math.PI / 2, 0];
        break;
    }

    windows3D.push({
      position: [windowX, windowBottomHeight + windowHeight / 2, windowZ],
      size: [windowDepth, windowHeight, width_m],
      rotation,
    });
  }

  return windows3D;
}


