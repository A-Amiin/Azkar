# أذكار الصباح والمساء

تطبيق عربي لقراءة ومتابعة أذكار الصباح والمساء.

## التشغيل محليًا

```bash
npm install
npm run dev
```

بيانات الأذكار مصدرها الوحيد `data/azkar.json`، وتُقرأ عبر الدوال المكتوبة في
`data/azkar.ts` (`getMorningAzkar`، `getEveningAzkar`، `getAzkarByPeriod`،
`getDhikrById`). يتم استيراد الملف مباشرةً أثناء البناء (build time) عبر
`resolveJsonModule`، فلا حاجة لأي طلب شبكة وقت التشغيل، وتبقى الأذكار متاحة
حتى بدون اتصال بالإنترنت. راجع `ARCHITECTURE.md` لتفاصيل معمارية التطبيق
الكاملة.
