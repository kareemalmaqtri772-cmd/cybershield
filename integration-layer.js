/**
 * 🔗 طبقة التكامل
 * تربط بين نظام التوصيات الذكي ونظام حفظ واستعادة المشاريع مع التطبيق الرئيسي
 */

class IntegrationLayer {
  constructor() {
    this.aiEngine = null;
    this.projectManager = null;
    this.recommendationsEngine = null;
    this.isInitialized = false;

    this.init();
  }

  /**
   * تهيئة جميع الأنظمة
   */
  async init() {
    try {
      console.log('🔗 جاري تهيئة طبقة التكامل...');

      // تهيئة مدير المشاريع
      this.projectManager = new ProjectManager();
      await this.projectManager.initDatabase();
      console.log('✅ تم تهيئة مدير المشاريع');

      // تهيئة محرك التوصيات
      this.recommendationsEngine = new RecommendationsEngine();
      console.log('✅ تم تهيئة محرك التوصيات');

      this.isInitialized = true;
      console.log('✅ اكتملت تهيئة طبقة التكامل');
    } catch (error) {
      console.error('❌ فشل تهيئة طبقة التكامل:', error);
    }
  }

  /**
   * فحص الكود وإنشاء توصيات
   */
  async analyzeCodeWithRecommendations(code, projectName = 'تحليل سريع') {
    if (!this.isInitialized) {
      console.error('طبقة التكامل لم تتم تهيئتها بعد');
      return null;
    }

    try {
      // 1. فحص الكود باستخدام محرك الذكاء الاصطناعي
      const vulnerabilities = await this.aiEngine.models.vulnerabilityDetector.predict(code);

      // 2. إنشاء توصيات ذكية
      const recommendations = this.recommendationsEngine.analyzeAndRecommend(
        code,
        vulnerabilities.vulnerabilities
      );

      // 3. إنشاء مشروع جديد وحفظه
      const project = await this.projectManager.createProject({
        name: projectName,
        code: code,
        language: 'javascript',
        description: `تحليل تم إنشاؤه في ${new Date().toLocaleString('ar-EG')}`
      });

      // 4. تحديث بيانات المشروع بنتائج التحليل
      project.metadata.lastAnalysis = new Date().toISOString();
      project.metadata.vulnerabilitiesCount = vulnerabilities.vulnerabilities.length;
      project.metadata.recommendationsCount = recommendations.length;

      await this.projectManager.saveProject(project);

      // 5. إضافة تغيير للسجل
      await this.projectManager.addChange(
        'analyze',
        `تم تحليل الكود: ${vulnerabilities.vulnerabilities.length} ثغرة، ${recommendations.length} توصية`,
        project.id
      );

      return {
        project: project,
        vulnerabilities: vulnerabilities,
        recommendations: recommendations,
        stats: {
          codeLength: code.length,
          linesOfCode: code.split('\n').length,
          vulnerabilityCount: vulnerabilities.vulnerabilities.length,
          recommendationCount: recommendations.length,
          riskLevel: vulnerabilities.riskLevel
        }
      };
    } catch (error) {
      console.error('❌ فشل التحليل:', error);
      return null;
    }
  }

  /**
   * إصلاح الكود وحفظ النتيجة
   */
  async fixCodeAndSave(code, vulnerabilities) {
    if (!this.projectManager.currentProject) {
      console.error('لا يوجد مشروع حالي');
      return null;
    }

    try {
      // 1. إصلاح الكود
      const repairResult = await this.aiEngine.models.codeRepair.repair(code, vulnerabilities);

      // 2. تحديث الكود في المشروع الحالي
      this.projectManager.currentProject.code = repairResult.repaired;

      // 3. حفظ المشروع
      await this.projectManager.saveProject();

      // 4. إضافة تغيير للسجل
      await this.projectManager.addChange(
        'fix',
        `تم إصلاح ${repairResult.changes.length} مشكلة`,
        this.projectManager.currentProject.id
      );

      // 5. إنشاء نسخة احتياطية
      await this.projectManager.createBackup();

      return {
        original: code,
        repaired: repairResult.repaired,
        changes: repairResult.changes,
        improvements: repairResult.improvements,
        confidence: repairResult.confidence
      };
    } catch (error) {
      console.error('❌ فشل الإصلاح:', error);
      return null;
    }
  }

  /**
   * الحصول على توصيات مخصصة للمستخدم الحالي
   */
  getPersonalizedRecommendations(userLevel = 'intermediate') {
    return this.recommendationsEngine.getPersonalizedRecommendations(userLevel);
  }

  /**
   * الحصول على إحصائيات التوصيات
   */
  getRecommendationStats() {
    return this.recommendationsEngine.getRecommendationStats();
  }

  /**
   * إنشاء مشروع جديد
   */
  async createNewProject(projectData) {
    return await this.projectManager.createProject(projectData);
  }

  /**
   * تحميل مشروع
   */
  async loadProject(projectId) {
    return await this.projectManager.loadProject(projectId);
  }

  /**
   * الحصول على جميع المشاريع
   */
  async getAllProjects() {
    return await this.projectManager.getAllProjects();
  }

  /**
   * حفظ المشروع الحالي
   */
  async saveCurrentProject() {
    return await this.projectManager.saveProject();
  }

  /**
   * حذف مشروع
   */
  async deleteProject(projectId) {
    return await this.projectManager.deleteProject(projectId);
  }

