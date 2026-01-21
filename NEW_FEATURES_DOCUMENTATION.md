# 📚 توثيق الميزات الجديدة

## نظام التوصيات الذكي والحفظ والاستعادة

تم إضافة نظامين متقدمين إلى منصة CyberShield:

---

## 1️⃣ نظام التوصيات الذكي (Recommendations Engine)

### الملف: `recommendations-engine.js`

#### الوصف
نظام متقدم يقدم اقتراحات ذكية لتحسين الكود والأمان بناءً على:
- الثغرات الأمنية المكتشفة
- الأنماط المكررة في الكود
- أفضل الممارسات البرمجية
- مستوى خبرة المستخدم

#### الميزات الرئيسية

##### 1. التحليل الذكي المتعدد المستويات
```javascript
const recommendations = engine.analyzeAndRecommend(code, vulnerabilities);
```

يقوم بـ:
- تحليل الثغرات الأمنية وإنشاء توصيات مرتبطة
- تحليل الأداء والكشف عن الاختناقات
- تحليل الممارسات الجيدة والمعايير

##### 2. قواعد التوصيات المتقدمة

**قواعس الأمان:**
- استخدام استعلامات معاملة (SQL Injection Prevention)
- تنظيف مدخلات المستخدم (XSS Prevention)
- استخدام HTTPS
- التحقق من صحة المدخلات

**قواعس الأداء:**
- تجنب الحلقات المتداخلة
- استخدام const/let بدلاً من var
- Lazy Loading للموارد

**قواعس الممارسات الجيدة:**
- إضافة التعليقات التوضيحية
- معالجة الأخطاء
- استخدام الثوابت

##### 3. التوصيات المخصصة حسب مستوى المستخدم
```javascript
// للمبتدئين - التوصيات المهمة فقط
const recommendations = engine.getPersonalizedRecommendations('beginner');

// للمتقدمين - جميع التوصيات
const recommendations = engine.getPersonalizedRecommendations('advanced');
```

##### 4. الإحصائيات والتقارير
```javascript
const stats = engine.getRecommendationStats();
// {
//   total: 15,
//   bySeverity: { critical: 2, high: 5, medium: 6, low: 2 },
//   byType: { security: 8, performance: 4, bestPractices: 3 },
//   topRecommendations: [...]
// }
```

##### 5. تصدير التقارير
```javascript
const report = engine.exportRecommendationsReport();
// يحتوي على:
// - جميع التوصيات
// - الإحصائيات
// - سجل التحليلات السابقة
```

#### الاستخدام الأساسي

```javascript
// إنشاء محرك التوصيات
const recommendationsEngine = new RecommendationsEngine();

// تحليل الكود
const code = `
  const query = "SELECT * FROM users WHERE id = " + userId;
  db.execute(query);
`;

const vulnerabilities = [{
  type: 'sql_injection',
  line: 1
}];

// الحصول على التوصيات
const recommendations = recommendationsEngine.analyzeAndRecommend(code, vulnerabilities);

// عرض أفضل 10 توصيات
const topRecommendations = recommendationsEngine.getPersonalizedRecommendations('intermediate');

// تصدير التقرير
const report = recommendationsEngine.exportRecommendationsReport();
```

---

## 2️⃣ نظام حفظ واستعادة المشاريع (Project Manager)

### الملف: `project-manager.js`

#### الوصف
نظام متكامل لإدارة المشاريع يستخدم IndexedDB لتخزين البيانات محلياً مع:
- إنشاء وحفظ المشاريع
- تتبع التغييرات والسجلات
- النسخ الاحتياطية التلقائية
- الاستيراد والتصدير

#### الميزات الرئيسية

##### 1. إدارة المشاريع الكاملة

**إنشاء مشروع جديد:**
```javascript
const projectManager = new ProjectManager();
const project = await projectManager.createProject({
  name: 'مشروعي الأول',
  description: 'وصف المشروع',
  code: 'const x = 10;',
  language: 'javascript',
  author: 'أحمد'
});
```

**تحميل مشروع:**
```javascript
const project = await projectManager.loadProject(projectId);
```

**حفظ المشروع:**
```javascript
await projectManager.saveProject();
```

**الحصول على جميع المشاريع:**
```javascript
const allProjects = await projectManager.getAllProjects();
```

**حذف مشروع:**
```javascript
await projectManager.deleteProject(projectId);
```

##### 2. سجل التغييرات (Change History)

**إضافة تغيير:**
```javascript
await projectManager.addChange('save', 'تم حفظ المشروع', projectId);
```

