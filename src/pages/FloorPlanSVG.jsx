import React, { useRef } from "react";

export default function FloorPlanSVG({ 
  layout, 
  title, 
  interactive = false, 
  selectedRoomId = null, 
  onRoomClick = null, 
  onRoomDrag = null,
  selectedFurnitureId = null,
  onFurnitureDrag = null,
  onFurnitureClick = null,
  onFurnitureResize = null,
  selectedDoorIndex = null,
  onDoorClick = null,
  onDoorResize = null,
  selectedWindowIndex = null,
  onWindowClick = null,
  onWindowResize = null,
  onBackgroundClick = null,
}) {
  const svgRef = useRef(null);

  if (!layout || !layout.rooms || layout.rooms.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg">
        <span className="text-4xl mb-4 block">🏠</span>
        لا توجد بيانات مخطط لعرضها
      </div>
    );
  }

  const {
    total_width_px,
    total_height_px,
    rooms,
    scale_px_per_m,
    padding_px = 150,
    north_direction = "up",
  } = layout;

  const titleHeight = title ? 60 : 0;
  const legendHeight = 140;
  const scaleBarHeight = 50;
  const canvasWidth = Math.max(total_width_px + padding_px * 2, 900);
  const canvasHeight = total_height_px + padding_px * 2 + titleHeight + legendHeight + scaleBarHeight;

  // ═══════════════════════════════════════════════
  // 🎨 ألوان وأنماط الغرف
  // ═══════════════════════════════════════════════
  const getRoomStyle = (type) => {
    const styles = {
      living: { fill: "#E8F5E9", stroke: "#2E7D32", label: "صالة" },
      kitchen: { fill: "#FFF3E0", stroke: "#E65100", label: "مطبخ" },
      bedroom: { fill: "#E3F2FD", stroke: "#1565C0", label: "غرفة نوم" },
      master_bedroom: { fill: "#BBDEFB", stroke: "#0D47A1", label: "غرفة رئيسية" },
      bathroom: { fill: "#F3E5F5", stroke: "#7B1FA2", label: "حمام" },
      guest_bathroom: { fill: "#E1BEE7", stroke: "#6A1B9A", label: "حمام ضيوف" },
      dining: { fill: "#FFF8E1", stroke: "#F9A825", label: "طعام" },
      balcony: { fill: "#E0F7FA", stroke: "#00838F", label: "بلكونة" },
      corridor: { fill: "#ECEFF1", stroke: "#546E7A", label: "ممر" },
      entrance: { fill: "#FBE9E7", stroke: "#BF360C", label: "مدخل" },
      storage: { fill: "#EFEBE9", stroke: "#5D4037", label: "مخزن" },
      office: { fill: "#E8EAF6", stroke: "#3949AB", label: "مكتب" },
      laundry: { fill: "#F1F8E9", stroke: "#689F38", label: "غسيل" },
      other: { fill: "#F5F5F5", stroke: "#424242", label: "أخرى" },
    };
    return styles[type] || styles.other;
  };

  // ═══════════════════════════════════════════════
  // 🏠 رسم شكل الغرفة (يدعم جميع الأشكال)
  // ═══════════════════════════════════════════════
  const RoomShape = ({ room, roomX, roomY, isSelected = false }) => {
    const style = getRoomStyle(room.type);
    const shape = room.shape || "rectangle";
    const shapeData = room.shape_data || {};
    const strokeColor = isSelected ? "#FF5722" : style.stroke;
    const strokeWidth = isSelected ? 4 : 2.5;

    switch (shape) {
      case "pentagon": {
        const points = shapeData.points || [];
        if (points.length === 5) {
          const pointsStr = points.map((p) => `${roomX + p.x},${roomY + p.y}`).join(" ");
          return <polygon points={pointsStr} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
        }
        const cx = roomX + room.width_px / 2;
        const cy = roomY + room.height_px / 2;
        const rx = room.width_px / 2 - 5;
        const ry = room.height_px / 2 - 5;
        const defaultPoints = Array.from({ length: 5 }, (_, i) => {
          const angle = ((i * 72 - 90) * Math.PI) / 180;
          return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
        }).join(" ");
        return <polygon points={defaultPoints} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
      }

      case "hexagon": {
        const points = shapeData.points || [];
        if (points.length === 6) {
          const pointsStr = points.map((p) => `${roomX + p.x},${roomY + p.y}`).join(" ");
          return <polygon points={pointsStr} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
        }
        const cx = roomX + room.width_px / 2;
        const cy = roomY + room.height_px / 2;
        const rx = room.width_px / 2 - 5;
        const ry = room.height_px / 2 - 5;
        const defaultPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = ((i * 60 - 90) * Math.PI) / 180;
          return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
        }).join(" ");
        return <polygon points={defaultPoints} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
      }

      case "triangle": {
        const dir = shapeData.direction || "up";
        let triPoints;
        switch (dir) {
          case "up":
            triPoints = `${roomX + room.width_px / 2},${roomY} ${roomX + room.width_px},${roomY + room.height_px} ${roomX},${roomY + room.height_px}`;
            break;
          case "down":
            triPoints = `${roomX},${roomY} ${roomX + room.width_px},${roomY} ${roomX + room.width_px / 2},${roomY + room.height_px}`;
            break;
          case "left":
            triPoints = `${roomX},${roomY + room.height_px / 2} ${roomX + room.width_px},${roomY} ${roomX + room.width_px},${roomY + room.height_px}`;
            break;
          case "right":
            triPoints = `${roomX},${roomY} ${roomX + room.width_px},${roomY + room.height_px / 2} ${roomX},${roomY + room.height_px}`;
            break;
          default:
            triPoints = `${roomX + room.width_px / 2},${roomY} ${roomX + room.width_px},${roomY + room.height_px} ${roomX},${roomY + room.height_px}`;
        }
        return <polygon points={triPoints} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
      }

      case "trapezoid": {
        const topW = shapeData.top_width_px || room.width_px * 0.7;
        const bottomW = room.width_px;
        const offset = (bottomW - topW) / 2;
        const points = `${roomX + offset},${roomY} ${roomX + offset + topW},${roomY} ${roomX + bottomW},${roomY + room.height_px} ${roomX},${roomY + room.height_px}`;
        return <polygon points={points} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
      }

      case "l_shape": {
        const cutW = shapeData.cut_width_px || room.width_px / 3;
        const cutH = shapeData.cut_height_px || room.height_px / 3;
        const cutPos = shapeData.cut_position || "top-right";
        const paths = {
          "top-right": `M ${roomX} ${roomY} L ${roomX + room.width_px - cutW} ${roomY} L ${roomX + room.width_px - cutW} ${roomY + cutH} L ${roomX + room.width_px} ${roomY + cutH} L ${roomX + room.width_px} ${roomY + room.height_px} L ${roomX} ${roomY + room.height_px} Z`,
          "top-left": `M ${roomX + cutW} ${roomY} L ${roomX + room.width_px} ${roomY} L ${roomX + room.width_px} ${roomY + room.height_px} L ${roomX} ${roomY + room.height_px} L ${roomX} ${roomY + cutH} L ${roomX + cutW} ${roomY + cutH} Z`,
          "bottom-right": `M ${roomX} ${roomY} L ${roomX + room.width_px} ${roomY} L ${roomX + room.width_px} ${roomY + room.height_px - cutH} L ${roomX + room.width_px - cutW} ${roomY + room.height_px - cutH} L ${roomX + room.width_px - cutW} ${roomY + room.height_px} L ${roomX} ${roomY + room.height_px} Z`,
          "bottom-left": `M ${roomX} ${roomY} L ${roomX + room.width_px} ${roomY} L ${roomX + room.width_px} ${roomY + room.height_px} L ${roomX + cutW} ${roomY + room.height_px} L ${roomX + cutW} ${roomY + room.height_px - cutH} L ${roomX} ${roomY + room.height_px - cutH} Z`,
        };
        return <path d={paths[cutPos] || paths["top-right"]} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
      }

      case "custom_polygon": {
        const points = shapeData.points || [];
        if (points.length >= 3) {
          const pointsStr = points.map((p) => `${roomX + p.x},${roomY + p.y}`).join(" ");
          return <polygon points={pointsStr} fill={style.fill} stroke={strokeColor} strokeWidth={strokeWidth} />;
        }
        return null;
      }

      default:
        return (
          <rect
            x={roomX}
            y={roomY}
            width={room.width_px}
            height={room.height_px}
            fill={style.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        );
    }
  };

  // ═══════════════════════════════════════════════
  // 🚪 رسم الباب
  // ═══════════════════════════════════════════════
  const Door = ({ room, door, doorIndex, roomX, roomY, isSelected = false, onDrag = null, onClick = null, onResize = null, interactive = false }) => {
    const doorWidthPx = (door.width_m || 0.9) * scale_px_per_m;
    const doorType = door.type || "single";
    const wall = door.wall || "south";
    const position = Math.max(0.15, Math.min(0.85, door.position || 0.5));
    const arcRadius = doorWidthPx * 0.85;

    let x, y, gapX, gapY, gapW, gapH, arcPath, doorLineX1, doorLineY1, doorLineX2, doorLineY2;

    switch (wall) {
      case "north":
        x = roomX + room.width_px * position - doorWidthPx / 2;
        y = roomY;
        gapX = x; gapY = y - 4; gapW = doorWidthPx; gapH = 8;
        arcPath = `M ${x} ${y} A ${arcRadius} ${arcRadius} 0 0 0 ${x + doorWidthPx} ${y}`;
        doorLineX1 = x; doorLineY1 = y; doorLineX2 = x; doorLineY2 = y - arcRadius * 0.7;
        break;
      case "south":
        x = roomX + room.width_px * position - doorWidthPx / 2;
        y = roomY + room.height_px;
        gapX = x; gapY = y - 4; gapW = doorWidthPx; gapH = 8;
        arcPath = `M ${x} ${y} A ${arcRadius} ${arcRadius} 0 0 1 ${x + doorWidthPx} ${y}`;
        doorLineX1 = x; doorLineY1 = y; doorLineX2 = x; doorLineY2 = y + arcRadius * 0.7;
        break;
      case "east":
        x = roomX + room.width_px;
        y = roomY + room.height_px * position - doorWidthPx / 2;
        gapX = x - 4; gapY = y; gapW = 8; gapH = doorWidthPx;
        arcPath = `M ${x} ${y} A ${arcRadius} ${arcRadius} 0 0 1 ${x} ${y + doorWidthPx}`;
        doorLineX1 = x; doorLineY1 = y; doorLineX2 = x + arcRadius * 0.7; doorLineY2 = y;
        break;
      case "west":
        x = roomX;
        y = roomY + room.height_px * position - doorWidthPx / 2;
        gapX = x - 4; gapY = y; gapW = 8; gapH = doorWidthPx;
        arcPath = `M ${x} ${y} A ${arcRadius} ${arcRadius} 0 0 0 ${x} ${y + doorWidthPx}`;
        doorLineX1 = x; doorLineY1 = y; doorLineX2 = x - arcRadius * 0.7; doorLineY2 = y;
        break;
      default:
        return null;
    }

    // معالجة resize للباب
    const handleDoorResize = (newX, newY, newWidth, newHeight) => {
      if (!onResize) return;
      
      // حساب العرض الجديد بالمتر
      const newWidth_m = newWidth / scale_px_per_m;
      
      // حساب الموضع الجديد (position) بناءً على الجدار
      let newPosition;
      const wallLength = (wall === 'north' || wall === 'south') ? room.width_px : room.height_px;
      const centerX = newX + newWidth / 2;
      
      if (wall === 'north' || wall === 'south') {
        newPosition = (centerX - roomX) / wallLength;
      } else {
        newPosition = (centerX - roomX) / wallLength;
        // تصحيح للموضع العمودي
        const centerY = newY + newHeight / 2;
        newPosition = (centerY - roomY) / wallLength;
      }
      
      newPosition = Math.max(0.15, Math.min(0.85, newPosition));
      
      onResize(doorIndex, newPosition, newWidth_m);
    };

    // معالجة سحب الباب
    const handleDoorMouseDown = (e) => {
      // التحقق من أن النقر لم يكن على resize handle
      const target = e.target;
      if (target.getAttribute && target.getAttribute('fill') === '#FF5722') {
        return; // هذا resize handle
      }
      
      if (!interactive || !isSelected) return;
      e.preventDefault();
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;

      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const startPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

      const startGapX = gapX;
      const startGapY = gapY;
      const startPosition = position;
      const wallLength = (wall === 'north' || wall === 'south') ? room.width_px : room.height_px;

      let isDragging = false;

      const handleMouseMove = (moveEvent) => {
        if (!isDragging) {
          const dx = Math.abs(moveEvent.clientX - e.clientX);
          const dy = Math.abs(moveEvent.clientY - e.clientY);
          if (dx < 5 && dy < 5) return;
          isDragging = true;
        }

        svgPoint.x = moveEvent.clientX;
        svgPoint.y = moveEvent.clientY;
        const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

        let newPosition;
        if (wall === 'north' || wall === 'south') {
          const centerX = currentPoint.x;
          newPosition = (centerX - roomX) / wallLength;
        } else {
          const centerY = currentPoint.y;
          newPosition = (centerY - roomY) / wallLength;
        }

        newPosition = Math.max(0.15, Math.min(0.85, newPosition));

        if (onResize) {
          onResize(doorIndex, newPosition, door.width_m);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (!isDragging && onClick) {
          setTimeout(() => onClick(doorIndex), 10);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <g 
        className="door"
        style={{ 
          cursor: interactive ? (isSelected ? 'move' : 'pointer') : 'default',
          pointerEvents: interactive ? 'all' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && interactive) {
            onClick(doorIndex);
          }
        }}
      >
        {/* طبقة شفافة للنقر */}
        <rect 
          x={gapX - 5} 
          y={gapY - 5} 
          width={gapW + 10} 
          height={gapH + 10} 
          fill="transparent" 
          stroke="none"
          pointerEvents="all"
          onMouseDown={handleDoorMouseDown}
          style={{ cursor: interactive && isSelected ? 'move' : interactive ? 'pointer' : 'default' }}
        />
        {/* فتحة الباب في الجدار */}
        <rect x={gapX} y={gapY} width={gapW} height={gapH} fill="#fff" stroke="#333" strokeWidth={1} />
        
        {/* قوس فتح الباب */}
        <path d={arcPath} fill="none" stroke="#8B4513" strokeWidth={2} strokeDasharray="4,2" opacity={0.6} />
        
        {/* لوح الباب */}
        <line
          x1={doorLineX1}
          y1={doorLineY1}
          x2={doorLineX2}
          y2={doorLineY2}
          stroke="#654321"
          strokeWidth={5}
          strokeLinecap="round"
        />
        
        {/* إطار الباب */}
        <rect
          x={gapX - 2}
          y={gapY - 2}
          width={gapW + 4}
          height={gapH + 4}
          fill="none"
          stroke="#654321"
          strokeWidth={2}
        />
        
        {/* مقبض الباب */}
        <circle
          cx={(doorLineX1 + doorLineX2) / 2 + (wall === "east" ? 6 : wall === "west" ? -6 : 0)}
          cy={(doorLineY1 + doorLineY2) / 2 + (wall === "south" ? 6 : wall === "north" ? -6 : 0)}
          r={5}
          fill="#FFD700"
          stroke="#B8860B"
          strokeWidth={1.5}
        />
        <circle
          cx={(doorLineX1 + doorLineX2) / 2 + (wall === "east" ? 6 : wall === "west" ? -6 : 0)}
          cy={(doorLineY1 + doorLineY2) / 2 + (wall === "south" ? 6 : wall === "north" ? -6 : 0)}
          r={2}
          fill="#FFA500"
        />
        
        {/* باب مزدوج */}
        {doorType === "double" && (
          <>
            <line
              x1={doorLineX1 + (wall === "north" || wall === "south" ? doorWidthPx : 0)}
              y1={doorLineY1 + (wall === "east" || wall === "west" ? doorWidthPx : 0)}
              x2={doorLineX2 + (wall === "north" || wall === "south" ? doorWidthPx : 0)}
              y2={doorLineY2 + (wall === "east" || wall === "west" ? doorWidthPx : 0)}
              stroke="#654321"
              strokeWidth={5}
              strokeLinecap="round"
            />
            <circle
              cx={(doorLineX1 + doorLineX2) / 2 + (wall === "north" || wall === "south" ? doorWidthPx : 0) + (wall === "east" ? 6 : wall === "west" ? -6 : 0)}
              cy={(doorLineY1 + doorLineY2) / 2 + (wall === "east" || wall === "west" ? doorWidthPx : 0) + (wall === "south" ? 6 : wall === "north" ? -6 : 0)}
              r={5}
              fill="#FFD700"
              stroke="#B8860B"
              strokeWidth={1.5}
            />
          </>
        )}
        
        {/* مقابض تغيير الحجم للباب */}
        {isSelected && interactive && onResize && (
          <>
            {/* مقبضان على الجانبين للتحكم في العرض */}
            {wall === 'north' || wall === 'south' ? (
              <>
                <rect
                  x={gapX - 5}
                  y={gapY + gapH / 2 - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // معالجة resize من الجانب الأيسر
                    const startX = gapX;
                    const startWidth = gapW;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newX = currentPoint.x;
                      const newWidth = startWidth + (startX - newX);
                      if (newWidth >= 20 && newX >= roomX && newX + newWidth <= roomX + room.width_px) {
                        handleDoorResize(newX - roomX, gapY - roomY, newWidth, gapH);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <rect
                  x={gapX + gapW - 5}
                  y={gapY + gapH / 2 - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    // معالجة resize من الجانب الأيمن
                    const startX = gapX;
                    const startWidth = gapW;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newWidth = currentPoint.x - startX;
                      if (newWidth >= 20 && startX + newWidth <= roomX + room.width_px) {
                        handleDoorResize(startX - roomX, gapY - roomY, newWidth, gapH);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </>
            ) : (
              <>
                <rect
                  x={gapX + gapW / 2 - 5}
                  y={gapY - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startY = gapY;
                    const startHeight = gapH;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newY = currentPoint.y;
                      const newHeight = startHeight + (startY - newY);
                      if (newHeight >= 20 && newY >= roomY && newY + newHeight <= roomY + room.height_px) {
                        handleDoorResize(gapX - roomX, newY - roomY, gapW, newHeight);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <rect
                  x={gapX + gapW / 2 - 5}
                  y={gapY + gapH - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startY = gapY;
                    const startHeight = gapH;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newHeight = currentPoint.y - startY;
                      if (newHeight >= 20 && startY + newHeight <= roomY + room.height_px) {
                        handleDoorResize(gapX - roomX, startY - roomY, gapW, newHeight);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </>
            )}
          </>
        )}
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 🪟 رسم النافذة
  // ═══════════════════════════════════════════════
  const Window = ({ room, window: win, windowIndex, roomX, roomY, isSelected = false, onDrag = null, onClick = null, onResize = null, interactive = false }) => {
    const windowWidthPx = (win.width_m || 1.2) * scale_px_per_m;
    const wall = win.wall || "north";
    const position = Math.max(0.15, Math.min(0.85, win.position || 0.5));
    const thickness = 12;

    let x, y, width, height, isHorizontal;

    switch (wall) {
      case "north":
        x = roomX + room.width_px * position - windowWidthPx / 2;
        y = roomY - thickness / 2;
        width = windowWidthPx;
        height = thickness;
        isHorizontal = true;
        break;
      case "south":
        x = roomX + room.width_px * position - windowWidthPx / 2;
        y = roomY + room.height_px - thickness / 2;
        width = windowWidthPx;
        height = thickness;
        isHorizontal = true;
        break;
      case "east":
        x = roomX + room.width_px - thickness / 2;
        y = roomY + room.height_px * position - windowWidthPx / 2;
        width = thickness;
        height = windowWidthPx;
        isHorizontal = false;
        break;
      case "west":
        x = roomX - thickness / 2;
        y = roomY + room.height_px * position - windowWidthPx / 2;
        width = thickness;
        height = windowWidthPx;
        isHorizontal = false;
        break;
      default:
        return null;
    }

    // معالجة resize للنافذة
    const handleWindowResize = (newX, newY, newWidth, newHeight) => {
      if (!onResize) return;
      
      // حساب العرض الجديد بالمتر
      const newWidth_m = (isHorizontal ? newWidth : newHeight) / scale_px_per_m;
      
      // حساب الموضع الجديد (position)
      let newPosition;
      const wallLength = isHorizontal ? room.width_px : room.height_px;
      
      if (isHorizontal) {
        const centerX = newX + newWidth / 2;
        newPosition = (centerX - roomX) / wallLength;
      } else {
        const centerY = newY + newHeight / 2;
        newPosition = (centerY - roomY) / wallLength;
      }
      
      newPosition = Math.max(0.15, Math.min(0.85, newPosition));
      
      onResize(windowIndex, newPosition, newWidth_m);
    };

    // معالجة سحب النافذة
    const handleWindowMouseDown = (e) => {
      // التحقق من أن النقر لم يكن على resize handle
      const target = e.target;
      if (target.getAttribute && target.getAttribute('fill') === '#FF5722') {
        return; // هذا resize handle
      }
      
      if (!interactive || !isSelected) return;
      e.preventDefault();
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;

      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const startPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

      const startPosition = position;
      const wallLength = isHorizontal ? room.width_px : room.height_px;

      let isDragging = false;

      const handleMouseMove = (moveEvent) => {
        if (!isDragging) {
          const dx = Math.abs(moveEvent.clientX - e.clientX);
          const dy = Math.abs(moveEvent.clientY - e.clientY);
          if (dx < 5 && dy < 5) return;
          isDragging = true;
        }

        svgPoint.x = moveEvent.clientX;
        svgPoint.y = moveEvent.clientY;
        const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

        let newPosition;
        if (isHorizontal) {
          const centerX = currentPoint.x;
          newPosition = (centerX - roomX) / wallLength;
        } else {
          const centerY = currentPoint.y;
          newPosition = (centerY - roomY) / wallLength;
        }

        newPosition = Math.max(0.15, Math.min(0.85, newPosition));

        if (onResize) {
          onResize(windowIndex, newPosition, win.width_m);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (!isDragging && onClick) {
          setTimeout(() => onClick(windowIndex), 10);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <g 
        className="window"
        style={{ 
          cursor: interactive ? (isSelected ? 'move' : 'pointer') : 'default',
          pointerEvents: interactive ? 'all' : 'none'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && interactive) {
            onClick(windowIndex);
          }
        }}
      >
        {/* طبقة شفافة للنقر */}
        <rect 
          x={x - 8} 
          y={y - 8} 
          width={width + 16} 
          height={height + 16} 
          fill="transparent" 
          stroke="none"
          pointerEvents="all"
          onMouseDown={handleWindowMouseDown}
          style={{ cursor: interactive && isSelected ? 'move' : interactive ? 'pointer' : 'default' }}
        />
        {/* إطار النافذة الخارجي */}
        <rect 
          x={x - 4} 
          y={y - 4} 
          width={width + 8} 
          height={height + 8} 
          fill="#E0E0E0" 
          stroke="#757575" 
          strokeWidth={2.5} 
          rx={2} 
        />
        
        {/* الزجاج */}
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill="#E3F2FD" 
          stroke="#1976D2" 
          strokeWidth={1.5} 
          rx={1}
          opacity={0.9}
        />
        
        {/* انعكاس الضوء */}
        <rect 
          x={x + width * 0.1} 
          y={y + height * 0.1} 
          width={width * 0.3} 
          height={height * 0.3} 
          fill="#FFFFFF" 
          opacity={0.4}
          rx={1}
        />
        
        {/* تقسيمات النافذة */}
        {isHorizontal ? (
          <>
            {/* خط عمودي في المنتصف */}
            <line 
              x1={x + width / 2} 
              y1={y} 
              x2={x + width / 2} 
              y2={y + height} 
              stroke="#1976D2" 
              strokeWidth={2} 
            />
            {/* خطوط جانبية */}
            <line 
              x1={x + width / 4} 
              y1={y} 
              x2={x + width / 4} 
              y2={y + height} 
              stroke="#64B5F6" 
              strokeWidth={1} 
              opacity={0.7}
            />
            <line 
              x1={x + (3 * width) / 4} 
              y1={y} 
              x2={x + (3 * width) / 4} 
              y2={y + height} 
              stroke="#64B5F6" 
              strokeWidth={1} 
              opacity={0.7}
            />
          </>
        ) : (
          <>
            {/* خط أفقي في المنتصف */}
            <line 
              x1={x} 
              y1={y + height / 2} 
              x2={x + width} 
              y2={y + height / 2} 
              stroke="#1976D2" 
              strokeWidth={2} 
            />
            {/* خطوط جانبية */}
            <line 
              x1={x} 
              y1={y + height / 4} 
              x2={x + width} 
              y2={y + height / 4} 
              stroke="#64B5F6" 
              strokeWidth={1} 
              opacity={0.7}
            />
            <line 
              x1={x} 
              y1={y + (3 * height) / 4} 
              x2={x + width} 
              y2={y + (3 * height) / 4} 
              stroke="#64B5F6" 
              strokeWidth={1} 
              opacity={0.7}
            />
          </>
        )}
        
        {/* مقابض تغيير الحجم للنافذة */}
        {isSelected && interactive && onResize && (
          <>
            {isHorizontal ? (
              <>
                <rect
                  x={x - 5}
                  y={y + height / 2 - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = x;
                    const startWidth = width;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newX = currentPoint.x;
                      const newWidth = startWidth + (startX - newX);
                      if (newWidth >= 20 && newX >= roomX && newX + newWidth <= roomX + room.width_px) {
                        handleWindowResize(newX - roomX, y - roomY, newWidth, height);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <rect
                  x={x + width - 5}
                  y={y + height / 2 - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ew-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = x;
                    const startWidth = width;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newWidth = currentPoint.x - startX;
                      if (newWidth >= 20 && startX + newWidth <= roomX + room.width_px) {
                        handleWindowResize(startX - roomX, y - roomY, newWidth, height);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </>
            ) : (
              <>
                <rect
                  x={x + width / 2 - 5}
                  y={y - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startY = y;
                    const startHeight = height;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newY = currentPoint.y;
                      const newHeight = startHeight + (startY - newY);
                      if (newHeight >= 20 && newY >= roomY && newY + newHeight <= roomY + room.height_px) {
                        handleWindowResize(x - roomX, newY - roomY, width, newHeight);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
                <rect
                  x={x + width / 2 - 5}
                  y={y + height - 5}
                  width={10}
                  height={10}
                  fill="#FF5722"
                  stroke="#fff"
                  strokeWidth={1.5}
                  rx={2}
                  style={{ cursor: 'ns-resize' }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startY = y;
                    const startHeight = height;
                    const handleMouseMove = (moveEvent) => {
                      const svg = svgRef.current;
                      if (!svg) return;
                      const svgPoint = svg.createSVGPoint();
                      svgPoint.x = moveEvent.clientX;
                      svgPoint.y = moveEvent.clientY;
                      const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
                      const newHeight = currentPoint.y - startY;
                      if (newHeight >= 20 && startY + newHeight <= roomY + room.height_px) {
                        handleWindowResize(x - roomX, startY - roomY, width, newHeight);
                      }
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                />
              </>
            )}
          </>
        )}
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 🔧 مقابض تغيير الحجم (Resize Handles)
  // ═══════════════════════════════════════════════
  const ResizeHandles = ({ x, y, width, height, onResize, interactive = false }) => {
    if (!interactive || !onResize) return null;

    const handleSize = 8;
    const handles = [
      { pos: 'nw', x: x, y: y, cursor: 'nw-resize' },
      { pos: 'ne', x: x + width, y: y, cursor: 'ne-resize' },
      { pos: 'sw', x: x, y: y + height, cursor: 'sw-resize' },
      { pos: 'se', x: x + width, y: y + height, cursor: 'se-resize' },
      { pos: 'n', x: x + width / 2, y: y, cursor: 'n-resize' },
      { pos: 's', x: x + width / 2, y: y + height, cursor: 's-resize' },
      { pos: 'e', x: x + width, y: y + height / 2, cursor: 'e-resize' },
      { pos: 'w', x: x, y: y + height / 2, cursor: 'w-resize' },
    ];

    const handleMouseDown = (e, handlePos) => {
      e.preventDefault();
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;

      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const startPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

      const startX = x;
      const startY = y;
      const startWidth = width;
      const startHeight = height;

      const handleMouseMove = (moveEvent) => {
        svgPoint.x = moveEvent.clientX;
        svgPoint.y = moveEvent.clientY;
        const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

        const deltaX = currentPoint.x - startPoint.x;
        const deltaY = currentPoint.y - startPoint.y;

        let newX = startX;
        let newY = startY;
        let newWidth = startWidth;
        let newHeight = startHeight;

        switch (handlePos) {
          case 'nw':
            newX = startX + deltaX;
            newY = startY + deltaY;
            newWidth = startWidth - deltaX;
            newHeight = startHeight - deltaY;
            break;
          case 'ne':
            newY = startY + deltaY;
            newWidth = startWidth + deltaX;
            newHeight = startHeight - deltaY;
            break;
          case 'sw':
            newX = startX + deltaX;
            newWidth = startWidth - deltaX;
            newHeight = startHeight + deltaY;
            break;
          case 'se':
            newWidth = startWidth + deltaX;
            newHeight = startHeight + deltaY;
            break;
          case 'n':
            newY = startY + deltaY;
            newHeight = startHeight - deltaY;
            break;
          case 's':
            newHeight = startHeight + deltaY;
            break;
          case 'e':
            newWidth = startWidth + deltaX;
            break;
          case 'w':
            newX = startX + deltaX;
            newWidth = startWidth - deltaX;
            break;
        }

        // التأكد من الحد الأدنى للحجم
        const minSize = 10;
        if (newWidth < minSize) {
          newWidth = minSize;
          if (handlePos.includes('w')) newX = startX + startWidth - minSize;
        }
        if (newHeight < minSize) {
          newHeight = minSize;
          if (handlePos.includes('n')) newY = startY + startHeight - minSize;
        }

        onResize(newX, newY, newWidth, newHeight);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <g className="resize-handles">
        {handles.map((handle) => (
          <rect
            key={handle.pos}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="#FF5722"
            stroke="#fff"
            strokeWidth={1.5}
            rx={2}
            style={{ cursor: handle.cursor }}
            onMouseDown={(e) => handleMouseDown(e, handle.pos)}
          />
        ))}
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 🛋️ رسم الأثاث
  // ═══════════════════════════════════════════════
  const Furniture = ({ item, roomX, roomY, room, isSelected = false, onDrag = null, onClick = null, onResize = null, interactive = false }) => {
    const x = roomX + item.x;
    const y = roomY + item.y;
    const { width, height, type } = item;
    const furnitureRef = useRef(null);

    // معالجة resize للأثاث
    const handleFurnitureResize = (newX, newY, newWidth, newHeight) => {
      if (!onResize) return;
      
      // تحويل الإحداثيات إلى إحداثيات نسبية للغرفة
      const relativeX = newX - roomX;
      const relativeY = newY - roomY;
      
      // التأكد من أن الأثاث داخل حدود الغرفة
      const maxX = room.width_px - newWidth;
      const maxY = room.height_px - newHeight;
      const finalX = Math.max(0, Math.min(relativeX, maxX));
      const finalY = Math.max(0, Math.min(relativeY, maxY));
      const finalWidth = Math.min(newWidth, room.width_px - finalX);
      const finalHeight = Math.min(newHeight, room.height_px - finalY);
      
      onResize(item.id, finalX, finalY, finalWidth, finalHeight);
    };

    // معالجة سحب الأثاث
    const handleFurnitureMouseDown = (e) => {
      // التحقق من أن النقر لم يكن على resize handle
      const target = e.target;
      if (target.getAttribute && target.getAttribute('class') && target.getAttribute('class').includes('resize-handle')) {
        return;
      }
      // التحقق من أن النقر لم يكن على أحد المقابض
      if (target.parentElement && target.parentElement.getAttribute && target.parentElement.getAttribute('class') === 'resize-handles') {
        return;
      }
      
      if (!interactive || !onDrag) return;
      e.preventDefault();
      e.stopPropagation();

      const svg = svgRef.current;
      if (!svg) return;

      const svgPoint = svg.createSVGPoint();
      svgPoint.x = e.clientX;
      svgPoint.y = e.clientY;
      const startPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

      // حساب نقطة البداية بالنسبة للغرفة
      const startRoomX_px = padding_px + room.x_px;
      const startRoomY_px = padding_px + titleHeight + room.y_px;
      const startItemX_relative = startPoint.x - startRoomX_px;
      const startItemY_relative = startPoint.y - startRoomY_px;
      const startItemX = item.x;
      const startItemY = item.y;

      let isDragging = false;

      const handleMouseMove = (moveEvent) => {
        if (!isDragging) {
          const dx = Math.abs(moveEvent.clientX - e.clientX);
          const dy = Math.abs(moveEvent.clientY - e.clientY);
          if (dx < 5 && dy < 5) return;
          isDragging = true;
        }

        svgPoint.x = moveEvent.clientX;
        svgPoint.y = moveEvent.clientY;
        const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());

        // حساب الإزاحة بالنسبة للغرفة
        const currentRoomX_px = padding_px + room.x_px;
        const currentRoomY_px = padding_px + titleHeight + room.y_px;
        const currentItemX_relative = currentPoint.x - currentRoomX_px;
        const currentItemY_relative = currentPoint.y - currentRoomY_px;

        const deltaX_px = currentItemX_relative - startItemX_relative;
        const deltaY_px = currentItemY_relative - startItemY_relative;

        const newX = Math.max(0, Math.min(startItemX + deltaX_px, room.width_px - item.width));
        const newY = Math.max(0, Math.min(startItemY + deltaY_px, room.height_px - item.height));

        if (onDrag) {
          onDrag(item.id, newX, newY);
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        if (!isDragging && onClick) {
          setTimeout(() => onClick(item.id), 10);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const furnitureContent = (() => {
      switch (type) {
        case "sofa":
          return (
            <g>
            <rect x={x} y={y} width={width} height={height} fill="#7E57C2" stroke="#5E35B1" strokeWidth={1.5} rx={5} />
            <rect x={x + 4} y={y + 4} width={width - 8} height={height * 0.5} fill="#9575CD" rx={3} />
            <rect x={x + 5} y={y + height - 10} width={12} height={10} fill="#5E35B1" rx={2} />
            <rect x={x + width - 17} y={y + height - 10} width={12} height={10} fill="#5E35B1" rx={2} />
          </g>
        );

      case "tv":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#263238" stroke="#000" strokeWidth={1} rx={2} />
            <rect x={x + 3} y={y + 2} width={width - 6} height={height - 4} fill="#37474F" rx={1} />
            <rect x={x + width / 2 - 8} y={y + height} width={16} height={4} fill="#263238" />
          </g>
        );

      case "coffee_table":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#A1887F" stroke="#6D4C41" strokeWidth={1} rx={10} />
            <ellipse cx={x + width / 2} cy={y + height / 2} rx={width / 4} ry={height / 4} fill="#8D6E63" opacity={0.5} />
          </g>
        );

      case "bookshelf":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#6D4C41" stroke="#4E342E" strokeWidth={1} />
            {[0.25, 0.5, 0.75].map((pos, i) => (
              <line key={i} x1={x} y1={y + height * pos} x2={x + width} y2={y + height * pos} stroke="#4E342E" strokeWidth={1} />
            ))}
          </g>
        );

      case "bed":
      case "king_bed":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} rx={4} />
            <rect x={x + 4} y={y + 4} width={width - 8} height={height * 0.25} fill="#BCAAA4" rx={3} />
            <rect x={x + 4} y={y + height * 0.32} width={width - 8} height={height * 0.62} fill="#EFEBE9" stroke="#D7CCC8" rx={2} />
            <rect x={x + width / 2 - 10} y={y + height * 0.4} width={20} height={25} fill="#FFAB91" rx={2} />
          </g>
        );

      case "wardrobe":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#795548" stroke="#4E342E" strokeWidth={1.5} rx={2} />
            <line x1={x + width / 2} y1={y + 2} x2={x + width / 2} y2={y + height - 2} stroke="#4E342E" strokeWidth={1.5} />
            <circle cx={x + width / 2 - 6} cy={y + height / 2} r={3} fill="#FFD54F" stroke="#FFC107" />
            <circle cx={x + width / 2 + 6} cy={y + height / 2} r={3} fill="#FFD54F" stroke="#FFC107" />
          </g>
        );

      case "nightstand":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#8D6E63" stroke="#5D4037" strokeWidth={1} rx={2} />
            <rect x={x + 3} y={y + height / 2} width={width - 6} height={height / 3} fill="#6D4C41" rx={1} />
            <circle cx={x + width / 2} cy={y + height * 0.65} r={2} fill="#FFD54F" />
          </g>
        );

      case "vanity":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#FFCCBC" stroke="#FF8A65" strokeWidth={1} rx={3} />
            <ellipse cx={x + width / 2} cy={y + 6} rx={width / 3} ry={4} fill="#E0E0E0" stroke="#BDBDBD" />
          </g>
        );

      case "counter":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#BCAAA4" stroke="#8D6E63" strokeWidth={1.5} rx={2} />
            <rect x={x + 5} y={y + 3} width={width - 10} height={height - 6} fill="#D7CCC8" rx={1} />
          </g>
        );

      case "stove":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#37474F" stroke="#263238" strokeWidth={1} rx={2} />
            <circle cx={x + width * 0.3} cy={y + height * 0.35} r={7} fill="#455A64" stroke="#78909C" strokeWidth={2} />
            <circle cx={x + width * 0.7} cy={y + height * 0.35} r={7} fill="#455A64" stroke="#78909C" strokeWidth={2} />
            <circle cx={x + width * 0.3} cy={y + height * 0.7} r={5} fill="#455A64" stroke="#78909C" strokeWidth={2} />
            <circle cx={x + width * 0.7} cy={y + height * 0.7} r={5} fill="#455A64" stroke="#78909C" strokeWidth={2} />
          </g>
        );

      case "fridge":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#ECEFF1" stroke="#78909C" strokeWidth={1.5} rx={3} />
            <line x1={x} y1={y + height * 0.35} x2={x + width} y2={y + height * 0.35} stroke="#78909C" strokeWidth={1.5} />
            <rect x={x + width - 8} y={y + 6} width={4} height={8} fill="#90A4AE" rx={1} />
            <rect x={x + width - 8} y={y + height * 0.4} width={4} height={12} fill="#90A4AE" rx={1} />
          </g>
        );

      case "sink":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#ECEFF1" stroke="#90A4AE" strokeWidth={1} rx={5} />
            <ellipse cx={x + width / 2} cy={y + height / 2} rx={width * 0.35} ry={height * 0.3} fill="#CFD8DC" stroke="#78909C" />
            <circle cx={x + width / 2} cy={y + height * 0.35} r={3} fill="#78909C" />
          </g>
        );

      case "toilet":
        return (
          <g>
            <ellipse cx={x + width / 2} cy={y + height * 0.6} rx={width * 0.4} ry={height * 0.35} fill="#fff" stroke="#90A4AE" strokeWidth={1.5} />
            <rect x={x + width * 0.2} y={y} width={width * 0.6} height={height * 0.35} fill="#ECEFF1" stroke="#90A4AE" strokeWidth={1} rx={4} />
            <rect x={x + width * 0.35} y={y + 3} width={width * 0.3} height={6} fill="#B0BEC5" rx={2} />
          </g>
        );

      case "shower":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#E1F5FE" stroke="#03A9F4" strokeWidth={1.5} rx={3} />
            <circle cx={x + width / 2} cy={y + 12} r={8} fill="#B3E5FC" stroke="#03A9F4" strokeWidth={1} />
            <line x1={x + width / 2} y1={y + 20} x2={x + width / 2} y2={y + height - 10} stroke="#4FC3F7" strokeWidth={2} strokeDasharray="4,4" />
          </g>
        );

      case "bathtub":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#fff" stroke="#78909C" strokeWidth={2} rx={15} />
            <ellipse cx={x + 18} cy={y + height / 2} rx={10} ry={height * 0.3} fill="#E3F2FD" />
          </g>
        );

      case "dining_table":
        return (
          <g>
            <ellipse cx={x + width / 2} cy={y + height / 2} rx={width * 0.45} ry={height * 0.4} fill="#8D6E63" stroke="#5D4037" strokeWidth={1.5} />
            <ellipse cx={x + width / 2} cy={y + height / 2} rx={width * 0.3} ry={height * 0.25} fill="#A1887F" opacity={0.5} />
          </g>
        );

      case "chairs":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#5D4037" stroke="#3E2723" strokeWidth={1} rx={3} />
            <rect x={x + 3} y={y + height * 0.6} width={width - 6} height={height * 0.35} fill="#6D4C41" rx={2} />
          </g>
        );

      case "desk":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#A1887F" stroke="#6D4C41" strokeWidth={1.5} rx={3} />
            <rect x={x + 5} y={y + height - 8} width={10} height={8} fill="#6D4C41" rx={1} />
            <rect x={x + width - 15} y={y + height - 8} width={10} height={8} fill="#6D4C41" rx={1} />
          </g>
        );

      case "chair":
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} fill="#5C6BC0" stroke="#3949AB" strokeWidth={1} rx={4} />
            <rect x={x + 3} y={y + height * 0.55} width={width - 6} height={height * 0.4} fill="#7986CB" rx={3} />
          </g>
        );

      case "plants":
        return (
          <g>
            <rect x={x + width * 0.2} y={y + height * 0.5} width={width * 0.6} height={height * 0.5} fill="#8D6E63" rx={3} />
            <ellipse cx={x + width / 2} cy={y + height * 0.35} rx={width * 0.4} ry={height * 0.35} fill="#66BB6A" />
            <ellipse cx={x + width * 0.35} cy={y + height * 0.25} rx={width * 0.25} ry={height * 0.25} fill="#81C784" />
          </g>
        );

        default:
          return (
            <rect x={x} y={y} width={width} height={height} fill="#E0E0E0" stroke="#9E9E9E" strokeWidth={1} rx={3} />
          );
      }
    })();

    return (
      <g
        ref={furnitureRef}
        className="furniture"
        style={{ 
          cursor: interactive ? 'move' : 'default',
          pointerEvents: interactive ? 'all' : 'none'
        }}
        onMouseDown={handleFurnitureMouseDown}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick && !interactive) {
            onClick(item.id);
          }
        }}
        opacity={isSelected ? 0.8 : 1}
      >
        {/* طبقة شفافة لضمان النقر على الأثاث */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          stroke="none"
          pointerEvents="all"
          style={{ cursor: interactive ? 'move' : 'default' }}
          onMouseDown={handleFurnitureMouseDown}
        />
        {furnitureContent}
        {isSelected && (
          <>
            <rect
              x={x - 2}
              y={y - 2}
              width={width + 4}
              height={height + 4}
              fill="none"
              stroke="#FF5722"
              strokeWidth={2}
              strokeDasharray="4,4"
              pointerEvents="none"
            />
            {/* مقابض تغيير الحجم */}
            <ResizeHandles
              x={x}
              y={y}
              width={width}
              height={height}
              onResize={handleFurnitureResize}
              interactive={interactive}
            />
          </>
        )}
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 📏 سهم البُعد الأفقي (داخل الغرفة - أسفل)
  // ═══════════════════════════════════════════════
  const InnerHorizontalDimension = ({ roomX, roomY, roomWidth, roomHeight, label }) => {
    const margin = 15; // المسافة من الحافة السفلية
    const y = roomY + roomHeight - margin;
    const x1 = roomX + 10;
    const x2 = roomX + roomWidth - 10;
    const length = x2 - x1;

    return (
      <g className="inner-dimension-horizontal">
        {/* خلفية شفافة للخط */}
        <line x1={x1} y1={y} x2={x2} y2={y} stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
        {/* الخط الأساسي */}
        <line x1={x1} y1={y} x2={x2} y2={y} stroke="#D32F2F" strokeWidth={1.5} />
        {/* السهم الأيسر */}
        <polygon points={`${x1},${y} ${x1 + 8},${y - 4} ${x1 + 8},${y + 4}`} fill="#D32F2F" />
        {/* السهم الأيمن */}
        <polygon points={`${x2},${y} ${x2 - 8},${y - 4} ${x2 - 8},${y + 4}`} fill="#D32F2F" />
        {/* خطوط النهاية */}
        <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke="#D32F2F" strokeWidth={1} />
        <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke="#D32F2F" strokeWidth={1} />
        {/* مربع النص */}
        <rect 
          x={x1 + length / 2 - 22} 
          y={y - 10} 
          width={44} 
          height={16} 
          fill="#fff" 
          stroke="#D32F2F" 
          strokeWidth={1}
          rx={3} 
        />
        {/* النص */}
        <text 
          x={x1 + length / 2} 
          y={y + 3} 
          textAnchor="middle" 
          fontSize="11" 
          fontFamily="Arial" 
          fontWeight="bold" 
          fill="#D32F2F"
        >
          {label}
        </text>
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 📏 سهم البُعد العمودي (داخل الغرفة - يمين)
  // ═══════════════════════════════════════════════
  const InnerVerticalDimension = ({ roomX, roomY, roomWidth, roomHeight, label }) => {
    const margin = 15; // المسافة من الحافة اليمنى
    const x = roomX + roomWidth - margin;
    const y1 = roomY + 10;
    const y2 = roomY + roomHeight - 10;
    const length = y2 - y1;

    return (
      <g className="inner-dimension-vertical">
        {/* خلفية شفافة للخط */}
        <line x1={x} y1={y1} x2={x} y2={y2} stroke="rgba(255,255,255,0.7)" strokeWidth={4} />
        {/* الخط الأساسي */}
        <line x1={x} y1={y1} x2={x} y2={y2} stroke="#1565C0" strokeWidth={1.5} />
        {/* السهم العلوي */}
        <polygon points={`${x},${y1} ${x - 4},${y1 + 8} ${x + 4},${y1 + 8}`} fill="#1565C0" />
        {/* السهم السفلي */}
        <polygon points={`${x},${y2} ${x - 4},${y2 - 8} ${x + 4},${y2 - 8}`} fill="#1565C0" />
        {/* خطوط النهاية */}
        <line x1={x - 6} y1={y1} x2={x + 6} y2={y1} stroke="#1565C0" strokeWidth={1} />
        <line x1={x - 6} y1={y2} x2={x + 6} y2={y2} stroke="#1565C0" strokeWidth={1} />
        {/* مربع النص */}
        <rect 
          x={x - 22} 
          y={y1 + length / 2 - 8} 
          width={44} 
          height={16} 
          fill="#fff" 
          stroke="#1565C0" 
          strokeWidth={1}
          rx={3} 
        />
        {/* النص */}
        <text 
          x={x} 
          y={y1 + length / 2 + 4} 
          textAnchor="middle" 
          fontSize="11" 
          fontFamily="Arial" 
          fontWeight="bold" 
          fill="#1565C0"
        >
          {label}
        </text>
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 📏 سهم البُعد الأفقي (خارجي للمخطط الكلي)
  // ═══════════════════════════════════════════════
  const OuterHorizontalDimension = ({ x, y, length, label }) => (
    <g className="outer-dimension">
      <line x1={x} y1={y} x2={x + length} y2={y} stroke="#333" strokeWidth={1.5} />
      <polygon points={`${x},${y} ${x + 10},${y - 5} ${x + 10},${y + 5}`} fill="#333" />
      <polygon points={`${x + length},${y} ${x + length - 10},${y - 5} ${x + length - 10},${y + 5}`} fill="#333" />
      <line x1={x} y1={y - 10} x2={x} y2={y + 10} stroke="#333" strokeWidth={1} />
      <line x1={x + length} y1={y - 10} x2={x + length} y2={y + 10} stroke="#333" strokeWidth={1} />
      <rect x={x + length / 2 - 28} y={y - 12} width={56} height={20} fill="#fff" stroke="#333" strokeWidth={1} rx={4} />
      <text x={x + length / 2} y={y + 5} textAnchor="middle" fontSize="13" fontFamily="Arial" fontWeight="bold" fill="#333">
        {label}
      </text>
    </g>
  );

  // ═══════════════════════════════════════════════
  // 📏 سهم البُعد العمودي (خارجي للمخطط الكلي)
  // ═══════════════════════════════════════════════
  const OuterVerticalDimension = ({ x, y, length, label }) => (
    <g className="outer-dimension">
      <line x1={x} y1={y} x2={x} y2={y + length} stroke="#333" strokeWidth={1.5} />
      <polygon points={`${x},${y} ${x - 5},${y + 10} ${x + 5},${y + 10}`} fill="#333" />
      <polygon points={`${x},${y + length} ${x - 5},${y + length - 10} ${x + 5},${y + length - 10}`} fill="#333" />
      <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke="#333" strokeWidth={1} />
      <line x1={x - 10} y1={y + length} x2={x + 10} y2={y + length} stroke="#333" strokeWidth={1} />
      <rect x={x - 28} y={y + length / 2 - 10} width={56} height={20} fill="#fff" stroke="#333" strokeWidth={1} rx={4} />
      <text x={x} y={y + length / 2 + 5} textAnchor="middle" fontSize="13" fontFamily="Arial" fontWeight="bold" fill="#333">
        {label}
      </text>
    </g>
  );

  // ═══════════════════════════════════════════════
  // 🧭 بوصلة الشمال
  // ═══════════════════════════════════════════════
  const NorthCompass = ({ x, y, direction }) => {
    const rotation = { up: 0, north: 0, right: 90, east: 90, down: 180, south: 180, left: 270, west: 270 };
    const angle = rotation[direction] || 0;

    return (
      <g transform={`translate(${x}, ${y})`}>
        <circle cx={0} cy={0} r={28} fill="#fff" stroke="#333" strokeWidth={2} />
        <circle cx={0} cy={0} r={24} fill="#FAFAFA" stroke="#ddd" strokeWidth={1} />
        <g transform={`rotate(${angle})`}>
          <polygon points="0,-18 -7,12 0,6 7,12" fill="#D32F2F" stroke="#B71C1C" strokeWidth={0.5} />
          <polygon points="0,18 -7,-12 0,-6 7,-12" fill="#ECEFF1" stroke="#999" strokeWidth={0.5} />
        </g>
        <text x={0} y={-34} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#333">N</text>
        <text x={0} y={44} textAnchor="middle" fontSize="10" fill="#666">الشمال</text>
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 📐 شريط المقياس
  // ═══════════════════════════════════════════════
  const ScaleBar = ({ x, y, pixelsPerMeter }) => {
    const meters = [0, 1, 2, 3, 4, 5];

    return (
      <g transform={`translate(${x}, ${y})`}>
        <text x={0} y={-10} fontSize="12" fontWeight="bold" fill="#333">مقياس الرسم</text>
        {meters.slice(0, -1).map((m, i) => (
          <rect
            key={m}
            x={i * pixelsPerMeter}
            y={0}
            width={pixelsPerMeter}
            height={12}
            fill={i % 2 === 0 ? "#333" : "#fff"}
            stroke="#333"
            strokeWidth={1}
          />
        ))}
        {meters.map((m, i) => (
          <text key={`t-${m}`} x={i * pixelsPerMeter} y={28} textAnchor="middle" fontSize="10" fill="#555">
            {m}م
          </text>
        ))}
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 📋 وسيلة الإيضاح
  // ═══════════════════════════════════════════════
  const Legend = ({ x, y }) => {
    const items = [
      { type: "living", label: "صالة" },
      { type: "bedroom", label: "غرفة نوم" },
      { type: "master_bedroom", label: "رئيسية" },
      { type: "kitchen", label: "مطبخ" },
      { type: "bathroom", label: "حمام" },
      { type: "balcony", label: "بلكونة" },
    ];

    return (
      <g transform={`translate(${x}, ${y})`}>
        <text x={0} y={-8} fontSize="12" fontWeight="bold" fill="#333">دليل الألوان</text>
        {items.map((item, i) => {
          const style = getRoomStyle(item.type);
          const col = i % 3;
          const row = Math.floor(i / 3);
          return (
            <g key={item.type} transform={`translate(${col * 90}, ${row * 25 + 8})`}>
              <rect x={0} y={0} width={22} height={16} fill={style.fill} stroke={style.stroke} strokeWidth={1.5} rx={2} />
              <text x={28} y={12} fontSize="11" fill="#333">{item.label}</text>
            </g>
          );
        })}
        {/* رموز */}
        <g transform="translate(0, 65)">
          <line x1={0} y1={8} x2={0} y2={20} stroke="#333" strokeWidth={3} />
          <path d="M 0 8 A 12 12 0 0 1 12 20" fill="none" stroke="#666" strokeDasharray="3,2" />
          <text x={20} y={18} fontSize="10" fill="#333">باب</text>

          <g transform="translate(70, 0)">
            <rect x={0} y={6} width={22} height={10} fill="#B3E5FC" stroke="#03A9F4" strokeWidth={1.5} />
            <text x={28} y={16} fontSize="10" fill="#333">نافذة</text>
          </g>

          <g transform="translate(150, 0)">
            <line x1={0} y1={10} x2={20} y2={10} stroke="#D32F2F" strokeWidth={1.5} />
            <polygon points="0,10 6,7 6,13" fill="#D32F2F" />
            <polygon points="20,10 14,7 14,13" fill="#D32F2F" />
            <text x={26} y={14} fontSize="10" fill="#333">مقاس</text>
          </g>
        </g>
      </g>
    );
  };

  // ═══════════════════════════════════════════════
  // 🖼️ الرسم الرئيسي
  // ═══════════════════════════════════════════════
  
  // معالجة النقر على الخلفية لإلغاء التحديد
  const handleBackgroundClick = (e) => {
    // التحقق من أن النقر كان على طبقة الخلفية الشفافة
    if (e.target.getAttribute && e.target.getAttribute('class') === 'background-click-layer') {
      if (interactive && onBackgroundClick) {
        e.stopPropagation();
        onBackgroundClick();
      }
    }
  };

  return (
    <div style={{ direction: "ltr", overflow: "auto" }}>
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          background: "#fff",
          border: "3px solid #1a237e",
          borderRadius: "12px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        {/* ═══════════ العنوان ═══════════ */}
        {title && (
          <g>
            <rect x={0} y={0} width={canvasWidth} height={titleHeight} fill="#1a237e" />
            <text
              x={canvasWidth / 2}
              y={titleHeight / 2 + 8}
              textAnchor="middle"
              fontSize="24"
              fontFamily="Tahoma, Arial"
              fontWeight="bold"
              fill="#fff"
            >
              {title}
            </text>
          </g>
        )}

        {/* ═══════════ طبقة شفافة للنقر على الخلفية (لإلغاء التحديد) ═══════════ */}
        {interactive && (
          <rect
            className="background-click-layer"
            x={padding_px}
            y={padding_px + titleHeight}
            width={total_width_px}
            height={total_height_px}
            fill="transparent"
            stroke="none"
            pointerEvents="all"
            onClick={handleBackgroundClick}
          />
        )}

        {/* ═══════════ الإطار الخارجي ═══════════ */}
        <rect
          x={padding_px}
          y={padding_px + titleHeight}
          width={total_width_px}
          height={total_height_px}
          fill="#FAFAFA"
          stroke="#000"
          strokeWidth={5}
          pointerEvents="none"
        />

        {/* ═══════════ الغرف ═══════════ */}
        {rooms.map((room, index) => {
          const roomX = padding_px + room.x_px;
          const roomY = padding_px + titleHeight + room.y_px;
          const centerX = roomX + room.width_px / 2;
          const centerY = roomY + room.height_px / 2;
          const isSelected = interactive && selectedRoomId === room.id;

          // معالجة السحب في الوضع التفاعلي
          const handleMouseDown = (e) => {
            // التحقق من أن النقر لم يكن على عنصر فرعي (أثاث، باب، نافذة)
            const target = e.target;
            
            // التحقق من أن النقر لم يكن على عنصر فرعي
            // نتحقق من parentElement لأن SVG elements قد لا تدعم closest
            let currentElement = target;
            let isChildElement = false;
            
            // التحقق من class name أو parent class
            for (let i = 0; i < 5 && currentElement; i++) {
              if (currentElement.getAttribute && currentElement.getAttribute('class')) {
                const className = currentElement.getAttribute('class');
                if (className.includes('door') || className.includes('window') || className.includes('furniture')) {
                  isChildElement = true;
                  break;
                }
              }
              currentElement = currentElement.parentElement || currentElement.parentNode;
            }
            
            if (isChildElement) {
              // إذا كان النقر على عنصر فرعي، لا نفعل شيئاً
              e.stopPropagation();
              return;
            }
            
            if (!interactive || !onRoomDrag) return;
            e.preventDefault();
            e.stopPropagation();
            
            const svg = svgRef.current;
            if (!svg) return;
            
            const svgPoint = svg.createSVGPoint();
            svgPoint.x = e.clientX;
            svgPoint.y = e.clientY;
            const startPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
            
            // حساب نقطة البداية مع مراعاة الإزاحة
            const startRoomX_px = startPoint.x - padding_px;
            const startRoomY_px = startPoint.y - padding_px - titleHeight;
            const startRoomX_m = room.x_m;
            const startRoomY_m = room.y_m;

            let isDragging = false;

            const handleMouseMove = (moveEvent) => {
              if (!isDragging) {
                // تحقق من أن المستخدم بدأ السحب فعلياً (أكثر من 5 بكسل)
                const dx = Math.abs(moveEvent.clientX - e.clientX);
                const dy = Math.abs(moveEvent.clientY - e.clientY);
                if (dx < 5 && dy < 5) return;
                isDragging = true;
              }

              svgPoint.x = moveEvent.clientX;
              svgPoint.y = moveEvent.clientY;
              const currentPoint = svgPoint.matrixTransform(svg.getScreenCTM().inverse());
              
              // حساب الإزاحة بالبكسل ثم تحويلها للمتر
              const deltaX_px = (currentPoint.x - padding_px) - startRoomX_px;
              const deltaY_px = (currentPoint.y - padding_px - titleHeight) - startRoomY_px;
              const deltaX_m = deltaX_px / scale_px_per_m;
              const deltaY_m = deltaY_px / scale_px_per_m;
              
              const newX = Math.max(0, startRoomX_m + deltaX_m);
              const newY = Math.max(0, startRoomY_m + deltaY_m);
              
              if (onRoomDrag) {
                onRoomDrag(room.id, newX, newY);
              }
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
              
              // لا نحدد الغرفة عند النقر مرة واحدة - فقط عند double click
              // تم إزالة استدعاء onRoomClick من هنا
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          };

          // معالجة النقر المزدوج لتحديد الغرفة
          const handleDoubleClick = (e) => {
            // التحقق من أن النقر لم يكن على عنصر فرعي
            const target = e.target;
            let currentElement = target;
            let isChildElement = false;
            
            for (let i = 0; i < 5 && currentElement; i++) {
              if (currentElement.getAttribute && currentElement.getAttribute('class')) {
                const className = currentElement.getAttribute('class');
                if (className.includes('door') || className.includes('window') || className.includes('furniture')) {
                  isChildElement = true;
                  break;
                }
              }
              currentElement = currentElement.parentElement || currentElement.parentNode;
            }
            
            if (isChildElement) {
              e.stopPropagation();
              return;
            }
            
            if (interactive && onRoomClick) {
              e.preventDefault();
              e.stopPropagation();
              onRoomClick(room.id);
            }
          };

          return (
            <g 
              key={room.id || index}
              style={{ cursor: 'default' }}
              onMouseDown={handleMouseDown}
              onDoubleClick={handleDoubleClick}
            >
              {/* شكل الغرفة */}
              <RoomShape 
                room={room} 
                roomX={roomX} 
                roomY={roomY} 
                isSelected={isSelected}
              />

              {/* الأثاث */}
              {room.furniture_items?.map((item, fIndex) => (
                <Furniture 
                  key={item.id || `furniture-${fIndex}`} 
                  item={item} 
                  roomX={roomX} 
                  roomY={roomY}
                  room={room}
                  isSelected={interactive && selectedFurnitureId === item.id}
                  onDrag={onFurnitureDrag}
                  onClick={onFurnitureClick}
                  onResize={onFurnitureResize}
                  interactive={interactive}
                />
              ))}

              {/* النوافذ */}
              {room.windows?.map((win, wIndex) => (
                <Window 
                  key={`window-${wIndex}`} 
                  room={room} 
                  window={win} 
                  windowIndex={wIndex}
                  roomX={roomX} 
                  roomY={roomY}
                  interactive={interactive}
                  isSelected={interactive && selectedWindowIndex === wIndex && selectedRoomId === room.id}
                  onClick={onWindowClick}
                  onResize={onWindowResize}
                />
              ))}

              {/* الأبواب */}
              {room.doors?.map((door, dIndex) => (
                <Door 
                  key={`door-${dIndex}`} 
                  room={room} 
                  door={door} 
                  doorIndex={dIndex}
                  roomX={roomX} 
                  roomY={roomY}
                  interactive={interactive}
                  isSelected={interactive && selectedDoorIndex === dIndex && selectedRoomId === room.id}
                  onClick={onDoorClick}
                  onResize={onDoorResize}
                />
              ))}

              {/* ═══════════ أسهم الأبعاد داخل الغرفة ═══════════ */}
              {/* البُعد الأفقي (العرض) - داخل الغرفة أسفل */}
              <InnerHorizontalDimension
                roomX={roomX}
                roomY={roomY}
                roomWidth={room.width_px}
                roomHeight={room.height_px}
                label={`${room.width_m} م`}
              />

              {/* البُعد العمودي (الطول) - داخل الغرفة يمين */}
              <InnerVerticalDimension
                roomX={roomX}
                roomY={roomY}
                roomWidth={room.width_px}
                roomHeight={room.height_px}
                label={`${room.height_m} م`}
              />

              {/* معلومات الغرفة */}
              <foreignObject x={roomX + 5} y={centerY - 35} width={room.width_px - 10} height={70}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Tahoma, Arial",
                    direction: "rtl",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "bold", 
                    color: "#1a1a1a", 
                    textShadow: "1px 1px 2px #fff, -1px -1px 2px #fff",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    padding: "2px 6px",
                    borderRadius: "4px"
                  }}>
                    {room.name}
                  </div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#333", 
                    marginTop: "4px",
                    backgroundColor: "rgba(255,255,255,0.7)",
                    padding: "1px 4px",
                    borderRadius: "3px"
                  }}>
                    {room.area_m2} م²
                  </div>
                  {room.shape && room.shape !== "rectangle" && (
                    <div style={{ 
                      fontSize: "9px", 
                      color: "#666", 
                      marginTop: "2px",
                      backgroundColor: "rgba(255,255,255,0.6)",
                      padding: "1px 3px",
                      borderRadius: "2px"
                    }}>
                      {room.shape === "pentagon" ? "خماسي" : 
                       room.shape === "hexagon" ? "سداسي" :
                       room.shape === "triangle" ? "مثلث" :
                       room.shape === "trapezoid" ? "شبه منحرف" :
                       room.shape === "l_shape" ? "حرف L" : room.shape}
                    </div>
                  )}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* ═══════════ الأبعاد الكلية للمخطط (خارج الإطار) ═══════════ */}
        <OuterHorizontalDimension
          x={padding_px}
          y={padding_px + titleHeight - 70}
          length={total_width_px}
          label={`${layout.total_width_m} م`}
        />
        <OuterVerticalDimension
          x={padding_px - 70}
          y={padding_px + titleHeight}
          length={total_height_px}
          label={`${layout.total_height_m} م`}
        />

        {/* ═══════════ بوصلة الشمال ═══════════ */}
        <NorthCompass x={canvasWidth - 70} y={titleHeight + 70} direction={north_direction} />

        {/* ═══════════ شريط المقياس ═══════════ */}
        <ScaleBar x={padding_px} y={canvasHeight - legendHeight - scaleBarHeight + 15} pixelsPerMeter={scale_px_per_m} />

        {/* ═══════════ وسيلة الإيضاح ═══════════ */}
        <Legend x={padding_px + 320} y={canvasHeight - legendHeight - 5} />

        {/* ═══════════ الفوتر ═══════════ */}
        <text
          x={canvasWidth / 2}
          y={canvasHeight - 15}
          textAnchor="middle"
          fontSize="11"
          fontFamily="Arial"
          fill="#888"
        >
          Floor Plan Generator Pro | المقياس: ١م = {scale_px_per_m}px | تم الإنشاء تلقائياً
        </text>
      </svg>
    </div>
  );
}