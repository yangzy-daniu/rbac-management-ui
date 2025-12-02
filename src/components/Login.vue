<template>
    <div class="login-register-container">
        <!-- 背景装饰 -->
        <div class="decoration">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
        </div>

        <!-- 主卡片 -->
        <div class="main-card" :class="{ 'right-panel-active': isRegister }">
            <!-- 登录表单 -->
            <div class="form-container sign-in-container">
                <div class="form-content">
                    <div class="logo-area">
                        <div class="logo">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#4F46E5"/>
                                <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#4F46E5"/>
                            </svg>
                        </div>
                        <h1 class="welcome-text">欢迎回来</h1>
                        <p class="subtitle">请登录您的账户</p>
                    </div>

                    <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @submit.prevent>
                        <el-form-item prop="username">
                            <el-input
                                    v-model="loginForm.username"
                                    placeholder="用户名 / 邮箱"
                                    size="large"
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><User /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input
                                    v-model="loginForm.password"
                                    type="password"
                                    placeholder="密码"
                                    size="large"
                                    show-password
                                    @keyup.enter="handleLogin"
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><Lock /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <div class="form-options">
                            <el-checkbox v-model="rememberMe" label="记住我" />
                            <a href="javascript:;" class="forgot-password" @click="showForgotPassword">
                                忘记密码？
                            </a>
                        </div>

                        <el-form-item>
                            <el-button
                                    type="primary"
                                    size="large"
                                    class="submit-btn"
                                    :loading="loginLoading"
                                    @click="handleLogin"
                            >
                                {{ loginLoading ? '登录中...' : '登录' }}
                            </el-button>
                        </el-form-item>

                        <div class="divider">
                            <span>或</span>
                        </div>

                        <div class="social-login">
                            <el-button class="social-btn" @click="socialLogin('github')">
                                <svg class="social-icon" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                GitHub
                            </el-button>
                            <el-button class="social-btn" @click="socialLogin('wechat')">
                                <svg class="social-icon" viewBox="0 0 24 24">
                                    <path d="M9.516 14.016c1.078 0 2.109-0.328 3-0.891l1.359 0.797 1.594-0.938-0.797-1.359c0.563-0.891 0.891-1.922 0.891-3 0-2.766-2.25-5.016-5.016-5.016s-5.016 2.25-5.016 5.016 2.25 5.016 5.016 5.016zM9.516 4.031c3.891 0 7.031 3.141 7.031 7.016s-3.141 7.031-7.031 7.031c-1.031 0-2.016-0.234-2.906-0.656l-3.813 2.203 1.313-3.75c-0.75-0.797-1.219-1.828-1.219-2.953 0-3.891 3.141-7.031 7.031-7.031zM20.016 14.016c1.078 0 2.109-0.328 3-0.891l1.359 0.797 1.594-0.938-0.797-1.359c0.563-0.891 0.891-1.922 0.891-3 0-2.766-2.25-5.016-5.016-5.016s-5.016 2.25-5.016 5.016 2.25 5.016 5.016 5.016z"/>
                                </svg>
                                微信
                            </el-button>
                        </div>
                    </el-form>
                </div>
            </div>

            <!-- 注册表单 -->
            <div class="form-container sign-up-container">
                <div class="form-content">
                    <div class="logo-area">
                        <div class="logo">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#10B981"/>
                            </svg>
                        </div>
                        <h1 class="welcome-text">创建账户</h1>
                        <p class="subtitle">开始您的旅程</p>
                    </div>

                    <el-form :model="registerForm" :rules="registerRules" ref="registerFormRef" @submit.prevent>
                        <el-form-item prop="username">
                            <el-input
                                    v-model="registerForm.username"
                                    placeholder="用户名"
                                    size="large"
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><User /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item prop="phone">
                            <el-input
                                    v-model="registerForm.phone"
                                    placeholder="手机号码"
                                    size="large"
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><Iphone /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input
                                    v-model="registerForm.password"
                                    type="password"
                                    placeholder="密码（至少6位）"
                                    size="large"
                                    show-password
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><Lock /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item prop="confirmPassword">
                            <el-input
                                    v-model="registerForm.confirmPassword"
                                    type="password"
                                    placeholder="确认密码"
                                    size="large"
                                    show-password
                                    class="custom-input"
                            >
                                <template #prefix>
                                    <el-icon><Lock /></el-icon>
                                </template>
                            </el-input>
                        </el-form-item>

                        <el-form-item>
                            <el-checkbox v-model="agreeTerms">
                                我已阅读并同意
                                <a href="javascript:;" class="terms-link" @click="showTerms">《服务条款》</a>
                            </el-checkbox>
                        </el-form-item>

                        <el-form-item>
                            <el-button
                                    type="success"
                                    size="large"
                                    class="submit-btn"
                                    :loading="registerLoading"
                                    @click="handleRegister"
                                    :disabled="!agreeTerms"
                            >
                                {{ registerLoading ? '注册中...' : '立即注册' }}
                            </el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>

            <!-- 切换面板 -->
            <div class="overlay-container">
                <div class="overlay">
                    <div class="overlay-panel overlay-left">
                        <h1 class="overlay-title">已有账户？</h1>
                        <p class="overlay-text">请使用您的个人信息登录</p>
                        <el-button class="ghost-btn" @click="togglePanel(false)">
                            去登录
                        </el-button>
                    </div>
                    <div class="overlay-panel overlay-right">
                        <h1 class="overlay-title">还没有账户？</h1>
                        <p class="overlay-text">立即注册，开启全新体验</p>
                        <el-button class="ghost-btn" @click="togglePanel(true)">
                            去注册
                        </el-button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 演示账号提示 -->
        <div class="demo-hint">
            <p>演示账号：admin / 123456</p>
        </div>

        <!-- 忘记密码对话框 -->
        <el-dialog
                v-model="forgotPasswordDialog"
                title="重置密码"
                width="400px"
                :close-on-click-modal="false"
        >
            <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef">
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="forgotPasswordDialog = false">取消</el-button>
                    <el-button type="primary" @click="handleForgotPassword">发送重置邮件</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Message, Iphone } from '@element-plus/icons-vue'
