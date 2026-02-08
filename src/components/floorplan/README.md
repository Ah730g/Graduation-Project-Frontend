# مكونات العرض ثلاثي الأبعاد (3D)

هذا المجلد يحتوي على مكونات React لعرض المخططات الأرضية بشكل ثلاثي الأبعاد.

## المكونات

### FloorPlan3D.tsx
المكون الرئيسي لعرض المخطط ثلاثي الأبعاد. يستخدم React Three Fiber لعرض المشهد.

**الخصائص:**
- `layout`: بيانات المخطط ثلاثي الأبعاد (Layout3D)
- `onClose`: دالة استدعاء عند إغلاق العرض (اختياري)

### Room3D.tsx
مكون لعرض غرفة واحدة في 3D. يتضمن:
- الأرضية
- الجدران الأربعة
- السقف
- الأثاث
- الأبواب
- النوافذ

### Wall3D.tsx
مكون لعرض جدار واحد.

### Furniture3D.tsx
مكون لعرض قطعة أثاث واحدة.

### Door3D.tsx
مكون لعرض باب.

### Window3D.tsx
مكون لعرض نافذة.

## الاستخدام

```tsx
import FloorPlan3D from '../components/floorplan/FloorPlan3D';
import { convert2DTo3D } from '../lib/floorplan3d/converter';

// تحويل المخطط من 2D إلى 3D
const layout3D = convert2DTo3D(layout2D);

// عرض المخطط
<FloorPlan3D layout={layout3D} onClose={() => setShow3D(false)} />
```

## التحكم

- **السحب**: للتدوير حول المخطط
- **عجلة الماوس**: للتصغير/التكبير
- **السحب مع Shift**: للتحريك

