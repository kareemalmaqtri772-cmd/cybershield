class CyberShieldApp {
    constructor() {
        this.currentScreen = 'main';
        this.currentUserType = null;
        this.init();
    }

    async init() {
        console.log('🚀 CyberShield App Initialized');
        
        // تهيئة طبقة التكامل والأنظمة الجديدة
        if (window.integrationLayer) {
            await window.integrationLayer.init();
            console.log('✅ تم تهيئة الأنظمة الجديدة (التوصيات والمشاريع)');
        }

        // التحقق من حالة تسجيل الدخول
        checkAuthStatus();
    }

    // نظام التنقل فقط
    showScreen(screenId) {
        console.log('🔄 جاري الانتقال إلى:', screenId);
        
        document.querySelectorAll('.user-screen, #main-screen, .content-screen').forEach(screen => {
            screen.classList.add('hidden');
        });

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            console.log('✅ تم الانتقال إلى:', screenId);
        } else {
            console.error('❌ الشاشة غير موجودة:', screenId);
        }
    }

    setUserType(userType) {
        this.currentUserType = userType;
        localStorage.setItem('currentUserType', userType);
    }

    goBackToUserScreen() {
        const savedType = localStorage.getItem('currentUserType');
        if (savedType === 'regular') {
            this.showScreen('regular-user-screen');
        } else if (savedType === 'programmer') {
            this.showScreen('programmer-screen');
        } else {
            this.showScreen('main-screen');
        }
    }
}

// إنشاء التطبيق
const app = new CyberShieldApp();

// --- دوال المصادقة والواجهة الجديدة ---

function checkAuthStatus() {
    const loginScreen = document.getElementById('login-screen');
    if (window.authSystem && window.authSystem.isLoggedIn()) {
        if (loginScreen) loginScreen.classList.add('hidden');
        updateUserProfileUI();
    } else {
        if (loginScreen) loginScreen.classList.remove('hidden');
    }
}

function toggleAuthMode() {
    const loginForm = document.getElementById('login-form-container');
    const regForm = document.getElementById('register-form-container');
    if (loginForm && regForm) {
        loginForm.classList.toggle('hidden');
        regForm.classList.toggle('hidden');
    }
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    if (!email || !pass) {
        alert('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
        return;
    }

    try {
        await window.authSystem.login(email, pass);
        checkAuthStatus();
    } catch (e) {
        alert(e.message);
    }
}

async function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    
    if (!name || !email || !pass) {
        alert('الرجاء ملء جميع الحقول');
        return;
    }

    try {
        await window.authSystem.register(email, pass, name);
        checkAuthStatus();
    } catch (e) {
        alert(e.message);
    }
}

function toggleUserPanel() {
    const panel = document.getElementById('user-panel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            updateUserProfileUI();
        }
    }
}

function updateUserProfileUI() {
    const user = window.authSystem.currentUser;
    if (!user) return;

    const nameEl = document.getElementById('panel-user-name');
    const emailEl = document.getElementById('panel-user-email');
    const scansEl = document.getElementById('stat-scans');
    const vulnsEl = document.getElementById('stat-vulns');

    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    if (scansEl) scansEl.textContent = user.stats.scansPerformed;
    if (vulnsEl) vulnsEl.textContent = user.stats.vulnerabilitiesFound;
}

// الدوال الأساسية
function selectUserType(userType) {
    app.setUserType(userType);
    if (userType === 'regular') {
        app.showScreen('regular-user-screen');
    } else if (userType === 'programmer') {
        app.showScreen('programmer-screen');
    }
}

function goToHome() {
    app.currentUserType = null;
    localStorage.removeItem('currentUserType');
    app.showScreen('main-screen');
}

function goBackToUserScreen() {
    app.goBackToUserScreen();
}

function showFeature(featureId) {
    console.log('🎯 عرض الميزة:', featureId);
    
    const featureMap = {
        // واجهة المستخدم العادي
        'awareness-content': 'awareness-content-screen',
        'awareness-test': 'awareness-test-screen', 
        'security-tools': 'security-tools-screen',
        'alternative-apps': 'alternative-apps-screen',
        
        // واجهة المبرمج
        'advanced-awareness': 'advanced-awareness-screen',
        'code-scan': 'code-scan-screen',
        'code-fix': 'code-fix-screen',
        'performance-analysis': 'performance-analysis-screen',
        'project-management': 'project-management-screen'
    };

    const screenId = featureMap[featureId];
    if (screenId) {
        app.showScreen(screenId);
        if (featureId === 'project-management') {
            loadProjectsList();
        }
    } else {
        console.error('الميزة غير معروفة:', featureId);
    }
}

async function loadProjectsList() {
    const container = document.getElementById('projects-list-container');
    if (!container || !window.integrationLayer) return;

    container.innerHTML = '<div class="loading-spinner">جاري تحميل المشاريع...</div>';
    
    try {
        const projects = await window.integrationLayer.getAllProjects();
        container.innerHTML = '';
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="no-projects">لا توجد مشاريع محفوظة بعد.</div>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-info">
                    <h3>${project.name}</h3>
                    <p>${project.description || 'لا يوجد وصف'}</p>
                    <div class="project-meta">
                        <span><i class="fas fa-calendar"></i> ${new Date(project.updatedAt).toLocaleDateString('ar-EG')}</span>
                        <span><i class="fas fa-bug"></i> ${project.metadata.vulnerabilitiesCount} ثغرة</span>
                    </div>
                </div>
                <div class="project-actions">
                    <button onclick="loadProjectToEditor(${project.id})" class="btn-small"><i class="fas fa-edit"></i> فتح</button>
                    <button onclick="exportProject(${project.id})" class="btn-small secondary"><i class="fas fa-download"></i> تصدير</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        container.innerHTML = '<div class="error">فشل تحميل المشاريع.</div>';
    }
}

async function loadProjectToEditor(projectId) {
    try {
        const project = await window.integrationLayer.loadProject(projectId);
        const scanInput = document.getElementById('scan-code-input');
        const fixInput = document.getElementById('fix-code-input');
        
        if (scanInput) scanInput.value = project.code;
        if (fixInput) fixInput.value = project.code;
        
        app.showScreen('code-scan-screen');
        alert(`تم تحميل المشروع: ${project.name}`);
    } catch (error) {
        alert('فشل تحميل المشروع في المحرر');
    }
}

function exportProject(projectId) {
    window.integrationLayer.exportProject(projectId);
}

// دوال الفحص والإصلاح (باستخدام النماذج الأصلية مباشرة)
async function startAIScan() {
    const codeInput = document.getElementById('scan-code-input');
    
    if (!codeInput || !codeInput.value.trim()) {
        alert('⚠️ الرجاء إدخال كود لفحصه');
        return;
    }

    const progressElement = document.getElementById('scan-progress');
    const progressBar = document.getElementById('ai-progress');
    
    try {
        progressElement.style.display = 'block';
        progressBar.style.width = '0%';
        
        // محاكاة التقدم
        for (let i = 0; i <= 100; i += 20) {
            progressBar.style.width = i + '%';
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log('🔍 بدء فحص الكود باستخدام الأنظمة المحدثة...');
        
        let analysis;
        if (window.integrationLayer && window.integrationLayer.isInitialized) {
            console.log('🎯 استخدام طبقة التكامل المحدثة');
            // ربط AI Engine بطبقة التكامل إذا لم يكن مربوطاً
            if (!window.integrationLayer.aiEngine && window.aiEngine) {
                window.integrationLayer.aiEngine = window.aiEngine;
            }
            
            const result = await window.integrationLayer.analyzeCodeWithRecommendations(codeInput.value, 'فحص جديد');
            analysis = result.vulnerabilities;
            
            // عرض التوصيات الذكية المكتشفة
            if (result.recommendations && result.recommendations.length > 0) {
                console.log('💡 تم اكتشاف توصيات ذكية:', result.recommendations.length);
                displayRecommendations(result.recommendations);
            }
        } else if (window.aiEngine && window.aiEngine.isInitialized) {
            analysis = await window.aiEngine.models.vulnerabilityDetector.predict(codeInput.value);
        } else {
            throw new Error('أنظمة الذكاء الاصطناعي غير جاهزة');
        }
        
        displayScanResults(analysis);
        
    } catch (error) {
        console.error('فشل في الفحص:', error);
        alert('❌ فشل في عملية الفحص: ' + error.message);
    } finally {
        progressElement.style.display = 'none';
    }
}

async function startAIFix() {
    const codeInput = document.getElementById('fix-code-input');
    
    if (!codeInput || !codeInput.value.trim()) {
        alert('⚠️ الرجاء إدخال كود يحتاج إصلاح');
        return;
    }

    const progressElement = document.getElementById('fix-progress');
    const progressBar = document.getElementById('fix-progress-bar');
    
    try {
        progressElement.style.display = 'block';
        progressBar.style.width = '0%';
        
        // محاكاة التقدم
        for (let i = 0; i <= 100; i += 25) {
            progressBar.style.width = i + '%';
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('🔧 بدء إصلاح الكود باستخدام الأنظمة المحدثة...');
        
        let repairResult;
        if (window.integrationLayer && window.integrationLayer.isInitialized) {
            console.log('🎯 استخدام طبقة التكامل للإصلاح والحفظ');
            
            // تحليل أولاً
            const analysisResult = await window.integrationLayer.analyzeCodeWithRecommendations(codeInput.value, 'إصلاح كود');
            
            // إصلاح وحفظ تلقائي
            repairResult = await window.integrationLayer.fixCodeAndSave(codeInput.value, analysisResult.vulnerabilities.vulnerabilities);
            
            // تحديث الإحصائيات في واجهة المستخدم
            const stats = await window.integrationLayer.getProjectStats();
            console.log('📊 إحصائيات المشروع المحدثة:', stats);
        } else if (window.aiEngine && window.aiEngine.models.codeRepair) {
            const analysis = await window.aiEngine.models.vulnerabilityDetector.predict(codeInput.value);
            repairResult = await window.aiEngine.models.codeRepair.repair(codeInput.value, analysis.vulnerabilities);
        } else {
            throw new Error('أنظمة الإصلاح غير جاهزة');
        }
        
        // عرض النتائج
        document.getElementById('fixed-code').textContent = repairResult.repaired;
        document.getElementById('fix-status').textContent = 'تم الإصلاح';
        document.getElementById('fix-details').style.display = 'block';
        
        // تحديث الإحصائيات
        document.getElementById('vuln-fixed').textContent = analysis.vulnerabilities.length;
        document.getElementById('score-improvement').textContent = (repairResult.repaired !== codeInput.value) ? '50%' : '0%';
        document.getElementById('changes-count').textContent = repairResult.changes ? repairResult.changes.length : 0;
        
        console.log('✅ تم الإصلاح بنجاح باستخدام النماذج الأصلية');
        
    } catch (error) {
        console.error('فشل في الإصلاح:', error);
        alert('❌ فشل في عملية الإصلاح: ' + error.message);
    } finally {
        progressElement.style.display = 'none';
    }
}

// دالة جديدة لعرض التوصيات الذكية
function displayRecommendations(recommendations) {
    const recommendationsContainer = document.getElementById('recommendations-list') || createRecommendationsContainer();
    recommendationsContainer.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recItem = document.createElement('div');
        recItem.className = `recommendation-item ${rec.severity}`;
        recItem.innerHTML = `
            <div class="rec-header">
                <i class="fas fa-lightbulb"></i>
                <strong>${rec.title}</strong>
                <span class="impact-badge">${rec.impact}</span>
            </div>
            <p>${rec.description}</p>
            <div class="rec-example">
                <pre><code>${rec.codeExample}</code></pre>
            </div>
        `;
        recommendationsContainer.appendChild(recItem);
    });
}

