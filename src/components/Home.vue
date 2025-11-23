<template>
    <el-card class="welcome-card">
        <template #header>
            <div class="card-header">
                <span>欢迎使用管理系统</span>
            </div>
        </template>

        <div class="welcome-content">
            <el-result icon="success" title="登录成功" :sub-title="welcomeMessage">
                <template #extra>
                    <el-space direction="vertical" size="large">
                        <div class="quick-actions">
                            <h3>快捷操作</h3>
                            <el-space wrap>
                                <el-button type="primary" @click="goToUserManagement">
                                    <el-icon><User /></el-icon>
                                    用户管理
                                </el-button>
                                <el-button @click="goToRoleManagement">
                                    <el-icon><Key /></el-icon>
                                    角色管理
                                </el-button>
                                <el-button @click="goToMenuManagement">
                                    <el-icon><Menu /></el-icon>
                                    菜单管理
                                </el-button>
                            </el-space>
                        </div>

                        <el-card class="system-info">
                            <template #header>
                                <span>系统信息</span>
                            </template>
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="登录用户">{{ userInfo.name }}</el-descriptions-item>
                                <el-descriptions-item label="用户角色">{{ userInfo.role }}</el-descriptions-item>
                                <el-descriptions-item label="登录时间">{{ loginTime }}</el-descriptions-item>
                                <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
                            </el-descriptions>
                        </el-card>
                    </el-space>
                </template>
            </el-result>
        </div>
    </el-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, Key, Menu } from '@element-plus/icons-vue'
import { getUserInfo } from '@/api/user'

const router = useRouter()
const userInfo = ref({
    name: '',
    role: ''
})

const loginTime = ref(new Date().toLocaleString())

const welcomeMessage = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好！祝您工作愉快！'
    if (hour < 18) return '下午好！继续加油！'
    return '晚上好！注意休息！'
})

const loadUserInfo = async () => {
    try {
        const response = await getUserInfo()
        userInfo.value = response.data
    } catch (error) {
        console.error('获取用户信息失败:', error)
    }
}

const goToUserManagement = () => {
    router.push('/user-crud')
}

const goToRoleManagement = () => {
    // router.push('/role')
    ElMessage.info('角色管理功能开发中...')
}

const goToMenuManagement = () => {
    // router.push('/menu')
    ElMessage.info('菜单管理功能开发中...')
}

onMounted(() => {
    loadUserInfo()
})
</script>

<style scoped>
.welcome-card {
    min-height: 500px;
}

.card-header {
    font-size: 18px;
    font-weight: bold;
}

.welcome-content {
    text-align: center;
    padding: 20px 0;
}

.quick-actions {
    margin: 20px 0;
}

.system-info {
    margin-top: 20px;
    text-align: left;
}
</style>