  /**
   * الحصول على سجل التغييرات
   */
  async getProjectHistory(projectId) {
    return await this.projectManager.getProjectHistory(projectId);
  }

  /**
   * إنشاء نسخة احتياطية
   */
  async createBackup() {
    return await this.projectManager.createBackup();
  }

  /**
   * الحصول على النسخ الاحتياطية
   */
  async getBackups(projectId) {
    return await this.projectManager.getProjectBackups(projectId);
  }

  /**
   * استعادة من نسخة احتياطية
   */
  async restoreBackup(backupId) {
    return await this.projectManager.restoreFromBackup(backupId);
  }

  /**
   * تصدير مشروع
   */
  exportProject(projectId = null) {
    return this.projectManager.exportProjectAsJSON(projectId);
  }

  /**
   * استيراد مشروع
   */
  async importProject(file) {
    return await this.projectManager.importProjectFromJSON(file);
  }

  /**
   * الحصول على إحصائيات المشروع
   */
  async getProjectStats(projectId = null) {
    return await this.projectManager.getProjectStats(projectId);
  }

  /**
   * تصدير تقرير شامل
   */
  async generateComprehensiveReport(projectId = null) {
    const project = projectId ? 
      await this.projectManager.loadProject(projectId) :
      this.projectManager.currentProject;

    if (!project) {
      console.error('لا يوجد مشروع');
      return null;
    }

    const history = await this.projectManager.getProjectHistory(project.id);
    const backups = await this.projectManager.getProjectBackups(project.id);
    const stats = await this.projectManager.getProjectStats(project.id);

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        language: project.language,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        status: project.status
      },
      analysis: project.metadata,
      statistics: stats,
      changeHistory: history,
      backups: backups,
      recommendations: this.recommendationsEngine.recommendations,
      recommendationStats: this.getRecommendationStats(),
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * تصدير التقرير كملف JSON
   */
  async exportReportAsJSON(projectId = null) {
    const report = await this.generateComprehensiveReport(projectId);

    if (!report) {
      console.error('فشل إنشاء التقرير');
      return null;
    }

    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-${report.project.name}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return report;
  }

  /**
   * تصدير التقرير كملف HTML
   */
  async exportReportAsHTML(projectId = null) {
    const report = await this.generateComprehensiveReport(projectId);

    if (!report) {
      console.error('فشل إنشاء التقرير');
      return null;
    }

    const html = this.generateHTMLReport(report);
    const dataBlob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-${report.project.name}-${new Date().getTime()}.html`;
    link.click();
    URL.revokeObjectURL(url);

    return html;
  }

  /**
   * إنشاء تقرير HTML
   */
  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير ${report.project.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans Arabic', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 1000px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; margin-bottom: 10px; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 30px; margin-bottom: 15px; }
    .section { margin-bottom: 30px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border-right: 4px solid #007bff; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .recommendation { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 5px; border-right: 4px solid #ffc107; }
    .recommendation-title { font-weight: bold; color: #856404; }
    .recommendation-desc { color: #856404; font-size: 14px; margin-top: 5px; }
    .vulnerability { background: #f8d7da; padding: 15px; margin: 10px 0; border-radius: 5px; border-right: 4px solid #dc3545; }
    .vulnerability-title { font-weight: bold; color: #721c24; }
    .vulnerability-desc { color: #721c24; font-size: 14px; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th { background: #007bff; color: white; padding: 10px; text-align: right; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    tr:hover { background: #f5f5f5; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 تقرير تحليل الأمان والأداء</h1>
    
    <div class="section">
      <h2>معلومات المشروع</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">اسم المشروع</div>
          <div class="stat-value">${report.project.name}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">اللغة</div>
          <div class="stat-value">${report.project.language}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">الحالة</div>
          <div class="stat-value">${report.project.status}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">تاريخ التحديث</div>
          <div class="stat-value">${new Date(report.project.updatedAt).toLocaleDateString('ar-EG')}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📈 الإحصائيات</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">عدد الأسطر</div>
          <div class="stat-value">${report.statistics.linesOfCode}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">عدد الثغرات</div>
          <div class="stat-value">${report.analysis.vulnerabilitiesCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">عدد التوصيات</div>
          <div class="stat-value">${report.analysis.recommendationsCount}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">عدد التغييرات</div>
          <div class="stat-value">${report.statistics.totalChanges}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>🎯 التوصيات الذكية</h2>
      ${report.recommendations.slice(0, 10).map(rec => `
        <div class="recommendation">
          <div class="recommendation-title">${rec.title}</div>
          <div class="recommendation-desc">${rec.description}</div>
          <small>الأثر: ${rec.impact}</small>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2>📝 سجل التغييرات</h2>
      <table>
        <thead>
          <tr>
            <th>النوع</th>
            <th>الوصف</th>
            <th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          ${report.changeHistory.slice(0, 10).map(change => `
            <tr>
              <td>${change.type}</td>
              <td>${change.description}</td>
              <td>${new Date(change.timestamp).toLocaleString('ar-EG')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="footer">
      <p>تم إنشاء هذا التقرير بواسطة CyberShield AI</p>
      <p>${new Date().toLocaleString('ar-EG')}</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

// إنشاء مثيل من طبقة التكامل
const integrationLayer = new IntegrationLayer();

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IntegrationLayer;
}