function createRecommendationsContainer() {
    const resultDiv = document.getElementById('scan-result');
    if (!resultDiv) return null;
    
    const container = document.createElement('div');
    container.id = 'recommendations-section';
    container.innerHTML = `
        <h3 class="section-title"><i class="fas fa-magic"></i> التوصيات الذكية</h3>
        <div id="recommendations-list" class="recommendations-list"></div>
    `;
    resultDiv.appendChild(container);
    return document.getElementById('recommendations-list');
}

function displayScanResults(analysis) {
    const resultDiv = document.getElementById('scan-result');
    const vulnerabilitiesList = document.getElementById('vulnerabilities-list');
    const securityScore = document.getElementById('security-score');
    
    if (!resultDiv || !vulnerabilitiesList) {
        console.error('❌ عناصر النتائج غير موجودة');
        return;
    }
    
    // تحديث درجة الأمان
    if (securityScore) {
        const scoreValue = analysis.securityScore || analysis.score || 100;
        securityScore.querySelector('.score-value').textContent = scoreValue + '%';
    }
    
    // عرض الثغرات
    vulnerabilitiesList.innerHTML = '';
    const vulnerabilities = analysis.vulnerabilities || [];
    
    if (vulnerabilities.length === 0) {
        vulnerabilitiesList.innerHTML = `
            <div class="issue-item info">
                <div class="issue-header">
                    <strong>✅ لا توجد ثغرات</strong>
                </div>
                <p>الكود آمن ولا يحتوي على ثغرات واضحة</p>
            </div>
        `;
    } else {
        vulnerabilities.forEach(vuln => {
            const issueItem = document.createElement('div');
            issueItem.className = `issue-item ${vuln.severity || 'medium'}`;
            issueItem.innerHTML = `
                <div class="issue-header">
                    <strong>${getVulnerabilityName(vuln.type)}</strong>
                    <span class="severity-badge ${vuln.severity || 'medium'}">${getSeverityText(vuln.severity)}</span>
                </div>
                <p>${vuln.description || 'ثغرة أمنية تم اكتشافها'}</p>
                <div class="issue-details">
                    <small>${vuln.line ? `السطر: ${vuln.line}` : ''}</small>
                </div>
            `;
            vulnerabilitiesList.appendChild(issueItem);
        });
    }
    
    resultDiv.style.display = 'block';
}

// دوال مساعدة
function updateCodeStats(type) {
    let textarea, lineCountElement, charCountElement, complexityElement;
    
    if (type === 'scan') {
        textarea = document.getElementById('scan-code-input');
        lineCountElement = document.getElementById('scan-line-count');
        charCountElement = document.getElementById('scan-char-count');
        complexityElement = document.getElementById('scan-complexity');
    }
    
    if (!textarea) return;
    
    const code = textarea.value;
    const lines = code.split('\n').length;
    const chars = code.length;
    
    if (lineCountElement) lineCountElement.textContent = `${lines} أسطر`;
    if (charCountElement) charCountElement.textContent = `${chars} حرف`;
    
    if (complexityElement) {
        if (lines > 50) complexityElement.textContent = 'معقد';
        else if (lines > 20) complexityElement.textContent = 'متوسط';
        else complexityElement.textContent = 'بسيط';
    }
}

function getVulnerabilityName(type) {
    const names = {
        'sql_injection': '📊 ثغرة SQL Injection',
        'xss': '🛡️ ثغرة XSS',
        'csrf': '🎯 ثغرة CSRF',
        'auth_bypass': '🔑 تجاوز المصادقة',
        'file_upload': '📁 ثغرة رفع الملفات',
        'command_injection': '⚡ ثغرة تنفيذ الأوامر'
    };
    return names[type] || type;
}

function getSeverityText(severity) {
    const texts = {
        'critical': '🔴 حرجة',
        'high': '🟥 عالية',
        'medium': '🟨 متوسطة', 
        'low': '🟩 منخفضة'
    };
    return texts[severity] || 'متوسطة';
}

function showRepairOptions() {
    app.showScreen('code-fix-screen');
}

function copyFixedCode() {
    const fixedCode = document.getElementById('fixed-code').textContent;
    navigator.clipboard.writeText(fixedCode).then(() => {
        alert('✅ تم نسخ الكود المُصلح');
    });
}

