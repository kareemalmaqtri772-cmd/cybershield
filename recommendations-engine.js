/**
 * 🎯 نظام التوصيات الذكي
 * يقدم اقتراحات ذكية لتحسين الكود والأمان بناءً على الثغرات المكتشفة والأنماط المكررة
 */

class RecommendationsEngine {
  constructor() {
    this.recommendations = [];
    this.vulnerabilityPatterns = new Map();
    this.userPreferences = this.loadUserPreferences();
    this.recommendationHistory = [];
    
    this.initializeRecommendationRules();
  }

  /**
   * تهيئة قواعد التوصيات الذكية
   */
  initializeRecommendationRules() {
    this.rules = {
      // قواعد الأمان الأساسية
      security: [
        {
          id: 'use_parameterized_queries',
          pattern: /(\$sql|query)\s*=\s*["'].*?\+.*?["']/,
          severity: 'high',
          recommendation: 'استخدم استعلامات معاملة (Parameterized Queries) بدلاً من دمج المتغيرات مباشرة',
          impact: 'منع هجمات SQL Injection',
          codeExample: `// ❌ غير آمن
const query = "SELECT * FROM users WHERE id = " + userId;

// ✅ آمن
const query = "SELECT * FROM users WHERE id = ?";
db.execute(query, [userId]);`
        },
        {
          id: 'sanitize_user_input',
          pattern: /\.innerHTML\s*=|document\.write\(|eval\(/,
          severity: 'critical',
          recommendation: 'قم بتنظيف مدخلات المستخدم (Sanitization) قبل عرضها',
          impact: 'منع هجمات XSS (Cross-Site Scripting)',
          codeExample: `// ❌ غير آمن
element.innerHTML = userInput;

// ✅ آمن
element.textContent = userInput;
// أو استخدم مكتبة مثل DOMPurify`
        },
        {
          id: 'use_https',
          pattern: /http:\/\/(?!localhost)/,
          severity: 'high',
          recommendation: 'استخدم HTTPS بدلاً من HTTP لتشفير البيانات أثناء النقل',
          impact: 'حماية البيانات من الاعتراض (Man-in-the-Middle)',
          codeExample: `// ❌ غير آمن
fetch('http://api.example.com/data');

// ✅ آمن
fetch('https://api.example.com/data');`
        },
        {
          id: 'validate_input',
          pattern: /(\$_(GET|POST|REQUEST)|req\.body|req\.query)(?!.*validate|.*check|.*sanitize)/,
          severity: 'high',
          recommendation: 'تحقق من صحة جميع مدخلات المستخدم قبل معالجتها',
          impact: 'منع البيانات غير الصحيحة والهجمات',
          codeExample: `// ❌ غير آمن
const email = req.body.email;

// ✅ آمن
const email = req.body.email;
if (!isValidEmail(email)) {
  throw new Error('البريد الإلكتروني غير صحيح');
}`
        }
      ],

      // قواعس الأداء
      performance: [
        {
          id: 'avoid_nested_loops',
          pattern: /for\s*\(.*?\)\s*{[\s\S]*?for\s*\(/,
          severity: 'medium',
          recommendation: 'تجنب الحلقات المتداخلة (Nested Loops) - قد تؤثر على الأداء',
          impact: 'تحسين سرعة التنفيذ',
          codeExample: `// ❌ أداء ضعيف - O(n²)
for (let i = 0; i < array1.length; i++) {
  for (let j = 0; j < array2.length; j++) {
    // معالجة
  }
}

// ✅ أداء أفضل - O(n)
const map = new Map(array2.map(item => [item.id, item]));
for (let item of array1) {
  const match = map.get(item.id);
}`
        },
        {
          id: 'use_const_let',
          pattern: /var\s+\w+\s*=/,
          severity: 'low',
          recommendation: 'استخدم const أو let بدلاً من var لتجنب مشاكل الـ Scope',
          impact: 'كود أكثر أماناً وسهولة في الصيانة',
          codeExample: `// ❌ قديم
var count = 0;

// ✅ حديث
const MAX_COUNT = 10;
let count = 0;`
        },
        {
          id: 'lazy_loading',
          pattern: /load.*?all|fetch.*?everything|import.*?\*/,
          severity: 'medium',
          recommendation: 'استخدم Lazy Loading لتحميل الموارد عند الحاجة فقط',
          impact: 'تحسين سرعة التحميل الأولي',
          codeExample: `// ❌ تحميل كل شيء مسبقاً
import * as utils from './utils';

// ✅ تحميل عند الحاجة
const utils = await import('./utils');`
        }
      ],

      // قواعد الممارسات الجيدة
      bestPractices: [
        {
          id: 'add_comments',
          pattern: /function\s+\w+\s*\([^)]*\)\s*{(?![\s\S]{0,100}\/\/)/,
          severity: 'low',
          recommendation: 'أضف تعليقات توضيحية للدوال المعقدة',
          impact: 'تحسين قابلية الصيانة والفهم',
          codeExample: `// ✅ مع تعليقات
/**
 * حساب مجموع الأرقام
 * @param {number[]} numbers - مصفوفة الأرقام
 * @returns {number} مجموع الأرقام
 */
function sum(numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}`
        },
        {
          id: 'error_handling',
          pattern: /async\s+function|\.then\(|await/,
          severity: 'medium',
          recommendation: 'أضف معالجة الأخطاء (Error Handling) للعمليات غير المتزامنة',
          impact: 'تطبيق أكثر استقراراً',
          codeExample: `// ❌ بدون معالجة أخطاء
const data = await fetch(url);

// ✅ مع معالجة أخطاء
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error('فشل الطلب');
  const data = await response.json();
} catch (error) {
  console.error('خطأ:', error);
}`
        },
        {
          id: 'use_constants',
          pattern: /["']\d+["']|["'][A-Z_]+["']/,
          severity: 'low',
          recommendation: 'استخدم ثوابت (Constants) للقيم الثابتة بدلاً من الأرقام المباشرة',
          impact: 'كود أسهل في الصيانة والتعديل',
          codeExample: `// ❌ أرقام سحرية
if (age > 18) { /* ... */ }

// ✅ استخدام ثوابت
const MIN_ADULT_AGE = 18;
if (age > MIN_ADULT_AGE) { /* ... */ }`
        }
      ]
    };
  }

  /**
   * تحليل الكود وإنشاء توصيات ذكية
   * @param {string} code - الكود المراد تحليله
   * @param {Array} vulnerabilities - قائمة الثغرات المكتشفة
   * @returns {Array} قائمة التوصيات
   */
  analyzeAndRecommend(code, vulnerabilities = []) {
    this.recommendations = [];

    // 1. تحليل الثغرات وإنشاء توصيات مرتبطة بها
    vulnerabilities.forEach(vuln => {
      this.addSecurityRecommendation(vuln, code);
    });

    // 2. تحليل الأداء
    this.analyzePerformance(code);

    // 3. تحليل الممارسات الجيدة
    this.analyzeBestPractices(code);

    // 4. ترتيب التوصيات حسب الأولوية والتأثير
    this.recommendations.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    // 5. حفظ في السجل
    this.recommendationHistory.push({
      timestamp: new Date(),
      recommendations: [...this.recommendations],
      codeLength: code.length,
      vulnerabilityCount: vulnerabilities.length
    });

    return this.recommendations;
  }

  /**
   * إضافة توصيات أمنية بناءً على الثغرات المكتشفة
   */
  addSecurityRecommendation(vulnerability, code) {
    const rule = this.rules.security.find(r => 
      r.pattern.test(code.substring(
        Math.max(0, vulnerability.line * 50 - 200),
        vulnerability.line * 50 + 200
      ))
    );

    if (rule) {
      this.recommendations.push({
        id: rule.id,
        type: 'security',
        severity: rule.severity,
        title: rule.recommendation,
        description: `تم اكتشاف هذه المشكلة في السطر ${vulnerability.line}`,
        impact: rule.impact,
        codeExample: rule.codeExample,
        relatedVulnerability: vulnerability.type,
        priority: this.calculatePriority(rule.severity, vulnerability.type)
      });
    }
  }

  /**
   * تحليل الأداء
   */
  analyzePerformance(code) {
    this.rules.performance.forEach(rule => {
      if (rule.pattern.test(code)) {
        this.recommendations.push({
          id: rule.id,
          type: 'performance',
          severity: rule.severity,
          title: rule.recommendation,
          description: 'تم اكتشاف نمط قد يؤثر على الأداء',
          impact: rule.impact,
          codeExample: rule.codeExample,
          priority: this.calculatePriority(rule.severity, 'performance')
        });
      }
    });
  }

  /**
   * تحليل الممارسات الجيدة
   */
  analyzeBestPractices(code) {
    this.rules.bestPractices.forEach(rule => {
      if (rule.pattern.test(code)) {
        this.recommendations.push({
          id: rule.id,
          type: 'bestPractices',
          severity: rule.severity,
          title: rule.recommendation,
          description: 'يمكن تحسين هذا الجزء من الكود',
          impact: rule.impact,
          codeExample: rule.codeExample,
          priority: this.calculatePriority(rule.severity, 'bestPractices')
        });
      }
    });
  }

  /**
   * حساب الأولوية بناءً على الخطورة والنوع
   */
  calculatePriority(severity, type) {
    const severityWeight = { critical: 10, high: 7, medium: 4, low: 1 };
    const typeWeight = { security: 3, performance: 2, bestPractices: 1 };
    
    return (severityWeight[severity] || 0) * (typeWeight[type] || 1);
  }

  /**
   * الحصول على توصيات مخصصة بناءً على تفضيلات المستخدم
   */
  getPersonalizedRecommendations(userLevel = 'intermediate') {
    const filtered = this.recommendations.filter(rec => {
      if (userLevel === 'beginner') {
        return rec.severity !== 'low'; // للمبتدئين، اظهر التوصيات المهمة فقط
      } else if (userLevel === 'advanced') {
        return true; // للمتقدمين، اظهر كل التوصيات
      }
      return rec.severity !== 'low' || rec.type === 'security'; // للمتوسطين
    });

    return filtered.slice(0, 10); // أعد أفضل 10 توصيات
  }

  /**
   * الحصول على إحصائيات التوصيات
   */
  getRecommendationStats() {
    const stats = {
      total: this.recommendations.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      byType: {
        security: 0,
        performance: 0,
        bestPractices: 0
      },
      topRecommendations: []
    };

    this.recommendations.forEach(rec => {
      stats.bySeverity[rec.severity]++;
      stats.byType[rec.type]++;
    });

    stats.topRecommendations = this.recommendations.slice(0, 5);

    return stats;
  }

  /**
   * حفظ تفضيلات المستخدم
   */
  saveUserPreferences(preferences) {
    this.userPreferences = preferences;
    localStorage.setItem('recommendationPreferences', JSON.stringify(preferences));
  }

  /**
   * تحميل تفضيلات المستخدم
   */
  loadUserPreferences() {
    const saved = localStorage.getItem('recommendationPreferences');
    return saved ? JSON.parse(saved) : {
      userLevel: 'intermediate',
      focusAreas: ['security', 'performance'],
      showExamples: true,
      maxRecommendations: 10
    };
  }

  /**
   * تصدير التوصيات كتقرير
   */
  exportRecommendationsReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      totalRecommendations: this.recommendations.length,
      recommendations: this.recommendations,
      statistics: this.getRecommendationStats(),
      history: this.recommendationHistory.slice(-10) // آخر 10 تحليلات
    };

    return report;
  }

  /**
   * مسح السجل
   */
  clearHistory() {
    this.recommendationHistory = [];
  }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationsEngine;
}
