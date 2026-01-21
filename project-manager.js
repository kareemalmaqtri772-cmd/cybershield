/**
 * 💾 نظام حفظ واستعادة المشاريع
 * يسمح بحفظ المشاريع محلياً (IndexedDB) مع إمكانية استعادتها وتتبع التغييرات
 */

class ProjectManager {
  constructor() {
    this.db = null;
    this.currentProject = null;
    this.projects = [];
    this.changeHistory = [];
    
    this.initDatabase();
  }

  /**
   * تهيئة قاعدة البيانات (IndexedDB)
   */
  async initDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CyberShieldDB', 1);

      request.onerror = () => {
        console.error('فشل فتح قاعدة البيانات');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ تم فتح قاعدة البيانات بنجاح');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // إنشاء جدول المشاريع
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id', autoIncrement: true });
          projectStore.createIndex('name', 'name', { unique: false });
          projectStore.createIndex('createdAt', 'createdAt', { unique: false });
          projectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // إنشاء جدول سجل التغييرات
        if (!db.objectStoreNames.contains('changes')) {
          const changeStore = db.createObjectStore('changes', { keyPath: 'id', autoIncrement: true });
          changeStore.createIndex('projectId', 'projectId', { unique: false });
          changeStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // إنشاء جدول النسخ الاحتياطية
        if (!db.objectStoreNames.contains('backups')) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'id', autoIncrement: true });
          backupStore.createIndex('projectId', 'projectId', { unique: false });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * إنشاء مشروع جديد
   */
  async createProject(projectData) {
    const project = {
      name: projectData.name || 'مشروع جديد',
      description: projectData.description || '',
      code: projectData.code || '',
      language: projectData.language || 'javascript',
      tags: projectData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft', // draft, active, completed, archived
      metadata: {
        author: projectData.author || 'مستخدم',
        version: '1.0.0',
        lastAnalysis: null,
        vulnerabilitiesCount: 0,
        recommendationsCount: 0
      },
      settings: {
        autoSave: true,
        autoAnalyze: false,
        notifyOnVulnerabilities: true
      }
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.add(project);

      request.onsuccess = () => {
        project.id = request.result;
        this.currentProject = project;
        this.addChange('create', `تم إنشاء المشروع: ${project.name}`, project.id);
        console.log(`✅ تم إنشاء المشروع: ${project.name}`);
        resolve(project);
      };

      request.onerror = () => {
        console.error('فشل إنشاء المشروع');
        reject(request.error);
      };
    });
  }

  /**
   * حفظ المشروع الحالي
   */
  async saveProject(projectData = null) {
    const projectToSave = projectData || this.currentProject;

    if (!projectToSave || !projectToSave.id) {
      console.error('لا يوجد مشروع حالي للحفظ');
      return false;
    }

    projectToSave.updatedAt = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      const request = store.put(projectToSave);

      request.onsuccess = () => {
        this.currentProject = projectToSave;
        this.addChange('save', `تم حفظ المشروع: ${projectToSave.name}`, projectToSave.id);
        console.log(`✅ تم حفظ المشروع: ${projectToSave.name}`);
        resolve(true);
      };

      request.onerror = () => {
        console.error('فشل حفظ المشروع');
        reject(request.error);
      };
    });
  }

  /**
   * تحميل مشروع من قاعدة البيانات
   */
  async loadProject(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get(projectId);

      request.onsuccess = () => {
        if (request.result) {
          this.currentProject = request.result;
          console.log(`✅ تم تحميل المشروع: ${request.result.name}`);
          resolve(request.result);
        } else {
          console.error('المشروع غير موجود');
          reject(new Error('المشروع غير موجود'));
        }
      };

      request.onerror = () => {
        console.error('فشل تحميل المشروع');
        reject(request.error);
      };
    });
  }

  /**
   * الحصول على جميع المشاريع
   */
  async getAllProjects() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.getAll();

      request.onsuccess = () => {
        this.projects = request.result.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        resolve(this.projects);
      };

      request.onerror = () => {
        console.error('فشل جلب المشاريع');
        reject(request.error);
      };
    });
  }

  /**
   * حذف مشروع
   */
  async deleteProject(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects', 'changes', 'backups'], 'readwrite');
      
      // حذف المشروع
      const projectStore = transaction.objectStore('projects');
      const deleteRequest = projectStore.delete(projectId);

      // حذف جميع التغييرات المرتبطة
      const changeStore = transaction.objectStore('changes');
      const changeIndex = changeStore.index('projectId');
      changeIndex.openCursor(IDBKeyRange.only(projectId)).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // حذف جميع النسخ الاحتياطية المرتبطة
      const backupStore = transaction.objectStore('backups');
      const backupIndex = backupStore.index('projectId');
      backupIndex.openCursor(IDBKeyRange.only(projectId)).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      deleteRequest.onsuccess = () => {
        if (this.currentProject && this.currentProject.id === projectId) {
          this.currentProject = null;
        }
        console.log('✅ تم حذف المشروع');
        resolve(true);
      };

      deleteRequest.onerror = () => {
        console.error('فشل حذف المشروع');
        reject(deleteRequest.error);
      };
    });
  }

  /**
   * إضافة تغيير إلى سجل التغييرات
   */
  async addChange(changeType, description, projectId) {
    const change = {
      projectId: projectId || (this.currentProject ? this.currentProject.id : null),
      type: changeType, // create, save, update, delete, analyze, fix
      description: description,
      timestamp: new Date().toISOString(),
      codeSnapshot: this.currentProject ? this.currentProject.code : null
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['changes'], 'readwrite');
      const store = transaction.objectStore('changes');
      const request = store.add(change);

      request.onsuccess = () => {
        this.changeHistory.push(change);
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('فشل إضافة التغيير');
        reject(request.error);
      };
    });
  }

  /**
   * الحصول على سجل التغييرات لمشروع معين
   */
  async getProjectHistory(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['changes'], 'readonly');
      const store = transaction.objectStore('changes');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const history = request.result.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        resolve(history);
      };

      request.onerror = () => {
        console.error('فشل جلب السجل');
        reject(request.error);
      };
    });
  }

  /**
   * إنشاء نسخة احتياطية من المشروع
   */
  async createBackup(projectId = null) {
    const id = projectId || (this.currentProject ? this.currentProject.id : null);

    if (!id) {
      console.error('لا يوجد مشروع لإنشاء نسخة احتياطية منه');
      return false;
    }

    const backup = {
      projectId: id,
      projectData: this.currentProject,
      timestamp: new Date().toISOString(),
      label: `نسخة احتياطية - ${new Date().toLocaleString('ar-EG')}`
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['backups'], 'readwrite');
      const store = transaction.objectStore('backups');
      const request = store.add(backup);

      request.onsuccess = () => {
        console.log('✅ تم إنشاء نسخة احتياطية');
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('فشل إنشاء النسخة الاحتياطية');
        reject(request.error);
      };
    });
  }

  /**
   * الحصول على النسخ الاحتياطية لمشروع معين
   */
  async getProjectBackups(projectId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['backups'], 'readonly');
      const store = transaction.objectStore('backups');
      const index = store.index('projectId');
      const request = index.getAll(projectId);

      request.onsuccess = () => {
        const backups = request.result.sort((a, b) => 
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        resolve(backups);
      };

      request.onerror = () => {
        console.error('فشل جلب النسخ الاحتياطية');
        reject(request.error);
      };
    });
  }

  /**
   * استعادة مشروع من نسخة احتياطية
   */
  async restoreFromBackup(backupId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['backups'], 'readonly');
      const store = transaction.objectStore('backups');
      const request = store.get(backupId);

      request.onsuccess = () => {
        if (request.result) {
          const backup = request.result;
          this.currentProject = backup.projectData;
          this.addChange('restore', `تم استعادة المشروع من نسخة احتياطية`, backup.projectId);
          console.log('✅ تم استعادة المشروع من النسخة الاحتياطية');
          resolve(backup.projectData);
        } else {
          console.error('النسخة الاحتياطية غير موجودة');
          reject(new Error('النسخة الاحتياطية غير موجودة'));
        }
      };

      request.onerror = () => {
        console.error('فشل استعادة النسخة الاحتياطية');
        reject(request.error);
      };
    });
  }

  /**
   * تصدير مشروع كملف JSON
   */
  exportProjectAsJSON(projectId = null) {
    const project = projectId ? 
      this.projects.find(p => p.id === projectId) : 
      this.currentProject;

    if (!project) {
      console.error('المشروع غير موجود');
      return null;
    }

    const dataStr = JSON.stringify(project, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return dataStr;
  }

  /**
   * استيراد مشروع من ملف JSON
   */
  async importProjectFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const projectData = JSON.parse(event.target.result);
          delete projectData.id; // حذف المعرف القديم لإنشاء معرف جديد
          
          const newProject = await this.createProject(projectData);
          console.log('✅ تم استيراد المشروع بنجاح');
          resolve(newProject);
        } catch (error) {
          console.error('فشل استيراد المشروع:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        console.error('فشل قراءة الملف');
        reject(reader.error);
      };

      reader.readAsText(file);
    });
  }

  /**
   * الحصول على إحصائيات المشروع
   */
  async getProjectStats(projectId = null) {
    const id = projectId || (this.currentProject ? this.currentProject.id : null);

    if (!id) {
      console.error('لا يوجد مشروع');
      return null;
    }

    const history = await this.getProjectHistory(id);
    const backups = await this.getProjectBackups(id);

    return {
      projectId: id,
      totalChanges: history.length,
      changesByType: this.groupBy(history, 'type'),
      totalBackups: backups.length,
      lastModified: this.currentProject.updatedAt,
      codeLength: this.currentProject.code.length,
      linesOfCode: this.currentProject.code.split('\n').length
    };
  }

  /**
   * دالة مساعدة لتجميع البيانات
   */
  groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = (result[group] || 0) + 1;
      return result;
    }, {});
  }

  /**
   * مسح جميع البيانات (استخدم بحذر!)
   */
  async clearAllData() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects', 'changes', 'backups'], 'readwrite');
      
      transaction.objectStore('projects').clear();
      transaction.objectStore('changes').clear();
      transaction.objectStore('backups').clear();

      transaction.oncomplete = () => {
        this.currentProject = null;
        this.projects = [];
        this.changeHistory = [];
        console.log('✅ تم مسح جميع البيانات');
        resolve(true);
      };

      transaction.onerror = () => {
        console.error('فشل مسح البيانات');
        reject(transaction.error);
      };
    });
  }
}

// تصدير الفئة
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProjectManager;
}