import { login, register, forgotPassword } from '@/api/author'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const isRegister = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)
const rememberMe = ref(false)
const agreeTerms = ref(false)
const forgotPasswordDialog = ref(false)

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()
const forgotFormRef = ref()

// 表单数据
const loginForm = reactive({
    username: 'superAdmin',
    password: '123456'
})

const registerForm = reactive({
    username: '',
    phone: '',
    password: '',
    confirmPassword: ''
})

const forgotForm = reactive({
    email: ''
})

// 验证规则
const loginRules = {
    username: [
        { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ]
}

const registerRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        { validator: validateConfirmPassword, trigger: 'blur' }
    ]
}

const forgotRules = {
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ]
}

// 自定义验证规则
function validateConfirmPassword(rule, value, callback) {
    if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

// 面板切换
function togglePanel(register) {
    isRegister.value = register
}

// 登录处理
const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
        const valid = await loginFormRef.value.validate()
        if (!valid) return

        loginLoading.value = true
        const response = await login(loginForm)

        if (response.data.success) {
            ElMessage.success('登录成功')
            // 存储token和用户信息
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('userInfo', JSON.stringify(response.data.user))

            // 记住我功能
            if (rememberMe.value) {
                localStorage.setItem('rememberedUser', loginForm.username)
            }

            // 跳转到首页
            await router.push('/home')
        } else {
            ElMessage.error(response.data.message || '登录失败')
        }
    } catch (error) {
        if (error.response) {
            ElMessage.error(error.response.data.message || '登录失败')
        } else {
            ElMessage.error('登录失败，请检查网络连接')
        }
        console.error('Login error:', error)
    } finally {
        loginLoading.value = false
    }
}

// 注册处理
const handleRegister = () => {
    if (!registerFormRef.value) return

    if (!agreeTerms.value) {
        ElMessage.warning('请先阅读并同意服务条款')
        return
    }

    try {
        const valid = registerFormRef.value.validate()
        if (!valid) return

        registerLoading.value = true

        // 构建注册数据
        const registerData = {
            username: registerForm.username,
            phone: registerForm.phone,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword
        }

        console.log('准备调 register 接口', registerData)
        const response = register(registerData)

        if (response.data.success) {
            ElMessage.success('注册成功，请登录')

            // 自动填充登录表单
            loginForm.username = registerForm.username
            loginForm.password = registerForm.password

            // 切换到登录面板
            togglePanel(false)

            // 重置注册表单
            registerFormRef.value.resetFields()
            agreeTerms.value = false
        } else {
            ElMessage.error(response.data.message || '注册失败')
        }
    } catch (error) {
        if (error.response) {
            ElMessage.error(error.response.data.message || '注册失败')
        } else {
            ElMessage.error('注册失败，请检查网络连接')
        }
        console.error('Register error:', error)
    } finally {
        registerLoading.value = false
    }
}

