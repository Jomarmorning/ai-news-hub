/**
 * Auth 页面脚本 - 登录/注册
 */

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuthTabs();
    initForms();
    initPasswordToggle();
    initPasswordStrength();
    checkRedirect();
});

// 标签切换
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // 更新标签状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 切换表单
            if (targetTab === 'login') {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
            } else {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
            }

            // 清除之前的错误信息
            clearErrors();
        });
    });
}

// 表单提交
function initForms() {
    // 登录表单
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = loginForm.querySelector('input[name="remember"]').checked;

        // 验证
        if (!validateEmail(email)) {
            showError('loginEmail', '请输入有效的邮箱地址');
            return;
        }

        if (password.length < 6) {
            showError('loginPassword', '密码至少需要6位');
            return;
        }

        // 模拟登录
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);

        try {
            await simulateAuthRequest('login', { email, password, remember });

            // 保存登录状态
            saveAuthState({ email, username: email.split('@')[0] });

            showToast('✅ 登录成功！');

            // 跳转
            setTimeout(() => {
                const redirect = getUrlParam('redirect') || 'openclaw.html';
                window.location.href = redirect;
            }, 1000);
        } catch (error) {
            showToast('❌ ' + error.message);
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // 注册表单
    const registerForm = document.getElementById('registerForm');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const username = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agree = registerForm.querySelector('input[name="agree"]').checked;

        // 验证
        if (username.length < 3) {
            showError('registerName', '用户名至少需要3个字符');
            return;
        }

        if (!validateEmail(email)) {
            showError('registerEmail', '请输入有效的邮箱地址');
            return;
        }

        if (password.length < 8) {
            showError('registerPassword', '密码至少需要8位');
            return;
        }

        if (password !== confirmPassword) {
            showError('confirmPassword', '两次输入的密码不一致');
            return;
        }

        if (!agree) {
            showToast('❌ 请同意服务条款和隐私政策');
            return;
        }

        // 模拟注册
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        setLoading(submitBtn, true);

        try {
            await simulateAuthRequest('register', { username, email, password });

            // 保存登录状态
            saveAuthState({ email, username });

            showToast('✅ 注册成功！欢迎加入 OpenClaw Hub');

            // 跳转
            setTimeout(() => {
                window.location.href = 'openclaw.html';
            }, 1500);
        } catch (error) {
            showToast('❌ ' + error.message);
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// 密码显示/隐藏切换
function initPasswordToggle() {
    const toggles = document.querySelectorAll('.toggle-password');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.dataset.target;
            const input = document.getElementById(targetId);
            const icon = toggle.querySelector('.eye-icon');

            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
            }
        });
    });
}

// 密码强度检测
function initPasswordStrength() {
    const passwordInput = document.getElementById('registerPassword');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');

    if (!passwordInput) return;

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = calculatePasswordStrength(password);

        strengthBar.className = 'strength-bar';

        if (password.length === 0) {
            strengthText.textContent = '密码强度';
        } else if (strength < 30) {
            strengthBar.classList.add('weak');
            strengthText.textContent = '弱';
            strengthText.style.color = '#ef4444';
        } else if (strength < 60) {
            strengthBar.classList.add('medium');
            strengthText.textContent = '中';
            strengthText.style.color = '#f59e0b';
        } else {
            strengthBar.classList.add('strong');
            strengthText.textContent = '强';
            strengthText.style.color = '#10b981';
        }
    });
}

// 计算密码强度
function calculatePasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;
    if (password.length >= 16) strength += 10;

    return strength;
}

// 检查是否需要跳转
function checkRedirect() {
    const redirect = getUrlParam('redirect');
    if (redirect) {
        const loginTab = document.querySelector('[data-tab="login"]');
        if (loginTab) {
            loginTab.click();
        }
    }
}

// 社交登录
function socialLogin(provider) {
    showToast(`🔑 正在使用 ${provider} 登录...`);

    // 模拟社交登录
    setTimeout(() => {
        saveAuthState({
            email: `user@${provider}.com`,
            username: `${provider}User`,
            provider: provider
        });

        showToast('✅ 登录成功！');

        setTimeout(() => {
            const redirect = getUrlParam('redirect') || 'openclaw.html';
            window.location.href = redirect;
        }, 1000);
    }, 1500);
}

// 显示忘记密码
function showForgotPassword() {
    const email = document.getElementById('loginEmail').value;

    if (!email || !validateEmail(email)) {
        showToast('❌ 请先输入有效的邮箱地址');
        document.getElementById('loginEmail').focus();
        return;
    }

    showToast('📧 密码重置链接已发送至 ' + email);
}

// 显示服务条款
function showTerms() {
    alert('服务条款\n\n1. 用户需遵守相关法律法规\n2. 禁止滥用自动化工具进行非法活动\n3. Pro 技能仅供个人使用，禁止转售\n4. 我们保留随时修改条款的权利');
}

// 显示隐私政策
function showPrivacy() {
    alert('隐私政策\n\n1. 我们仅收集必要的用户信息\n2. 用户数据将进行加密存储\n3. 我们不会向第三方出售用户数据\n4. 用户有权删除自己的账户和数据');
}

// 验证邮箱格式
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// 显示错误
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const wrapper = input.closest('.input-wrapper');

    wrapper.classList.add('error');

    // 移除之前的错误提示
    const existingError = wrapper.parentElement.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }

    // 添加错误提示
    const error = document.createElement('div');
    error.className = 'form-error';
    error.textContent = message;
    wrapper.parentElement.appendChild(error);
}

// 清除错误
function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.input-wrapper.error').forEach(el => el.classList.remove('error'));
}

// 设置加载状态
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = '<span>处理中...</span>';
    } else {
        button.classList.remove('loading');
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
        }
    }
}

// 模拟认证请求
function simulateAuthRequest(type, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 模拟网络延迟
            if (Math.random() > 0.1) { // 90% 成功率
                console.log(`${type} success:`, data);
                resolve({ success: true, data });
            } else {
                reject(new Error('网络错误，请稍后重试'));
            }
        }, 1500);
    });
}

// 保存登录状态
function saveAuthState(userData) {
    const authState = {
        isLoggedIn: true,
        user: userData,
        loginTime: Date.now()
    };
    localStorage.setItem('openclaw_auth', JSON.stringify(authState));
}

// 获取登录状态
function getAuthState() {
    const auth = localStorage.getItem('openclaw_auth');
    return auth ? JSON.parse(auth) : null;
}

// 退出登录
function logout() {
    localStorage.removeItem('openclaw_auth');
    window.location.href = 'auth.html';
}

// 获取 URL 参数
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// 显示 Toast
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        padding: 16px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        color: var(--text-primary);
        font-size: 0.95rem;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
`;
document.head.appendChild(style);
