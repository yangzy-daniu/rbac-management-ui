<template>
    <div class="login-container">
        <el-card class="login-card">
            <template #header>
                <div class="login-header">
                    <h2>用户登录</h2>
                </div>
            </template>

            <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" @submit.prevent>
                <el-form-item prop="username">
                    <el-input
                            v-model="loginForm.username"
                            placeholder="请输入用户名"
                            size="large"
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
                            placeholder="请输入密码"
                            size="large"
                            show-password
                            @keyup.enter="handleLogin"
                    >
                        <template #prefix>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item>
                    <el-button
                            type="primary"
                            size="large"
                            style="width: 100%"
                            :loading="loading"
                            @click="handleLogin"
                    >
                        {{ loading ? '登录中...' : '登录' }}
                    </el-button>
                </el-form-item>
            </el-form>

            <div class="demo-account">
                <p>测试账号：admin / 123456</p>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const loginFormRef = ref()

const loginForm = reactive({
    username: 'admin',
    password: '123456'
})

const loginRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
        const valid = await loginFormRef.value.validate()
        if (!valid) return

        loading.value = true
        const response = await login(loginForm)

        if (response.data.success) {
            ElMessage.success('登录成功')
            // 存储token和用户信息
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            // 跳转到首页
            // window.location.href = '/home'
            // 使用 Vue Router 跳转到首页
            await router.push('/home')
        } else {
            ElMessage.error(response.data.message)
        }
    } catch (error) {
        ElMessage.error('登录失败，请检查网络连接')
        console.error('Login error:', error)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
    width: 400px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    color: #333;
}

.login-header h2 {
    margin: 0;
    font-weight: 500;
}

.demo-account {
    margin-top: 20px;
    padding: 10px;
    background: #f5f7fa;
    border-radius: 4px;
    text-align: center;
    color: #666;
    font-size: 14px;
}
</style>