// 忘记密码
const showForgotPassword = () => {
    forgotPasswordDialog.value = true
}

const handleForgotPassword = async () => {
    if (!forgotFormRef.value) return

    try {
        const valid = await forgotFormRef.value.validate()
        if (!valid) return

        const response = await forgotPassword({email: forgotForm.email})

        if (response.data.success) {
            ElMessage.success('重置邮件已发送，请查收')
            forgotPasswordDialog.value = false
            forgotFormRef.value.resetFields()
        } else {
            ElMessage.error(response.data.message || '发送失败')
        }
    } catch (error) {
        if (error.response) {
            ElMessage.error(error.response.data.message || '发送失败')
        } else {
            ElMessage.error('操作失败，请检查网络连接')
        }
        console.error('Forgot password error:', error)
    }
}

// 回车键处理函数
const handleEnterKey = (event) => {
    if (event.key === 'Enter' && !loginLoading.value && !registerLoading.value) {
        if (!isRegister.value) {
            // 在登录页面按回车
            handleLogin()
        } else {
            // 在注册页面按回车
            if (agreeTerms.value) {
                handleRegister()
            }
        }
    }
}

// 添加和移除事件监听器
onMounted(() => {
    // 页面加载时检查记住的用户
    checkRememberedUser()
    document.addEventListener('keyup', handleEnterKey)
})

onUnmounted(() => {
    document.removeEventListener('keyup', handleEnterKey)
})

// 社交登录
const socialLogin = (platform) => {
    ElMessage.info(`${platform}登录功能开发中`)
}

// 显示服务条款
const showTerms = () => {
    ElMessageBox.alert(
            `<div class="terms-content">
            <h3>服务条款</h3>
            <p>1. 用户注册成功后，将获得一个账户及相应的密码，该用户账号和密码由用户负责保管</p>
            <p>2. 用户不应将其账号、密码转让或出借予他人使用</p>
            <p>3. 用户对利用该账户所进行的一切活动负全部责任</p>
            <p>4. 用户在使用服务过程中，必须遵循相关法律法规</p>
            <p>5. 本公司保留随时修改或中断服务而不需通知用户的权利</p>
        </div>`,
            {
                dangerouslyUseHTMLString: true,
                customClass: 'terms-dialog',
                confirmButtonText: '同意并继续'
            }
    )
}

// 检查记住的用户
const checkRememberedUser = () => {
    const rememberedUser = localStorage.getItem('rememberedUser')
    if (rememberedUser) {
        loginForm.username = rememberedUser
        rememberMe.value = true
    }
}

</script>

<style scoped>
.login-register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    position: relative;
    overflow: hidden;
}

.decoration {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -150px;
}

.circle-2 {
    width: 200px;
    height: 200px;
    bottom: -100px;
    left: -100px;
}

.circle-3 {
    width: 150px;
    height: 150px;
    bottom: 20%;
    right: 15%;
}

.main-card {
    background-color: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 900px;
    min-height: 600px;
    position: relative;
    overflow: hidden;
    display: flex;
    z-index: 1;
}

.form-container {
    padding: 48px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    transition: all 0.6s ease-in-out;
}

.sign-in-container {
    transform: translateX(0);
}

.sign-up-container {
    transform: translateX(100%);
    opacity: 0;
    z-index: 1;
}

.main-card.right-panel-active .sign-in-container {
    transform: translateX(-100%);
    opacity: 0;
}

.main-card.right-panel-active .sign-up-container {
    transform: translateX(0);
    opacity: 1;
}

.form-content {
    max-width: 400px;
    width: 100%;
    margin: 0 auto;
}

.logo-area {
    text-align: center;
    margin-bottom: 40px;
}

