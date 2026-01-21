/**
 * 🔐 نظام المصادقة المتقدم وقاعدة البيانات المحلية
 * يستخدم IndexedDB لتخزين الحسابات والبيانات بشكل آمن ومستقر
 */

class AuthSystem {
    constructor() {
        this.dbName = 'CyberShield_DB';
        this.dbVersion = 1;
        this.db = null;
        this.currentUser = JSON.parse(localStorage.getItem('cyberShield_user')) || null;
        this.initDB();
    }

    // تهيئة قاعدة البيانات IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("❌ خطأ في فتح قاعدة البيانات:", event.target.error);
                reject("فشل فتح قاعدة البيانات");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("✅ تم تهيئة قاعدة البيانات بنجاح");
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'email' });
                    userStore.createIndex('id', 'id', { unique: true });
                }
            };
        });
    }

    // تسجيل مستخدم جديد
    async register(email, password, name) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            
            // التحقق من وجود المستخدم
            const checkRequest = store.get(email);
            
            checkRequest.onsuccess = () => {
                if (checkRequest.result) {
                    reject(new Error('البريد الإلكتروني مسجل مسبقاً'));
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    email: email,
                    password: password, // في نظام حقيقي يجب تشفير كلمة المرور
                    name: name,
                    createdAt: new Date().toISOString(),
                    stats: {
                        scansPerformed: 0,
                        vulnerabilitiesFound: 0,
                        fixesApplied: 0
                    }
                };

                const addRequest = store.add(newUser);
                addRequest.onsuccess = () => {
                    this.currentUser = newUser;
                    localStorage.setItem('cyberShield_user', JSON.stringify(newUser));
                    resolve(newUser);
                };
                addRequest.onerror = () => reject(new Error('فشل في إنشاء الحساب'));
            };
        });
    }

    // تسجيل الدخول
    async login(email, password) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(email);

            request.onsuccess = () => {
                const user = request.result;
                if (user && user.password === password) {
                    this.currentUser = user;
                    localStorage.setItem('cyberShield_user', JSON.stringify(user));
                    resolve(user);
                } else {
                    reject(new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة'));
                }
            };
            request.onerror = () => reject(new Error('خطأ في عملية تسجيل الدخول'));
        });
    }

    // تسجيل الخروج
    logout() {
        this.currentUser = null;
        localStorage.removeItem('cyberShield_user');
        window.location.reload();
    }

    // تحديث بيانات المستخدم في قاعدة البيانات
    async updateUserStats(stats) {
        if (!this.currentUser || !this.db) return;
        
        this.currentUser.stats.scansPerformed += stats.scans || 0;
        this.currentUser.stats.vulnerabilitiesFound += stats.vulns || 0;
        this.currentUser.stats.fixesApplied += stats.fixes || 0;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(this.currentUser);

            request.onsuccess = () => {
                localStorage.setItem('cyberShield_user', JSON.stringify(this.currentUser));
                resolve();
            };
            request.onerror = () => reject(new Error('فشل تحديث البيانات'));
        });
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

window.authSystem = new AuthSystem();
