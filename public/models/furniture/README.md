# مكتبة نماذج الأثاث

هذا المجلد يحتوي على نماذج 3D للأثاث المستخدمة في المخططات ثلاثية الأبعاد.

## الهيكل

```
furniture/
├── README.md (هذا الملف)
├── primitives/      # نماذج بدائية (اختياري - للأشكال البسيطة)
└── advanced/        # نماذج 3D عالية الجودة (GLB/GLTF)
```

## النماذج الحالية

النماذج الموجودة حالياً:
- `sofa.glb` - أريكة
- `bed.glb` - سرير
- `chair.glb` - كرسي

## إضافة نماذج جديدة

1. قم بتنزيل نموذج 3D بصيغة GLB أو GLTF
2. ضع الملف في مجلد `advanced/`
3. سجّل النموذج في `resources/js/lib/floorplan3d/modelLoader.ts`:
   ```typescript
   export const FURNITURE_MODELS: Record<string, string> = {
     'نوع_الأثاث': '/models/furniture/advanced/اسم_الملف.glb',
   };
   ```

## مصادر نماذج مجانية

- **Poly Haven**: https://polyhaven.com/models (CC0 مجانية تماماً)
- **Sketchfab**: https://sketchfab.com (ابحث عن Free Download)
- **Free3D**: https://free3d.com
- **Kenney Assets**: https://kenney.nl/assets (Low-poly)

## استخدام سكريبت التنزيل

قم بتشغيل السكريبت المساعد:
```powershell
.\download-furniture-library.ps1
```

## ملاحظات

- تأكد من أن النماذج بصيغة GLB (موصى به) أو GLTF
- تحقق من التراخيص قبل الاستخدام التجاري
- استخدم Blender لتحويل النماذج إلى GLB إذا لزم الأمر
- النماذج الكبيرة قد تبطئ التحميل - استهدف حجم أقل من 2MB لكل نموذج

## النظام التلقائي

إذا لم يكن هناك نموذج 3D لنوع معين من الأثاث، سيقوم النظام تلقائياً باستخدام:
- **أشكال بدائية محسّنة** - أشكال ثلاثية الأبعاد بسيطة لكنها محسّنة لكل نوع أثاث

راجع `PRIMITIVE_FURNITURE_GUIDE.md` لمزيد من المعلومات.