.logo {
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo svg {
    width: 32px;
    height: 32px;
}

.sign-up-container .logo {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
}

.welcome-text {
    font-size: 28px;
    font-weight: 700;
    color: #1F2937;
    margin: 0 0 8px;
}

.subtitle {
    font-size: 14px;
    color: #6B7280;
    margin: 0;
}

.custom-input {
    border-radius: 12px;
}

.custom-input :deep(.el-input__wrapper) {
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    transition: all 0.3s ease;
}

.custom-input :deep(.el-input__wrapper:hover),
.custom-input :deep(.el-input__wrapper.is-focus) {
    border-color: #4F46E5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.custom-input :deep(.el-input__prefix) {
    margin-right: 8px;
}

.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0 24px;
}

.forgot-password {
    color: #4F46E5;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    transition: color 0.3s ease;
}

.forgot-password:hover {
    color: #3730A3;
    text-decoration: underline;
}

.submit-btn {
    width: 100%;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    padding: 16px;
    height: auto;
    transition: all 0.3s ease;
}

.submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
}

.divider {
    display: flex;
    align-items: center;
    margin: 24px 0;
    color: #9CA3AF;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #E5E7EB;
}

.divider span {
    padding: 0 16px;
    font-size: 14px;
}

.social-login {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
}

.social-btn {
    width: 100%;
    border-radius: 12px;
    border: 1px solid #E5E7EB;
    background: white;
    color: #374151;
    font-weight: 500;
    padding: 12px;
    transition: all 0.3s ease;
}

.social-btn:hover {
    border-color: #4F46E5;
    color: #4F46E5;
    background: rgba(79, 70, 229, 0.05);
    transform: translateY(-2px);
}

.social-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    fill: currentColor;
}

.overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 2;
}

.main-card.right-panel-active .overlay-container {
    transform: translateX(-100%);
}

.overlay {
    background: linear-gradient(to right, #667eea, #764ba2);
    color: white;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.main-card.right-panel-active .overlay {
    transform: translateX(50%);
}

.overlay-panel {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 40px;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.overlay-left {
    transform: translateX(-20%);
}

.main-card.right-panel-active .overlay-left {
    transform: translateX(0);
}

.overlay-right {
    right: 0;
    transform: translateX(0);
}

.main-card.right-panel-active .overlay-right {
    transform: translateX(20%);
}

.overlay-title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 16px;
}

.overlay-text {
    font-size: 16px;
    margin: 0 0 32px;
    opacity: 0.9;
}

.ghost-btn {
    background: transparent;
    border: 2px solid white;
    color: white;
    font-weight: 600;
    padding: 12px 48px;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.ghost-btn:hover {
    background: white;
    color: #4F46E5;
    transform: translateY(-2px);
}

.row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.terms-link {
    color: #4F46E5;
    text-decoration: none;
    font-weight: 500;
}

.terms-link:hover {
    text-decoration: underline;
}

.demo-hint {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    backdrop-filter: blur(10px);
    z-index: 2;
}

.demo-hint p {
    margin: 0;
}

/* 响应式设计 */
@media (max-width: 960px) {
    .main-card {
        width: 90%;
        min-height: auto;
        flex-direction: column;
    }

    .form-container {
        padding: 32px;
    }

    .overlay-container {
        display: none;
    }

    .sign-up-container {
        transform: translateX(0);
        opacity: 1;
        display: none;
    }

    .main-card.right-panel-active .sign-in-container {
        display: none;
    }

    .main-card.right-panel-active .sign-up-container {
        display: block;
    }
}

@media (max-width: 576px) {
    .form-container {
        padding: 24px;
    }

    .row-2 {
        grid-template-columns: 1fr;
        gap: 0;
    }

    .social-login {
        grid-template-columns: 1fr;
    }

    .welcome-text {
        font-size: 24px;
    }

    .logo {
        width: 50px;
        height: 50px;
    }
}
</style>

<style>
.terms-dialog {
    width: 90%;
    max-width: 600px;
}

.terms-content {
    max-height: 400px;
    overflow-y: auto;
    padding-right: 8px;
}

.terms-content h3 {
    margin-top: 0;
    color: #1F2937;
    border-bottom: 2px solid #4F46E5;
    padding-bottom: 8px;
    margin-bottom: 16px;
}

.terms-content p {
    margin: 12px 0;
    line-height: 1.6;
    color: #4B5563;
}
</style>
