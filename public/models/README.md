# نماذج الأثاث ثلاثية الأبعاد

هذا المجلد يحتوي على نماذج 3D جاهزة للأثاث بصيغة GLTF/GLB.

## كيفية إضافة نماذج جديدة

1. **تنزيل نماذج مجانية:**
   - [Poly Haven](https://polyhaven.com/models) - نماذج مجانية عالية الجودة
   - [Sketchfab](https://sketchfab.com) - ابحث عن نماذج مجانية (CC0 أو CC-BY)
   - [Free3D](https://free3d.com) - نماذج مجانية متنوعة
   - [TurboSquid Free](https://www.turbosquid.com/Search/3D-Models/free) - نماذج مجانية

2. **متطلبات النماذج:**
   - الصيغة: GLTF أو GLB (يفضل GLB لأنه أصغر حجماً)
   - الحجم: حاول أن تكون النماذج محسّنة (أقل من 1-2 MB لكل نموذج)
   - المقياس: يجب أن تكون النماذج بنطاق معقول (حوالي 1-2 متر)

3. **هيكل المجلد:**
   ```
   public/models/
   ├── furniture/
   │   ├── sofa.glb
   │   ├── bed.glb
   │   ├── chair.glb
   │   └── ...
   └── README.md
   ```

4. **تسجيل النموذج في الكود:**
   افتح `resources/js/lib/floorplan3d/modelLoader.ts` وأضف النموذج:
   ```typescript
   export const FURNITURE_MODELS: Record<string, string> = {
     'sofa': '/models/furniture/sofa.glb',
     'bed': '/models/furniture/bed.glb',
     // أضف المزيد هنا
   };
   ```

## تحسين الأداء

- استخدم GLB بدلاً من GLTF (أصغر حجماً)
- قلل عدد الـ polygons في النماذج
- استخدم textures محسّنة (512x512 أو 1024x1024)
- النماذج يتم تحميلها مرة واحدة وتخزينها في cache

## ملاحظات

- إذا لم يكن هناك نموذج لنوع أثاث معين، سيتم استخدام شكل بسيط (box) كبديل
- النماذج يتم تحجيمها تلقائياً لتناسب الأبعاد المحددة
- تأكد من أن النماذج متوافقة مع Three.js و react-three-fiber