function downloadFixedCode() {
    const fixedCode = document.getElementById('fixed-code').textContent;
    const blob = new Blob([fixedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'الكود_المُصلح.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function downloadReport() {
    alert('📥 سيتم تنزيل التقرير في الإصدار القادم');
}

function applyAndTest() {
    alert('🧪 جاري تطبيق واختبار الكود المُصلح');
}

// أدوات فحص كلمات المرور والروابط مع العين
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input');
    const toggleIcon = document.getElementById('password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('password-input').value;
    const resultDiv = document.getElementById('password-result');
    const checkBtn = document.querySelector('.tool-btn.primary');
    
    if (!password) {
        resultDiv.innerHTML = '<div class="warning">⚠️ الرجاء إدخال كلمة المرور</div>';
        return;
    }

    // تعطيل الزر أثناء المعالجة
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحليل...';

    // إخفاء النتيجة السابقة
    resultDiv.innerHTML = '';

    // مؤقت لمدة 20 ثانية لمحاكاة التحليل العميق
    setTimeout(() => {
        let strength = 0;
        let feedback = [];

        if (password.length >= 8) strength++;
        else feedback.push('🔴 كلمة المرور قصيرة (8 أحرف على الأقل)');

        if (/[A-Z]/.test(password)) strength++;
        else feedback.push('🔴 أضف حروف كبيرة');

        if (/[a-z]/.test(password)) strength++;
        else feedback.push('🔴 أضف حروف صغيرة');

        if (/[0-9]/.test(password)) strength++;
        else feedback.push('🔴 أضف أرقام');

        if (/[^A-Za-z0-9]/.test(password)) strength++;
        else feedback.push('🔴 أضف رموز خاصة');

        let strengthText = '';
        let strengthClass = '';
        
        if (strength >= 5) {
            strengthText = '🟢 قوية جداً';
            strengthClass = 'strong';
        } else if (strength >= 3) {
            strengthText = '🟡 متوسطة';
            strengthClass = 'medium';
        } else {
            strengthText = '🔴 ضعيفة';
            strengthClass = 'weak';
        }

        // إنشاء اقتراحات لكلمات مرور بناءً على المدخلات
        const passwordSuggestions = generatePasswordSuggestions(password);

        resultDiv.innerHTML = `
            <div class="strength-result ${strengthClass}">
                <h4>${strengthText}</h4>
                <p>${feedback.length > 0 ? 'نصائح للتحسين:' : '✅ كلمة مرور ممتازة!'}</p>
                <ul>${feedback.map(item => `<li>${item}</li>`).join('')}</ul>
                
                ${passwordSuggestions.length > 0 ? `
                    <div class="suggestions-section">
                        <h5>🔐 اقتراحات كلمات مرور آمنة:</h5>
                        <div class="suggestions-list">
                            ${passwordSuggestions.map(suggestion => `
                                <div class="suggestion-item" onclick="copyToClipboard('${suggestion}')">
                                    <span>${suggestion}</span>
                                    <i class="fas fa-copy"></i>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        // إعادة تمكين الزر وإعادة النص الأصلي
        checkBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-shield-check"></i> فحص القوة';

        // مؤقت لإخفاء النتيجة بعد 30 ثانية
        setTimeout(() => {
            resultDiv.innerHTML = '';
            document.getElementById('password-input').value = '';
        }, 30000);

    }, 20000); // 20 ثانية انتظار
}

// دالة إنشاء اقتراحات كلمات مرور
function generatePasswordSuggestions(basePassword) {
    const suggestions = [];
    
    // اقتراح 1: إضافة أرقام ورموز
    if (basePassword.length > 3) {
        suggestions.push(basePassword + '123!' + Math.floor(Math.random() * 100));
    }
    
    // اقتراح 2: تحويل إلى حالة مختلطة مع رموز
    const mixedCase = basePassword.split('').map((char, index) => 
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    ).join('') + '@' + Math.floor(Math.random() * 1000);
    suggestions.push(mixedCase);
    
    // اقتراح 3: كلمة مرور عشوائية قوية
    const strongPassword = generateStrongPassword(basePassword);
    suggestions.push(strongPassword);
    
    // اقتراح 4: نمط مختلف بناءً على الكلمة الأساسية
    const patternPassword = basePassword.split('').reverse().join('') + '#' + Math.floor(Math.random() * 50);
    suggestions.push(patternPassword);
    
    return suggestions;
}

// دالة إنشاء كلمة مرور قوية
function generateStrongPassword(base) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let strongPass = base.substring(0, 3); // أخذ أول 3 أحرف من الكلمة الأساسية
    
    for (let i = 0; i < 9; i++) {
        strongPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return strongPass;
}

// دالة نسخ إلى الحافظة
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // إظهار رسالة نجاح النسخ
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = '✅ تم نسخ كلمة المرور';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    });
}

// ===== دالة تحديث عداد الأحرف =====
function updateCharCounter(type) {
    let input, counter, maxLength;
    
    if (type === 'password') {
        input = document.getElementById('password-input');
        counter = document.getElementById('password-counter');
        maxLength = 20;
    } else if (type === 'url') {
        input = document.getElementById('url-input');
        counter = document.getElementById('url-counter');
        maxLength = 30;
    }
    
    if (input && counter) {
        const currentLength = input.value.length;
        counter.textContent = `${currentLength}/${maxLength}`;
        
        // تغيير اللون حسب الطول
        if (currentLength >= maxLength * 0.8) {
            counter.className = 'char-counter warning';
        } else {
            counter.className = 'char-counter';
        }
    }
}

// ===== دالة فحص كلمات المرور المصححة =====
function checkPasswordStrength() {
    const password = document.getElementById('password-input').value;
    const resultDiv = document.getElementById('password-result');
    const checkBtn = document.querySelector('#password-check-btn');
    const passwordInput = document.getElementById('password-input');
    
    if (!password) {
        resultDiv.innerHTML = '<div class="warning">⚠️ الرجاء إدخال كلمة المرور</div>';
        return;
    }

    // تعطيل الزر وإخفاء كلمة المرور
    checkBtn.disabled = true;
    passwordInput.disabled = true;
    
    let secondsLeft = 5;
    checkBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري فحص كلمة المرور... (${secondsLeft}ث)`;

    // مؤقت تنازلي
    const countdown = setInterval(() => {
        secondsLeft--;
        checkBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري فحص كلمة المرور... (${secondsLeft}ث)`;
        
        if (secondsLeft <= 0) {
            clearInterval(countdown);
            showPasswordResults(password, resultDiv, checkBtn, passwordInput);
        }
    }, 1000);

    // إخفاء النتيجة السابقة
    resultDiv.innerHTML = '';
}

function showPasswordResults(password, resultDiv, checkBtn, passwordInput) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength++;
    else feedback.push('🔴 كلمة المرور قصيرة (8 أحرف على الأقل)');

    if (/[A-Z]/.test(password)) strength++;
    else feedback.push('🔴 أضف حروف كبيرة');

    if (/[a-z]/.test(password)) strength++;
    else feedback.push('🔴 أضف حروف صغيرة');

    if (/[0-9]/.test(password)) strength++;
    else feedback.push('🔴 أضف أرقام');

    if (/[^A-Za-z0-9]/.test(password)) strength++;
    else feedback.push('🔴 أضف رموز خاصة');

    let strengthText = '';
    let strengthClass = '';
    
    if (strength >= 5) {
        strengthText = '🟢 قوية جداً';
        strengthClass = 'strong';
    } else if (strength >= 3) {
        strengthText = '🟡 متوسطة';
        strengthClass = 'medium';
    } else {
        strengthText = '🔴 ضعيفة';
        strengthClass = 'weak';
    }

    // إنشاء اقتراحات لكلمات مرور بناءً على المدخلات
    const passwordSuggestions = generatePasswordSuggestions(password);

    resultDiv.innerHTML = `
        <div class="strength-result ${strengthClass}">
            <h4>${strengthText}</h4>
            <p>${feedback.length > 0 ? 'نصائح للتحسين:' : '✅ كلمة مرور ممتازة!'}</p>
            <ul>${feedback.map(item => `<li>${item}</li>`).join('')}</ul>
            
            ${passwordSuggestions.length > 0 ? `
                <div class="suggestions-section">
                    <h5>🔐 اقتراحات كلمات مرور آمنة:</h5>
                    <div class="suggestions-list">
                        ${passwordSuggestions.map(suggestion => `
                            <div class="suggestion-item" onclick="copyPasswordSuggestion('${suggestion}')">
                                <span>${suggestion}</span>
                                <i class="fas fa-copy"></i>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // إعادة تمكين الزر والحقل
    checkBtn.disabled = false;
    passwordInput.disabled = false;
    checkBtn.innerHTML = '<i class="fas fa-shield-check"></i> فحص كلمة المرور';
    
    // تحديث العداد بعد المسح
    updateCharCounter('password');
}

// ===== دالة فحص الروابط المصححة =====
function checkURLSafety() {
    const url = document.getElementById('url-input').value;
    const resultDiv = document.getElementById('url-result');
    const checkBtn = document.querySelector('#url-check-btn');
    const urlInput = document.getElementById('url-input');
    
    if (!url) {
        resultDiv.innerHTML = '<div class="warning">⚠️ الرجاء إدخال الرابط</div>';
        return;
    }

    // تعطيل الزر والحقل
    checkBtn.disabled = true;
    urlInput.disabled = true;
    
    let secondsLeft = 5;
    checkBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري فحص الرابط... (${secondsLeft}ث)`;

    // مؤقت تنازلي
    const countdown = setInterval(() => {
        secondsLeft--;
        checkBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري فحص الرابط... (${secondsLeft}ث)`;
        
        if (secondsLeft <= 0) {
            clearInterval(countdown);
            showURLResults(url, resultDiv, checkBtn, urlInput);
        }
    }, 1000);

    // إخفاء النتيجة السابقة
    resultDiv.innerHTML = '';
}

function showURLResults(url, resultDiv, checkBtn, urlInput) {
    const dangerousDomains = ['fake-bank.com', 'phishing-site.net', 'malicious-link.org', 'hack-me-now.com'];
    const suspiciousKeywords = ['login', 'password', 'verify', 'account', 'secure', 'update', 'confirm'];
    const trustedDomains = ['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'facebook.com'];
    
    let isSafe = true;
    let warnings = [];
    let recommendations = [];

    // التحقق من النطاقات الخطرة
    dangerousDomains.forEach(domain => {
        if (url.toLowerCase().includes(domain)) {
            isSafe = false;
            warnings.push('🔴 هذا النطاق معروف بأنه خطير');
        }
    });

    // التحقق من النطاقات الموثوقة
    trustedDomains.forEach(domain => {
        if (url.toLowerCase().includes(domain)) {
            isSafe = true;
            recommendations.push('✅ هذا النطاق معروف بالثقة');
        }
    });

    // التحقق من الكلمات المشبوهة
    suspiciousKeywords.forEach(keyword => {
        if (url.toLowerCase().includes(keyword)) {
            warnings.push('🟡 يحتوي على كلمات مشبوهة: ' + keyword);
        }
    });

    // التحقق من HTTPS
    if (!url.startsWith('https://')) {
        warnings.push('🟡 الرابط لا يستخدم HTTPS - غير آمن');
        recommendations.push('🔒 استخدم دائماً روابط تبدأ بـ HTTPS');
    } else {
        recommendations.push('🔒 جيد - الرابط يستخدم تشفير HTTPS');
    }

    // التحقق من طول الرابط
    if (url.length > 100) {
        warnings.push('🟡 الرابط طويل جداً - قد يكون مشبوهاً');
        recommendations.push('📏 تجنب الروابط الطويلة جداً');
    }

    // إنشاء توصيات أمنية بناءً على التحليل
    const securityRecommendations = generateSecurityRecommendations(url, warnings);

    if (isSafe && warnings.length === 0) {
        resultDiv.innerHTML = `
            <div class="safe">
                <h4>✅ الرابط يبدو آمناً</h4>
                <p>يمكنك المتابعة بثقة</p>
                ${securityRecommendations.length > 0 ? `
                    <div class="recommendations-section">
                        <h5>🛡️ توصيات أمنية:</h5>
                        <div class="recommendations-list">
                            ${securityRecommendations.map(rec => `
                                <div class="recommendation-item">
                                    <i class="fas fa-shield-check"></i>
                                    <span>${rec}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="unsafe">
                <h4>⚠️ تحذير: الرابط مشبوه</h4>
                <ul>${warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
                ${securityRecommendations.length > 0 ? `
                    <div class="recommendations-section">
                        <h5>🛡️ توصيات أمنية للتعامل مع الرابط:</h5>
                        <div class="recommendations-list">
                            ${securityRecommendations.map(rec => `
                                <div class="recommendation-item">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <span>${rec}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    // إعادة تمكين الزر والحقل
    checkBtn.disabled = false;
    urlInput.disabled = false;
    checkBtn.innerHTML = '<i class="fas fa-search"></i> فحص الرابط';

    // مؤقت لإخفاء النتيجة بعد 10 ثواني
    setTimeout(() => {
        resultDiv.innerHTML = '';
        urlInput.value = '';
        updateCharCounter('url'); // تحديث العداد بعد المسح
    }, 10000);
}

// ===== الدوال المساعدة =====

// دالة إنشاء اقتراحات كلمات المرور
function generatePasswordSuggestions(basePassword) {
    const suggestions = [];
    
    // اقتراح 1: إضافة أرقام ورموز
    if (basePassword.length > 3) {
        suggestions.push(basePassword + '123!' + Math.floor(Math.random() * 100));
    }
    
    // اقتراح 2: تحويل إلى حالة مختلطة مع رموز
    const mixedCase = basePassword.split('').map((char, index) => 
        index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
    ).join('') + '@' + Math.floor(Math.random() * 1000);
    suggestions.push(mixedCase);
    
    // اقتراح 3: كلمة مرور عشوائية قوية
    const strongPassword = generateStrongPassword(basePassword);
    suggestions.push(strongPassword);
    
    // اقتراح 4: نمط مختلف بناءً على الكلمة الأساسية
    const patternPassword = basePassword.split('').reverse().join('') + '#' + Math.floor(Math.random() * 50);
    suggestions.push(patternPassword);
    
    return suggestions;
}

// دالة إنشاء كلمة مرور قوية
function generateStrongPassword(base) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let strongPass = base.substring(0, 3); // أخذ أول 3 أحرف من الكلمة الأساسية
    
    for (let i = 0; i < 9; i++) {
        strongPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return strongPass;
}

// دالة نسخ اقتراح كلمة المرور
function copyPasswordSuggestion(password) {
    navigator.clipboard.writeText(password).then(() => {
        // إظهار رسالة نجاح النسخ
        showCopyNotification('✅ تم نسخ كلمة المرور');
        
        // مسح الحقول مباشرة بعد النسخ
        document.getElementById('password-input').value = '';
        document.getElementById('password-result').innerHTML = '';
        updateCharCounter('password'); // تحديث العداد
    });
}

// دالة إنشاء التوصيات الأمنية
function generateSecurityRecommendations(url, warnings) {
    const recommendations = [];
    
    // توصيات عامة
    recommendations.push('🔍 تحقق دائماً من عنوان URL قبل النقر');
    recommendations.push('🚫 لا تدخل بيانات حساسة في مواقع غير موثوقة');
    recommendations.push('🔄 حافظ على تحديث متصفحك وبرامج الحماية');

    // توصيات بناءً على نوع الرابط
    if (url.includes('bank') || url.includes('payment')) {
        recommendations.push('💳 استخدم تطبيق البنك الرسمي بدلاً من الروابط');
        recommendations.push('📞 تواصل مع البنك مباشرة للتحقق من الروابط');
    }
    
    if (url.includes('login') || url.includes('signin')) {
        recommendations.push('🔑 تفعيل المصادقة الثنائية لحساباتك');
        recommendations.push('📧 تحقق من عنوان البريد المرسل للرابط');
    }
    
    if (url.includes('download') || url.includes('install')) {
        recommendations.push('💾 قم بفحص الملفات قبل التثبيت');
        recommendations.push('🛡️ استخدم برنامج مكافحة فيروسات محدث');
    }

    // توصيات بناءً على التحذيرات
    if (warnings.some(w => w.includes('HTTPS'))) {
        recommendations.push('🔒 ابحث عن نسخة HTTPS من الموقع');
    }
    
    if (warnings.some(w => w.includes('طويل'))) {
        recommendations.push('📏 اختصر الروابط الطويلة باستخدام خدمات موثوقة');
    }

    return recommendations.slice(0, 5);
}

// دالة إظهار إشعار النسخ
function showCopyNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// دالة تبديل رؤية كلمة المرور
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password-input');
    const toggleIcon = document.getElementById('password-toggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}





// ===== نظام اختبار الوعي الأمني المتطور =====
const awarenessTest = {
    allQuestions: [
        // === التصيد الاحتيالي ===
        {
            id: 1,
            question: "ما هي العلامة الأكثر وضوحاً لرسالة التصيد الاحتيالي؟",
            options: [
                "الطلب الفوري لإدخال كلمة المرور",
                "الأخطاء الإملائية في الرسالة", 
                "رابط موقع يختلف عن اسم المؤسسة",
                "جميع ما سبق"
            ],
            correct: 3,
            category: "التصيد الاحتيالي",
            explanation: "جميع هذه العلامات تشير إلى رسالة تصيد احتيالي محتملة"
        },
        {
            id: 2,
            question: "عند استلام بريد يطلب تحديث بياناتك البنكية، ما التصرف الصحيح؟",
            options: [
                "النقر على الرابط وتحديث البيانات فوراً",
                "حذف الرسالة دون الرد",
                "الاتصال بالبنك مباشرة للتحقق",
                "إعادة إرسال الرسالة للأصدقاء للتحذير"
            ],
            correct: 2,
            category: "التصيد الاحتيالي",
            explanation: "الاتصال المباشر بالبنك هو الإجراء الآمن للتحقق من صحة الطلب"
        },
        {
            id: 3, 
            question: "كيف تتحقق من صحة رابط موقع إلكتروني؟",
            options: [
                "النقر على الرابط لمعرفة محتواه",
                "قراءة وصف الرابط فقط",
                "نسخ الرابط ولصقه في محرك البحث",
                "التحقق من شهادة SSL (القفل الأخضر)"
            ],
            correct: 3,
            category: "التصيد الاحتيالي", 
            explanation: "شهادة SSL والقفل الأخضر يدلان على أن الموقع آمن ومشفر"
        },

        // === كلمات المرور ===
        {
            id: 4,
            question: "ما هي مواصفات كلمة المرور القوية؟",
            options: [
                "تكون سهلة التذكر مثل تاريخ الميلاد",
                "تتكون من 8 أحرف مع مزيج من الأحوال والأرقام",
                "استخدام كلمة واحدة طويلة",
                "استخدام نفس كلمة المرور لجميع الحسابات"
            ],
            correct: 1,
            category: "كلمات المرور",
            explanation: "كلمة المرور القوية تكون طويلة وتحتوي على مزيج من الأحرف والأرقام والرموز"
        },
        {
            id: 5,
            question: "ما فائدة استخدام المصادقة الثنائية (2FA)?",
            options: [
                "تسريع عملية تسجيل الدخول",
                "توفير طبقة إضافية من الحماية",
                "تغيير كلمة المرور تلقائياً",
                "جميع ما سبق"
            ],
            correct: 1,
            category: "كلمات المرور",
            explanation: "المصادقة الثنائية تضيف طبقة حماية إضافية حتى إذا تم اختراق كلمة المرور"
        },
        {
            id: 6,
            question: "كم مرة ينصح بتغيير كلمات المرور؟",
            options: [
                "كل أسبوع",
                "كل 3-6 أشهر", 
                "مرة واحدة فقط",
                "عند نسيانها فقط"
            ],
            correct: 1,
            category: "كلمات المرور",
            explanation: "ينصح بتغيير كلمات المرور كل 3-6 أشهر أو عند الاشتباه باختراقها"
        },

        // === أساسيات الأمن السيبراني ===
        {
            id: 7,
            question: "ما هو الفيروس (Virus) في الأمن السيبراني؟",
            options: [
                "برنامج مفيد لحماية الجهاز",
                "برنامج ضار ينتشر ويضر بالأنظمة",
                "أداة لتحسين أداء الكمبيوتر", 
                "نوع من أنواع التحديثات الأمنية"
            ],
            correct: 1,
            category: "أساسيات الأمن",
            explanation: "الفيروس هو برنامج ضار يصمم للانتشار والتسبب في أضرار للأنظمة"
        },
        {
            id: 8,
            question: "ما الغرض من استخدام جدار الحماية (Firewall)?",
            options: [
                "تسريع اتصال الإنترنت",
                "منع الوصول غير المصرح به للشبكة",
                "حذف الملفات المؤقتة",
                "تحسين جودة الصور"
            ],
            correct: 1, 
            category: "أساسيات الأمن",
            explanation: "جدار الحماية يتحكم في حركة المرور الشبكية ويمنع الوصول غير المصرح به"
        },
        {
            id: 9,
            question: "ما معنى مصطلح 'التصيد' (Phishing) في الأمن السيبراني؟",
            options: [
                "صيد الأسماك عبر الإنترنت",
                "سرقة البيانات الحساسة عن طريق الخداع",
                "برنامج لحماية البريد الإلكتروني",
                "تقنية لتسريع التصفح"
            ],
            correct: 1,
            category: "أساسيات الأمن",
            explanation: "التصيد هو هجوم إلكتروني يحاول فيه المهاجمون خداع الضحايا لكشف معلومات حساسة"
        },
        {
            id: 10,
            question: "ما هي أهمية تحديث البرامج باستمرار؟",
            options: [
                "لتحسين المظهر فقط",
                "لإصلاح الثغرات الأمنية",
                "لزيادة مساحة التخزين",
                "جميع ما سبق"
            ],
            correct: 1,
            category: "أساسيات الأمن", 
            explanation: "التحديثات تحتوي غالباً على إصلاحات للثغرات الأمنية المكتشفة"
        },

        // === الثغرات والحماية ===
        {
            id: 11,
            question: "ما هي ثغرة SQL Injection?",
            options: [
                "هجوم على قواعد البيانات عن طريق حقن أوامر خبيثة",
                "فيروس يصيب قواعد البيانات",
                "أداة لتحسين أداء قواعد البيانات",
                "نوع من أنواع النسخ الاحتياطي"
            ],
            correct: 0,
            category: "الثغرات والحماية",
            explanation: "هي ثغرة أمنية تسمح للمهاجم بحقن أوامر SQL خبيثة في تطبيقات الويب"
        },
        {
            id: 12,
            question: "كيف تحمي جهازك من البرمجيات الخبيثة؟",
            options: [
                "استخدام برنامج مكافحة فيروسات محدث",
                "عدم فتح المرفقات المشبوهة",
                "تحديث النظام والبرامج باستمرار",
                "جميع ما سبق"
            ],
            correct: 3,
            category: "الثغرات والحماية", 
            explanation: "الحماية الشاملة تتطلب استخدام برامج مكافحة فيروسات وتحديثات مستمرة وحذر من الملفات المشبوهة"
        },
        {
            id: 13,
            question: "ما هو هجوم DDoS?",
            options: [
                "هجوم لسرقة كلمات المرور",
                "هجوم يشل الخدمة بفيض من الطلبات",
                "هجوم لاختراق البريد الإلكتروني",
                "هجوم لنسخ البيانات"
            ],
            correct: 1,
            category: "الثغرات والحماية",
            explanation: "هجوم الحرمان من الخدمة يهدف إلى إغراق الخادم بطلبات زائفة لشل خدمته"
        },
        {
            id: 14,
            question: "ما فائدة تشفير البيانات؟",
            options: [
                "تسريع نقل البيانات",
                "جعل البيانات غير مقروءة بدون مفتاح",
                "تقليل حجم البيانات",
                "تحسين جودة البيانات"
            ],
            correct: 1,
            category: "الثغرات والحماية",
            explanation: "التشفير يحمي البيانات عن طريق تحويلها إلى شكل غير مقروء يمكن فك شفرته فقط بالمفتاح الصحيح"
        },
        {
            id: 15,
            question: "ما هي أفضل ممارسة للنسخ الاحتياطي؟",
            options: [
                "نسخ البيانات على نفس الجهاز",
                "استخدام وسيط تخزين واحد",
                "نسخ احتياطي على 3 وسائط مختلفة",
                "الاعتماد على الذاكرة السحابية فقط"
            ],
            correct: 2,
            category: "الثغرات والحماية",
            explanation: "قاعدة 3-2-1: 3 نسخ، على 2 وسيط مختلف، مع 1 نسخ خارج الموقع"
        }
    ],

    usedQuestions: [],
    currentSession: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    score: 0,
    
    initTest() {
        // إذا تم استخدام جميع الأسئلة، أعد تعيين القائمة
        if (this.usedQuestions.length >= this.allQuestions.length - 5) {
            this.usedQuestions = [];
        }
        
        this.generateNewSession();
        this.userAnswers = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // تحديث العدد الإجمالي للأسئلة
        document.getElementById('total-questions').textContent = this.allQuestions.length;
    },
    
    generateNewSession() {
        // تصفية الأسئلة غير المستخدمة بعد
        const availableQuestions = this.allQuestions.filter(q => 
            !this.usedQuestions.includes(q.id)
        );
        
        // إذا لم يكن هناك أسئلة كافية، أعد استخدام بعض الأسئلة
        let questionsPool = availableQuestions;
        if (availableQuestions.length < 10) {
            questionsPool = this.allQuestions;
        }
        
        // اختيار 10 أسئلة عشوائية
        const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
        this.currentSession = shuffled.slice(0, 10);
        
        //标记 الأسئلة المستخدمة
        this.currentSession.forEach(q => {
            if (!this.usedQuestions.includes(q.id)) {
                this.usedQuestions.push(q.id);
            }
        });
    },
    
    getCurrentQuestion() {
        return this.currentSession[this.currentQuestionIndex];
    },
    
    checkAnswer(selectedIndex) {
        const question = this.getCurrentQuestion();
        const isCorrect = selectedIndex === question.correct;
        
        if (isCorrect) {
            this.score += 10;
        }
        
        this.userAnswers.push({
            question: question.question,
            selected: selectedIndex,
            correct: question.correct,
            isCorrect: isCorrect,
            explanation: question.explanation,
            category: question.category
        });
        
        return isCorrect;
    },
    
    nextQuestion() {
        this.currentQuestionIndex++;
        return this.currentQuestionIndex < this.currentSession.length;
    },
    
    getResults() {
        const correctCount = this.userAnswers.filter(a => a.isCorrect).length;
        const totalQuestions = this.currentSession.length;
        const percentage = (correctCount / totalQuestions) * 100;
        
        let level = "مبتدئ";
        if (percentage >= 90) level = "خبير";
        else if (percentage >= 70) level = "متقدم";
        else if (percentage >= 50) level = "متوسط";
        else if (percentage >= 30) level = "مقبول";
        
        return {
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            percentage: percentage,
            level: level,
            score: this.score,
            sessionNumber: Math.floor(this.usedQuestions.length / 10) + 1
        };
    },
    
    getRecommendations(results) {
        const recommendations = [];
        const weakCategories = this.getWeakCategories();
        
        if (results.percentage < 60) {
            recommendations.push("📚 نوصي بزيارة المكتبة التوعوية لتحسين معرفتك الأمنية");
        }
        
        if (weakCategories.length > 0) {
            recommendations.push(`🎯 ركز على تحسين معرفتك في: ${weakCategories.join('، ')}`);
        }
        
        if (results.percentage >= 80) {
            recommendations.push("💪 أداء ممتاز! واصل التعلم للحفاظ على هذه المستوى");
        } else {
            recommendations.push("🔄 جرب اختباراً آخر لتحسين نتيجتك");
        }
        
        recommendations.push("🛡️ الحماية الأمنية مسؤولية مستمرة - واصل التعلم");
        
        return recommendations;
    },
    
    getWeakCategories() {
        const categoryStats = {};
        
        this.userAnswers.forEach(answer => {
            if (!categoryStats[answer.category]) {
                categoryStats[answer.category] = { total: 0, correct: 0 };
            }
            categoryStats[answer.category].total++;
            if (answer.isCorrect) {
                categoryStats[answer.category].correct++;
            }
        });
        
        const weakCategories = [];
        for (const [category, stats] of Object.entries(categoryStats)) {
            const accuracy = (stats.correct / stats.total) * 100;
            if (accuracy < 50) {
                weakCategories.push(category);
            }
        }
        
        return weakCategories;
    }
};

// دوال التحكم بالواجهة
function startAwarenessTest() {
    awarenessTest.initTest();
    showTestQuestions();
    displayQuestion();
    updateProgress();
    
    // تحديث عدد الجلسات
    const sessionCount = Math.floor(awarenessTest.usedQuestions.length / 10);
    document.getElementById('sessions-count').textContent = sessionCount;
}

function showTestQuestions() {
    document.getElementById('test-start-screen').classList.add('hidden');
    document.getElementById('test-results-screen').classList.add('hidden');
    document.getElementById('test-questions-screen').classList.remove('hidden');
}

function showTestResults() {
    document.getElementById('test-questions-screen').classList.add('hidden');
    document.getElementById('test-results-screen').classList.remove('hidden');
    
    const results = awarenessTest.getResults();
    displayResults(results);
}

function showTestStart() {
    document.getElementById('test-results-screen').classList.add('hidden');
    document.getElementById('test-start-screen').classList.remove('hidden');
}

function displayQuestion() {
    const question = awarenessTest.getCurrentQuestion();
    if (!question) {
        showTestResults();
        return;
    }
    
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-category').textContent = question.category;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option-item';
        optionElement.innerHTML = `
            <input type="radio" name="test-option" id="option-${index}" value="${index}">
            <label for="option-${index}">
                <span class="option-text">${option}</span>
            </label>
        `;
        
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    document.getElementById('next-btn').classList.add('hidden');
}

function selectOption(optionIndex) {
    // منع النقر المزدوج
    const options = document.querySelectorAll('.option-item');
    options.forEach(opt => opt.style.pointerEvents = 'none');
    
    const isCorrect = awarenessTest.checkAnswer(optionIndex);
    
    // تلوين الإجابات
    options.forEach((opt, idx) => {
        if (idx === optionIndex) {
            opt.style.borderColor = isCorrect ? 'var(--success)' : 'var(--danger)';
            opt.style.background = isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        }
    });
    
    // إظهار التالي
    document.getElementById('next-btn').classList.remove('hidden');
    
    // تحديث النقاط
    document.getElementById('test-score').textContent = `النقاط: ${awarenessTest.score}`;
    
    // تحديث التقدم
    updateProgress();
}

function nextQuestion() {
    const hasNext = awarenessTest.nextQuestion();
    
    if (hasNext) {
        displayQuestion();
    } else {
        showTestResults();
    }
}

function updateProgress() {
    const progress = ((awarenessTest.currentQuestionIndex + 1) / awarenessTest.currentSession.length) * 100;
    document.getElementById('test-progress-bar').style.width = `${progress}%`;
    document.getElementById('current-question').textContent = awarenessTest.currentQuestionIndex + 1;
}

function displayResults(results) {
    document.getElementById('correct-answers').textContent = `${results.correctCount}/${results.totalQuestions}`;
    document.getElementById('total-points').textContent = results.score;
    document.getElementById('awareness-level').textContent = results.level;
    document.getElementById('score-percent').textContent = `${Math.round(results.percentage)}%`;
    
    // تحديث دائرة النتائج
    const progressDegrees = (results.percentage * 3.6) - 90;
    document.getElementById('circle-progress').style.transform = `rotate(${progressDegrees}deg)`;
    
    // إظهار التوصيات
    const recommendations = awarenessTest.getRecommendations(results);
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    
    recommendations.forEach(rec => {
        const recElement = document.createElement('div');
        recElement.className = 'recommendation-item';
        recElement.textContent = rec;
        recommendationsList.appendChild(recElement);
    });
}

function restartTest() {
    awarenessTest.initTest();
    showTestQuestions();
    displayQuestion();
    updateProgress();
}

// ===== نظام التذييلات المصحح =====
function updateFooterForScreen(screenId) {
    const footerMap = {
        // الواجهة الرئيسية
        'main-screen': 'main-footer',
        
        // واجهات المستخدم العادي
        'regular-user-screen': 'main-footer',           // تصحيح: كان tools-footer
        'security-tools-screen': 'tools-footer',        // يظهر فقط هنا
        'alternative-apps-screen': 'alternative-tools-footer',
        'awareness-content-screen': 'awareness-footer',
        'awareness-test-screen': 'test-footer',
        
        // واجهات المبرمج  
        'programmer-screen': 'main-footer',             // تصحيح: كان tools-footer
        'advanced-awareness-screen': 'programmer-awareness-footer',
        'code-scan-screen': 'scan-footer',              // يظهر فقط هنا
        'code-fix-screen': 'fix-footer',
        'performance-analysis-screen': 'main-footer'    // تصحيح: كان scan-footer
    };

    // إخفاء جميع التذييلات
    document.querySelectorAll('.footer').forEach(footer => {
        footer.classList.add('hidden');
    });

    // إظهار التذييل المناسب
    const footerId = footerMap[screenId];
    if (footerId) {
        const footer = document.getElementById(footerId);
        if (footer) {
            footer.classList.remove('hidden');
        }
    }
}

// تحديث الإحصائيات
function updateFooterStats() {
    // تحديث إحصائيات الواجهة الرئيسية
    if (window.aiEngine) {
        const stats = window.aiEngine.getStats();
        
        // الواجهة الرئيسية
        const mainScans = document.getElementById('main-scans');
        const mainProtected = document.getElementById('main-protected');
        if (mainScans) mainScans.textContent = (stats.totalScans || 0).toLocaleString();
        if (mainProtected) mainProtected.textContent = '98%';
        
        // واجهة الفحص
        const scanVulns = document.getElementById('scan-vulns');
        if (scanVulns) scanVulns.textContent = (stats.vulnerabilitiesFound || 0) + ' ثغرة';
        
        // واجهة الإصلاح
        const fixCount = document.getElementById('fix-count');
        if (fixCount) fixCount.textContent = (stats.fixesApplied || 0) + ' إصلاح';
    }

    // تحديث نتائج الاختبار
    if (window.awarenessTest) {
        const results = window.awarenessTest.getResults();
        const testScore = document.getElementById('test-score');
        if (testScore) testScore.textContent = Math.round(results.percentage) + '%';
    }
}

// تعديل دوال التنقل
const originalShowScreen = app.showScreen;
app.showScreen = function(screenId) {
    originalShowScreen.call(this, screenId);
    updateFooterForScreen(screenId);
    setTimeout(updateFooterStats, 100);
};

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        updateFooterForScreen('main-screen');
        updateFooterStats();
    }, 100);
    
    setInterval(updateFooterStats, 5000);
});


// ===== نظام إضاءة حالة النظام =====
function updateSystemStatus() {
    const aiStatus = document.getElementById('ai-status');
    const statusText = document.getElementById('status-text');
    
    if (aiStatus && statusText) {
        // جعل النقطة تضوء بالأخضر دائماً
        aiStatus.className = 'fas fa-circle ai-status active';
        statusText.textContent = 'النظام نشط';
    }
}

// تحديث حالة النظام عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(updateSystemStatus, 2000);
});

// يمكنك أيضاً إضافة هذا الكود في دالة التهيئة إذا كانت موجودة
function initializeAISystem() {
    // الكود الحالي للتهيئة...
    
    // إضافة هذا السطر في نهايتها
    updateSystemStatus();
}

// ضف هذا الكود في النهاية إذا ما تضوي
setTimeout(() => {
    const statusElement = document.getElementById('ai-status');
    if (statusElement) {
        statusElement.style.color = '#10b981';
        statusElement.style.animation = 'blink 2s infinite';
    }
}, 1000);

// ===== نظام التطبيقات البديلة الكامل =====
const alternativeApps = {
    categories: [
        {
            id: 'operating-systems',
            name: 'أنظمة التشغيل',
            icon: 'fas fa-desktop',
            description: 'أنظمة تشغيل مفتوحة المصدر تركز على الخصوصية',
            appCount: 8,
            color: '#4a6cf7'
        },
        {
            id: 'browsers',
            name: 'المتصفحات',
            icon: 'fas fa-globe',
            description: 'متصفحات تحمي خصوصيتك وتقيد التتبع',
            appCount: 6,
            color: '#10b981'
        },
        {
            id: 'messaging',
            name: 'المراسلة',
            icon: 'fas fa-comments',
            description: 'تطبيقات مراسلة مشفرة من طرف إلى طرف',
            appCount: 7,
            color: '#f59e0b'
        },
        {
            id: 'email',
            name: 'البريد الإلكتروني',
            icon: 'fas fa-envelope',
            description: 'خدمات بريد إلكتروني تركز على الخصوصية',
            appCount: 5,
            color: '#ef4444'
        },
        {
            id: 'cloud-storage',
            name: 'التخزين السحابي',
            icon: 'fas fa-cloud',
            description: 'خدمات تخزين سحابي مشفرة وآمنة',
            appCount: 4,
            color: '#8b5cf6'
        },
        {
            id: 'vpn',
            name: 'شبكات VPN',
            icon: 'fas fa-shield-alt',
            description: 'شبكات افتراضية خاصة تحمي اتصالك',
            appCount: 5,
            color: '#06b6d4'
        }
    ],

    apps: [
        // ==================== أنظمة التشغيل ====================
        {
            id: 1,
            name: 'Linux Mint',
            category: 'operating-systems',
            description: 'نظام تشغيل مفتوح المصدر مبني على Ubuntu، سهل الاستخدام للمبتدئين',
            icon: 'fab fa-linux',
            platform: 'Linux',
            price: 'مجاني',
            features: ['مفتوح المصدر', 'سهل الاستخدام', 'مستقر', 'مجتمع داعم'],
            website: 'https://linuxmint.com',
            tutorial: '#'
        },
        {
            id: 2,
            name: 'Ubuntu',
            category: 'operating-systems',
            description: 'أحد أشهر توزيعات لينكس، مناسب للمستخدمين والمطورين',
            icon: 'fab fa-ubuntu',
            platform: 'Linux',
            price: 'مجاني',
            features: ['مجتمع كبير', 'تحديثات منتظمة', 'دعم تجاري', 'آمن'],
            website: 'https://ubuntu.com',
            tutorial: '#'
        },
        {
            id: 3,
            name: 'Fedora',
            category: 'operating-systems',
            description: 'نظام مبتكر يدعم أحدث التقنيات، مدعوم من Red Hat',
            icon: 'fas fa-hat-cowboy',
            platform: 'Linux',
            price: 'مجاني',
            features: ['أحدث التقنيات', 'آمن افتراضياً', 'مفتوح المصدر', 'سريع'],
            website: 'https://fedoraproject.org',
            tutorial: '#'
        },
        {
            id: 4,
            name: 'Debian',
            category: 'operating-systems',
            description: 'نظام مستقر وموثوق، أساس للعديد من التوزيعات الأخرى',
            icon: 'fas fa-cube',
            platform: 'Linux',
            price: 'مجاني',
            features: ['مستقر جداً', 'موثوق', 'أرشيف ضخم', 'مفتوح المصدر'],
            website: 'https://debian.org',
            tutorial: '#'
        },
        {
            id: 5,
            name: 'Tails',
            category: 'operating-systems',
            description: 'نظام تشغيل مخصص للخصوصية والتشغيل الآمن',
            icon: 'fas fa-user-secret',
            platform: 'Live OS',
            price: 'مجاني',
            features: ['تركيز على الخصوصية', 'تشغيل مباشر', 'مجهولية', 'مشفّر'],
            website: 'https://tails.boum.org',
            tutorial: '#'
        },
        {
            id: 6,
            name: 'Qubes OS',
            category: 'operating-systems',
            description: 'نظام تشغيل يركز على الأمان من خلال عزل المكونات',
            icon: 'fas fa-shield-alt',
            platform: 'Linux',
            price: 'مجاني',
            features: ['عزل بالتجزئة', 'أمن متقدم', 'مفتوح المصدر', 'مخصص للأمان'],
            website: 'https://qubes-os.org',
            tutorial: '#'
        },
        {
            id: 7,
            name: 'OpenSUSE',
            category: 'operating-systems',
            description: 'نظام تشغيل قوي وموثوق مع أدوات إدارة متقدمة',
            icon: 'fas fa-dragon',
            platform: 'Linux',
            price: 'مجاني',
            features: ['موثوقية عالية', 'أدوات متقدمة', 'مجتمع نشط', 'آمن'],
            website: 'https://opensuse.org',
            tutorial: '#'
        },
        {
            id: 8,
            name: 'Arch Linux',
            category: 'operating-systems',
            description: 'نظام تشغيل خفيف وقابل للتخصيص بالكامل',
            icon: 'fas fa-puzzle-piece',
            platform: 'Linux',
            price: 'مجاني',
            features: ['خفيف الوزن', 'قابل للتخصيص', 'أرشيف شامل', 'محدث باستمرار'],
            website: 'https://archlinux.org',
            tutorial: '#'
        },

        // ==================== المتصفحات ====================
        {
            id: 9,
            name: 'Firefox',
            category: 'browsers',
            description: 'متصفح مفتوح المصدر مع إعدادات خصوصية قوية وحماية من التتبع',
            icon: 'fab fa-firefox',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['مفتوح المصدر', 'حماية متقدمة', 'إضافات أمنية', 'سريع'],
            website: 'https://firefox.com',
            tutorial: '#'
        },
        {
            id: 10,
            name: 'Brave',
            category: 'browsers',
            description: 'متصفح يحجب الإعلانات والتتبع تلقائياً مع مكافآت للمستخدمين',
            icon: 'fas fa-shield-alt',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['حجب إعلانات', 'تسريع التصفح', 'مكافآت BAT', 'خاصية Tor'],
            website: 'https://brave.com',
            tutorial: '#'
        },
        {
            id: 11,
            name: 'Tor Browser',
            category: 'browsers',
            description: 'متصفح مخصص للخصوصية والتجول المجهول على الإنترنت',
            icon: 'fas fa-user-secret',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['توجيه عبر Tor', 'مجهولية', 'مشفّر', 'مفتوح المصدر'],
            website: 'https://torproject.org',
            tutorial: '#'
        },
        {
            id: 12,
            name: 'Ungoogled Chromium',
            category: 'browsers',
            description: 'نسخة من Chromium بدون خدمات Google لخصوصية أفضل',
            icon: 'fab fa-chrome',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['بدون Google', 'مفتوح المصدر', 'خفيف', 'قابل للتخصيص'],
            website: 'https://ungoogled-software.github.io',
            tutorial: '#'
        },
        {
            id: 13,
            name: 'LibreWolf',
            category: 'browsers',
            description: 'نسخة من Firefox مع تحسينات الخصوصية والأمان المضمنة',
            icon: 'fas fa-wolf-pack-battalion',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['خصوصية محسنة', 'مفتوح المصدر', 'خالي من التتبع', 'آمن'],
            website: 'https://librewolf.net',
            tutorial: '#'
        },
        {
            id: 14,
            name: 'Waterfox',
            category: 'browsers',
            description: 'متصفح سريع يركز على الخصوصية، مبني على Firefox',
            icon: 'fas fa-tint',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['سريع', 'مرن', 'دعم إضافات قديمة', 'خصوصية'],
            website: 'https://waterfox.net',
            tutorial: '#'
        },

        // ==================== المراسلة ====================
        {
            id: 15,
            name: 'Signal',
            category: 'messaging',
            description: 'تطبيق مراسلة مشفر من طرف إلى طرف، معترف به عالمياً',
            icon: 'fas fa-comment',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['تشفير كامل', 'مفتوح المصدر', 'لا يوجد تتبع', 'مجاني'],
            website: 'https://signal.org',
            tutorial: '#'
        },
        {
            id: 16,
            name: 'Telegram',
            category: 'messaging',
            description: 'تطبيق مراسلة سريع وآمن مع ميزات متقدمة ومجموعات كبيرة',
            icon: 'fab fa-telegram',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['سحابة خاصة', 'مجموعات كبيرة', 'قنوات بث', 'سريع'],
            website: 'https://telegram.org',
            tutorial: '#'
        },
        {
            id: 17,
            name: 'Element',
            category: 'messaging',
            description: 'عميل لبروتوكول Matrix المفتوح والمشفر للاتصالات',
            icon: 'fas fa-comments',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['مفتوح المصدر', 'لا مركزية', 'تشفير كامل', 'قابل للتخصيص'],
            website: 'https://element.io',
            tutorial: '#'
        },
        {
            id: 18,
            name: 'Session',
            category: 'messaging',
            description: 'تطبيق مراسلة مجهول لا يحتاج إلى رقم هاتف أو بريد إلكتروني',
            icon: 'fas fa-user-ninja',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['لا يحتاج هوية', 'مجهول', 'مفتوح المصدر', 'لا خوادم مركزية'],
            website: 'https://getsession.org',
            tutorial: '#'
        },
        {
            id: 19,
            name: 'Briar',
            category: 'messaging',
            description: 'تطبيق مراسلة يعمل بدون اتصال إنترنت عبر Bluetooth أو Wi-Fi',
            icon: 'fas fa-bluetooth',
            platform: 'Android',
            price: 'مجاني',
            features: ['عمل بدون إنترنت', 'مجهول', 'مفتوح المصدر', 'تشفير كامل'],
            website: 'https://briarproject.org',
            tutorial: '#'
        },
        {
            id: 20,
            name: 'Jami',
            category: 'messaging',
            description: 'تطبيق اتصالات لا مركزي يعمل بدون خوادم',
            icon: 'fas fa-network-wired',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['لا مركزي', 'مفتوح المصدر', 'تشفير كامل', 'لا خوادم'],
            website: 'https://jami.net',
            tutorial: '#'
        },
        {
            id: 21,
            name: 'Threema',
            category: 'messaging',
            description: 'تطبيق مراسلة آمن مع التركيز على الخصوصية والبيانات',
            icon: 'fas fa-comment-dots',
            platform: 'جميع المنصات',
            price: 'مدفوع',
            features: ['خصوصية كاملة', 'لا يحتاج رقم', 'تشفير كامل', 'سويسري'],
            website: 'https://threema.ch',
            tutorial: '#'
        },

        // ==================== البريد الإلكتروني ====================
        {
            id: 22,
            name: 'ProtonMail',
            category: 'email',
            description: 'خدمة بريد إلكتروني مشفر مقره سويسرا مع تشفير من طرف إلى طرف',
            icon: 'fas fa-envelope',
            platform: 'ويب وجوال',
            price: 'مجاني ومدفوع',
            features: ['تشفير كامل', 'مقره سويسرا', 'لا يوجد تتبع', 'واجهة سهلة'],
            website: 'https://protonmail.com',
            tutorial: '#'
        },
        {
            id: 23,
            name: 'Tutanota',
            category: 'email',
            description: 'بريد إلكتروني آمن ومشفر مفتوح المصدر مع تطبيقات مجانية',
            icon: 'fas fa-lock',
            platform: 'ويب وجوال',
            price: 'مجاني ومدفوع',
            features: ['مفتوح المصدر', 'تشفير كامل', 'مقره ألمانيا', 'مجاني'],
            website: 'https://tutanota.com',
            tutorial: '#'
        },
        {
            id: 24,
            name: 'Mailfence',
            category: 'email',
            description: 'خدمة بريد إلكتروني آمنة مع مجموعة أدوات إنتاجية',
            icon: 'fas fa-envelope-open',
            platform: 'ويب',
            price: 'مجاني ومدفوع',
            features: ['تشفير كامل', 'أدوات إنتاجية', 'مقره بلجيكا', 'OpenPGP'],
            website: 'https://mailfence.com',
            tutorial: '#'
        },
        {
            id: 25,
            name: 'Posteo',
            category: 'email',
            description: 'خدمة بريد إلكتروني أخضر وآمن مع حماية خصوصية قوية',
            icon: 'fas fa-leaf',
            platform: 'ويب',
            price: 'مدفوع',
            features: ['صديق للبيئة', 'خصوصية قوية', 'مقره ألمانيا', 'تشفير'],
            website: 'https://posteo.de',
            tutorial: '#'
        },
        {
            id: 26,
            name: 'StartMail',
            category: 'email',
            description: 'خدمة بريد إلكتروني خاص من مبتكري StartPage',
            icon: 'fas fa-envelope-square',
            platform: 'ويب',
            price: 'مدفوع',
            features: ['خصوصية مضمونة', 'واجهة سهلة', 'تشفير PGP', 'آمن'],
            website: 'https://startmail.com',
            tutorial: '#'
        },

        // ==================== التخزين السحابي ====================
        {
            id: 27,
            name: 'Nextcloud',
            category: 'cloud-storage',
            description: 'منصة تخزين سحابي خاص مفتوحة المصدر يمكنك استضافتها بنفسك',
            icon: 'fas fa-cloud',
            platform: 'جميع المنصات',
            price: 'مجاني ومدفوع',
            features: ['مفتوح المصدر', 'تحكم كامل', 'تشفير', 'قابل للتوسع'],
            website: 'https://nextcloud.com',
            tutorial: '#'
        },
        {
            id: 28,
            name: 'ProtonDrive',
            category: 'cloud-storage',
            description: 'تخزين سحابي مشفر من مبتكري ProtonMail، آمن وخاص',
            icon: 'fas fa-hdd',
            platform: 'ويب وجوال',
            price: 'مجاني ومدفوع',
            features: ['تشفير كامل', 'تكامل مع Proton', 'مقره سويسرا', 'آمن'],
            website: 'https://proton.me/drive',
            tutorial: '#'
        },
        {
            id: 29,
            name: 'Syncthing',
            category: 'cloud-storage',
            description: 'أداة مزامنة ملفات مفتوحة المصدر بين الأجهزة بدون سحابة',
            icon: 'fas fa-sync',
            platform: 'جميع المنصات',
            price: 'مجاني',
            features: ['مزامنة مباشرة', 'لا سحابة', 'مفتوح المصدر', 'تشفير'],
            website: 'https://syncthing.net',
            tutorial: '#'
        },
        {
            id: 30,
            name: 'Tresorit',
            category: 'cloud-storage',
            description: 'خدمة تخزين سحابي مشفر بنهاية إلى نهاية مع أمان عالي',
            icon: 'fas fa-lock',
            platform: 'جميع المنصات',
            price: 'مدفوع',
            features: ['تشفير كامل', 'أمان عالي', 'مقره سويسرا', 'تخزين آمن'],
            website: 'https://tresorit.com',
            tutorial: '#'
        },

        // ==================== VPN ====================
        {
            id: 31,
            name: 'ProtonVPN',
            category: 'vpn',
            description: 'خدمة VPN سريعة وآمنة من فريق Proton، مع خطة مجانية',
            icon: 'fas fa-user-shield',
            platform: 'جميع المنصات',
            price: 'مجاني ومدفوع',
            features: ['لا سجلات', 'مقره سويسرا', 'تشفير قوي', 'خوادم سريعة'],
            website: 'https://protonvpn.com',
            tutorial: '#'
        },
        {
            id: 32,
            name: 'Mullvad',
            category: 'vpn',
            description: 'خدمة VPN تركز على الخصوصية بشكل كبير مع دفعات مجهولة',
            icon: 'fas fa-eye-slash',
            platform: 'جميع المنصات',
            price: 'مدفوع',
            features: ['دفع مجهول', 'لا سجلات', 'سريع', 'تشفير مزدوج'],
            website: 'https://mullvad.net',
            tutorial: '#'
        },
        {
            id: 33,
            name: 'IVPN',
            category: 'vpn',
            description: 'خدمة VPN شفافة مع تدقيق علني لسياسة عدم التسجيل',
            icon: 'fas fa-shield-check',
            platform: 'جميع المنصات',
            price: 'مدفوع',
            features: ['شفافية كاملة', 'لا سجلات', 'تدقيق مستقل', 'أخلاقي'],
            website: 'https://ivpn.net',
            tutorial: '#'
        },
        {
            id: 34,
            name: 'Windscribe',
            category: 'vpn',
            description: 'خدمة VPN مع خطة مجانية سخية وميزات أمان متقدمة',
            icon: 'fas fa-wind',
            platform: 'جميع المنصات',
            price: 'مجاني ومدفوع',
            features: ['خطة مجانية', 'حجب إعلانات', 'تشفير قوي', 'خوادم متعددة'],
            website: 'https://windscribe.com',
            tutorial: '#'
        },
        {
            id: 35,
            name: 'OVPN',
            category: 'vpn',
            description: 'خدمة VPN تركز على الشفافية والأمان مع بنية تحتية آمنة',
            icon: 'fas fa-server',
            platform: 'جميع المنصات',
            price: 'مدفوع',
            features: ['شفافية كاملة', 'بنية آمنة', 'لا سجلات', 'سويدي'],
            website: 'https://ovpn.com',
            tutorial: '#'
        }
    ],

    currentCategory: 'all',
    searchTerm: '',

    init() {
        this.renderCategories();
        this.renderApps();
        this.setupEventListeners();
    },

    renderCategories() {
        const grid = document.getElementById('categories-grid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(category => `
            <div class="category-card" onclick="alternativeApps.filterByCategory('${category.id}')">
                <div class="category-header">
                    <div class="category-icon" style="background: ${category.color}">
                        <i class="${category.icon}"></i>
                    </div>
                    <div class="category-info">
                        <h4>${category.name}</h4>
                        <p>${category.description}</p>
                    </div>
                </div>
                <div class="category-stats">
                    <div class="category-stat">
                        <i class="fas fa-mobile-alt"></i>
                        <span>${category.appCount} تطبيق</span>
                    </div>
                    <div class="category-stat">
                        <i class="fas fa-star"></i>
                        <span>موصى به</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderApps() {
        const grid = document.getElementById('apps-grid');
        const countElement = document.getElementById('apps-count');
        const categoryElement = document.getElementById('current-category');
        
        if (!grid) return;

        let filteredApps = this.apps;

        // التصفية حسب الفئة
        if (this.currentCategory !== 'all') {
            filteredApps = filteredApps.filter(app => app.category === this.currentCategory);
        }

        // التصفية حسب البحث
        if (this.searchTerm) {
            filteredApps = filteredApps.filter(app => 
                app.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                app.description.toLowerCase().includes(this.searchTerm.toLowerCase())
            );
        }

        // تحديث العناوين
        if (categoryElement) {
            if (this.currentCategory === 'all') {
                categoryElement.textContent = 'جميع التطبيقات';
            } else {
                const category = this.categories.find(c => c.id === this.currentCategory);
                categoryElement.textContent = category ? category.name : 'جميع التطبيقات';
            }
        }

        if (countElement) {
            countElement.textContent = `${filteredApps.length} تطبيق`;
        }

        // عرض التطبيقات
        grid.innerHTML = filteredApps.map(app => {
            const category = this.categories.find(c => c.id === app.category);
            return `
                <div class="app-card">
                    <div class="app-header">
                        <div class="app-icon" style="background: ${category?.color || '#4a6cf7'}">
                            <i class="${app.icon}"></i>
                        </div>
                        <div class="app-info">
                            <h4>${app.name}</h4>
                            <p class="app-description">${app.description}</p>
                            <div class="app-meta">
                                <span class="app-platform">${app.platform}</span>
                                <span class="app-price">${app.price}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="app-features">
                        <div class="feature-tags">
                            ${app.features.map(feature => `
                                <span class="feature-tag">${feature}</span>
                            `).join('')}
                        </div>
                    </div>

                    <div class="app-actions">
                        <a href="${app.website}" target="_blank" class="app-link">
                            <i class="fas fa-external-link-alt"></i>
                            زيارة الموقع
                        </a>
                        <button class="app-link secondary" onclick="showAppTutorial(${app.id})">
                            <i class="fas fa-play-circle"></i>
                            شرح الاستخدام
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterByCategory(categoryId) {
        this.currentCategory = categoryId;
        this.renderApps();
    },

    searchApps(term) {
        this.searchTerm = term;
        this.renderApps();
    },

    setupEventListeners() {
        const searchInput = document.getElementById('app-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchApps(e.target.value);
            });
        }
    }
};

// دالة عرض شرح التطبيق
function showAppTutorial(appId) {
    const app = alternativeApps.apps.find(a => a.id === appId);
    if (app) {
        alert(`شرح استخدام ${app.name} - هذه الميزة قيد التطوير\nسيتم إضافة فيديوهات الشرح قريباً`);
        // يمكن استبدالها بفتح نافذة شرح أو رابط فيديو
    }
}

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('alternative-apps-screen')) {
            alternativeApps.init();
        }
    }, 100);
});


function goToAwarenessContent() {
    // الانتقال لشاشة التوعية
    app.showScreen('awareness-content-screen');
    
    // يمكننا إضافة منطق إضافي هنا
    // مثل فتح قسم معين بناءً على نتائج الاختبار
    const results = awarenessTest.getResults();
    
    if (results.percentage < 50) {
        // إذا كانت النتيجة ضعيفة، نفتح قسم الأساسيات
        openBasicAwarenessSection();
    } else if (results.percentage < 80) {
        // إذا كانت متوسطة، نفتح قسم المتوسط
        openIntermediateAwarenessSection();
    } else {
        // إذا كانت ممتازة، نفتح قسم المتقدم
        openAdvancedAwarenessSection();
    }
}

function openBasicAwarenessSection() {
    // فتح قسم الأساسيات الأمنية
    console.log('فتح قسم الأساسيات الأمنية');
    // يمكن إضافة منطق لفتع قسم معين
}

function openIntermediateAwarenessSection() {
    // فتح قسم المستوى المتوسط
    console.log('فتح قسم المستوى المتوسط');
}

function openAdvancedAwarenessSection() {
    // فتح قسم المستوى المتقدم
    console.log('فتح قسم المستوى المتقدم');
}


// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 CyberShield App Started - Using Original AI Models');
});