**الحصول على السجل:**
```javascript
const history = await projectManager.getProjectHistory(projectId);
// يحتوي على:
// - نوع التغيير (create, save, update, analyze, fix)
// - الوصف
// - الطابع الزمني
// - لقطة من الكود
```

##### 3. النسخ الاحتياطية

**إنشاء نسخة احتياطية:**
```javascript
await projectManager.createBackup();
```

**الحصول على النسخ الاحتياطية:**
```javascript
const backups = await projectManager.getProjectBackups(projectId);
```

**استعادة من نسخة احتياطية:**
```javascript
const restoredProject = await projectManager.restoreFromBackup(backupId);
```

##### 4. الاستيراد والتصدير

**تصدير مشروع كملف JSON:**
```javascript
projectManager.exportProjectAsJSON(projectId);
// يحمل ملف JSON يحتوي على بيانات المشروع كاملة
```

**استيراد مشروع من ملف:**
```javascript
const fileInput = document.getElementById('file-input');
const newProject = await projectManager.importProjectFromJSON(fileInput.files[0]);
```

##### 5. الإحصائيات

**الحصول على إحصائيات المشروع:**
```javascript
const stats = await projectManager.getProjectStats(projectId);
// {
//   projectId: 1,
//   totalChanges: 15,
//   changesByType: { save: 10, analyze: 3, fix: 2 },
//   totalBackups: 5,
//   lastModified: '2026-01-14T...',
//   codeLength: 2500,
//   linesOfCode: 85
// }
```

#### الاستخدام الأساسي

```javascript
// إنشاء مدير المشاريع
const projectManager = new ProjectManager();
await projectManager.initDatabase();

// إنشاء مشروع
const project = await projectManager.createProject({
  name: 'تطبيقي الأول',
  code: 'const app = new App();'
});

// حفظ المشروع
await projectManager.saveProject(project);

// إنشاء نسخة احتياطية
await projectManager.createBackup();

// الحصول على السجل
const history = await projectManager.getProjectHistory(project.id);

// تصدير المشروع
projectManager.exportProjectAsJSON(project.id);
```

---

## 3️⃣ طبقة التكامل (Integration Layer)

### الملف: `integration-layer.js`

#### الوصف
طبقة وسيطة تربط بين جميع الأنظمة وتوفر واجهة موحدة للتطبيق الرئيسي.

#### الميزات الرئيسية

##### 1. التحليل الشامل مع التوصيات

```javascript
const result = await integrationLayer.analyzeCodeWithRecommendations(code, 'اسم المشروع');
// {
//   project: { ... },
//   vulnerabilities: { ... },
//   recommendations: [ ... ],
//   stats: {
//     codeLength: 2500,
//     linesOfCode: 85,
//     vulnerabilityCount: 3,
//     recommendationCount: 8,
//     riskLevel: 'high'
//   }
// }
```

##### 2. الإصلاح والحفظ التلقائي

```javascript
const fixResult = await integrationLayer.fixCodeAndSave(code, vulnerabilities);
// يقوم بـ:
// 1. إصلاح الكود
// 2. تحديث المشروع الحالي
// 3. حفظ المشروع
// 4. إضافة تغيير للسجل
// 5. إنشاء نسخة احتياطية تلقائية
```

##### 3. التقارير الشاملة

**إنشاء تقرير شامل:**
```javascript
const report = await integrationLayer.generateComprehensiveReport(projectId);
// يحتوي على:
// - معلومات المشروع
// - نتائج التحليل
// - الإحصائيات
// - سجل التغييرات
// - التوصيات
```

**تصدير التقرير:**
```javascript
// كملف JSON
await integrationLayer.exportReportAsJSON(projectId);

// كملف HTML
await integrationLayer.exportReportAsHTML(projectId);
```

#### الاستخدام الكامل

```javascript
// الانتظار حتى تتم التهيئة
await integrationLayer.init();

// تحليل الكود
const analysis = await integrationLayer.analyzeCodeWithRecommendations(code, 'مشروعي');

// الحصول على التوصيات المخصصة
const recommendations = integrationLayer.getPersonalizedRecommendations('intermediate');

// إصلاح الكود
const fixResult = await integrationLayer.fixCodeAndSave(code, analysis.vulnerabilities.vulnerabilities);

// الحصول على سجل التغييرات
const history = await integrationLayer.getProjectHistory(analysis.project.id);

// إنشاء نسخة احتياطية
await integrationLayer.createBackup();

// تصدير التقرير
await integrationLayer.exportReportAsHTML(analysis.project.id);
```

---

## 🔧 التكامل مع التطبيق الرئيسي

### إضافة الملفات إلى HTML

```html
<!-- نظام التوصيات -->
<script src="recommendations-engine.js"></script>

<!-- نظام المشاريع -->
<script src="project-manager.js"></script>

<!-- طبقة التكامل -->
<script src="integration-layer.js"></script>
```

### استخدام في app.js

```javascript
// بعد تحميل التطبيق
async function initializeNewSystems() {
  // الانتظار حتى تتم التهيئة
  await integrationLayer.init();
  
  // ربط الأحداث
  document.getElementById('analyze-btn').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value;
    const result = await integrationLayer.analyzeCodeWithRecommendations(code);
    
    // عرض النتائج
    displayResults(result);
  });
}

// استدعاء عند تحميل الصفحة
window.addEventListener('load', initializeNewSystems);
```

---

## 📊 أمثلة الاستخدام المتقدمة

### مثال 1: تحليل شامل مع تقرير

```javascript
async function analyzeAndGenerateReport(code, projectName) {
  // تحليل الكود
  const analysis = await integrationLayer.analyzeCodeWithRecommendations(code, projectName);
  
  // إذا كانت هناك ثغرات، قم بالإصلاح
  if (analysis.vulnerabilities.vulnerabilities.length > 0) {
    const fixResult = await integrationLayer.fixCodeAndSave(
      code,
      analysis.vulnerabilities.vulnerabilities
    );
    
    console.log('تم إصلاح الكود:', fixResult.changes.length, 'تغيير');
  }
  
  // إنشاء نسخة احتياطية
  await integrationLayer.createBackup();
  
  // تصدير التقرير
  const report = await integrationLayer.exportReportAsHTML(analysis.project.id);
  
  return report;
}
```

### مثال 2: إدارة المشاريع

```javascript
async function manageProjects() {
  // الحصول على جميع المشاريع
  const projects = await integrationLayer.getAllProjects();
  
  // عرض المشاريع
  projects.forEach(project => {
    console.log(`${project.name} - ${project.updatedAt}`);
  });
  
  // تحميل مشروع معين
  const project = await integrationLayer.loadProject(projects[0].id);
  
  // الحصول على السجل
  const history = await integrationLayer.getProjectHistory(project.id);
  
  // الحصول على النسخ الاحتياطية
  const backups = await integrationLayer.getBackups(project.id);
  
  // استعادة من نسخة احتياطية
  if (backups.length > 0) {
    await integrationLayer.restoreBackup(backups[0].id);
  }
}
```

### مثال 3: التوصيات المخصصة

```javascript
async function displayPersonalizedRecommendations(userLevel) {
  // الحصول على التوصيات
  const recommendations = integrationLayer.getPersonalizedRecommendations(userLevel);
  
  // الحصول على الإحصائيات
  const stats = integrationLayer.getRecommendationStats();
  
  // عرض النتائج
  console.log(`إجمالي التوصيات: ${stats.total}`);
  console.log(`حسب الخطورة:`, stats.bySeverity);
  console.log(`حسب النوع:`, stats.byType);
  
  // عرض أفضل التوصيات
  recommendations.forEach(rec => {
    console.log(`${rec.title} - ${rec.impact}`);
  });
}
```

---

## 🎯 الفوائد الرئيسية

✅ **تحسين الأمان**: توصيات ذكية لمنع الثغرات الشائعة

✅ **تحسين الأداء**: كشف الاختناقات والحلقات المتداخلة

✅ **إدارة المشاريع**: حفظ واستعادة سهلة مع سجل التغييرات

✅ **النسخ الاحتياطية التلقائية**: حماية من فقدان البيانات

✅ **التقارير الشاملة**: تقارير مفصلة بصيغ متعددة

✅ **التخصيص**: توصيات مخصصة حسب مستوى المستخدم

---

## 📝 الملاحظات المهمة

1. **IndexedDB**: يتطلب متصفح حديث يدعم IndexedDB
2. **التخزين المحلي**: جميع البيانات تُخزن محلياً على جهاز المستخدم
3. **الأداء**: قد تستغرق العمليات الكبيرة بعض الوقت
4. **النسخ الاحتياطية**: يُنصح بإنشاء نسخ احتياطية دورية

---

## 🚀 الخطوات التالية

- [ ] دمج نماذج TensorFlow.js الحقيقية
- [ ] إضافة واجهة مستخدم متقدمة للتقارير
- [ ] دعم التعاون بين المطورين
- [ ] إضافة المزيد من قواعس التوصيات
- [ ] تحسين الأداء والتحسينات

---

**تم التحديث**: 14 يناير 2026
**الإصدار**: 2.0.0
