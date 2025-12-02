<template>
    <div class="profile-page">
        <div class="page-header">
            <h1>个人中心</h1>
            <p>管理您的个人信息和账户设置</p>
        </div>

        <div class="profile-content">
            <!-- 基本信息卡片 -->
            <el-card class="info-card">
                <template #header>
                    <div class="card-header">
                        <span>基本信息</span>
                    </div>
                </template>

                <div class="user-info">
                    <div class="avatar-section">
                        <el-avatar :size="80" :src="userInfo.avatar">
                            {{ getAvatarText }}
                        </el-avatar>
                        <div class="user-details">
                            <h3>{{ displayName }}</h3>
                            <p>{{ userInfo.roleName || userInfo.roleCode || '用户' }} - {{ userInfo.department || '未设置部门' }}</p>
                        </div>
                    </div>

                    <el-divider />

                    <div class="info-grid">
                        <div class="info-item">
                            <label>用户名:</label>
                            <span>{{ userInfo.username }}</span>
                        </div>
                        <div class="info-item">
                            <label>姓名:</label>
                            <span>{{ userInfo.name || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>邮箱:</label>
                            <span>{{ userInfo.email || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>手机号:</label>
                            <span>{{ userInfo.phone || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>部门:</label>
                            <span>{{ userInfo.department || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>职位:</label>
                            <span>{{ userInfo.position || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>用户ID:</label>
                            <span>{{ userInfo.id }}</span>
                        </div>
                        <div class="info-item">
                            <label>角色:</label>
                            <span>{{ userInfo.roleName || userInfo.roleCode || '用户' }}</span>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 编辑资料表单 -->
            <el-card class="form-card">
                <template #header>
                    <div class="card-header">
                        <span>编辑资料</span>
                    </div>
                </template>

                <el-form :model="profileForm" label-width="80px">
                    <el-form-item label="昵称">
                        <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
                    </el-form-item>

                    <el-form-item label="姓名">
                        <el-input v-model="profileForm.name" placeholder="请输入姓名" />
                    </el-form-item>

                    <el-form-item label="邮箱">
                        <el-input v-model="profileForm.email" placeholder="请输入邮箱" type="email" />
                    </el-form-item>

                    <el-form-item label="手机号">
                        <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                    </el-form-item>

                    <el-form-item label="部门">
                        <el-input v-model="profileForm.department" placeholder="请输入部门" />
                    </el-form-item>

                    <el-form-item label="职位">
                        <el-input v-model="profileForm.position" placeholder="请输入职位" />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="updateProfile" :loading="updating">
                            保存更改
                        </el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 修改密码 -->
            <el-card class="form-card">
                <template #header>
                    <div class="card-header">
                        <span>修改密码</span>
                    </div>
                </template>

                <el-form :model="passwordForm" label-width="100px">
                    <el-form-item label="当前密码">
                        <el-input v-model="passwordForm.oldPassword" type="password" show-password
                                  placeholder="请输入当前密码" />
                    </el-form-item>

                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" show-password
                                  placeholder="请输入新密码" />
                    </el-form-item>

                    <el-form-item label="确认密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" show-password
                                  placeholder="请再次输入新密码" />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="changePassword" :loading="changingPassword">
                            修改密码
                        </el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/profile.js'

export default {
    name: 'ProfilePage',

    setup() {
        // 用户信息
        const userInfo = ref({
            id: '',
            username: '',
            name: '',
            nickname: '',
            email: '',
            phone: '',
            department: '',
            position: '',
            roleCode: '',
            roleName: '',
            avatar: ''
        })

        // 表单数据
        const profileForm = reactive({
            nickname: '',
            name: '',
            email: '',
            phone: '',
            department: '',
            position: ''
        })

        const passwordForm = reactive({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        // 加载状态
        const updating = ref(false)
        const changingPassword = ref(false)

        // 计算属性
        const displayName = computed(() => {
            return userInfo.value.nickname || userInfo.value.name || userInfo.value.username
        })

        const getAvatarText = computed(() => {
            const name = displayName.value
            return name ? name.charAt(0).toUpperCase() : 'U'
        })

        // 从后端获取用户信息
        const fetchUserInfo = async () => {
            try {
                const response = await userApi.getProfile()
                if (response.data) {
                    userInfo.value = response.data
                    initData()
                }
            } catch (error) {
                console.error('获取用户信息失败:', error)
                ElMessage.error('获取用户信息失败')
            }
        }

        // 初始化表单数据
        const initData = () => {
            profileForm.nickname = userInfo.value.nickname || ''
            profileForm.name = userInfo.value.name || ''
            profileForm.email = userInfo.value.email || ''
            profileForm.phone = userInfo.value.phone || ''
            profileForm.department = userInfo.value.department || ''
            profileForm.position = userInfo.value.position || ''
        }

        // 更新资料
        const updateProfile = async () => {
            // 简单验证
            if (!profileForm.name && !profileForm.nickname) {
                ElMessage.warning('请至少填写姓名或昵称')
                return
            }

            updating.value = true
            try {
                const response = await userApi.updateProfile({
                    nickname: profileForm.nickname,
                    name: profileForm.name,
                    email: profileForm.email,
                    phone: profileForm.phone,
                    department: profileForm.department,
                    position: profileForm.position
                })

                if (response.data && response.data.success) {
                    userInfo.value = response.data.data
                    ElMessage.success(response.data.message || '资料更新成功')
                } else {
                    ElMessage.error(response.data?.message || '资料更新失败')
                }
            } catch (error) {
                console.error('更新资料失败:', error)
                ElMessage.error(error.response?.data?.message || '更新资料失败')
            } finally {
                updating.value = false
            }
        }

        // 修改密码
        const changePassword = async () => {
            if (!passwordForm.oldPassword) {
                ElMessage.warning('请输入当前密码')
                return
            }

            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                ElMessage.error('两次输入的密码不一致')
                return
            }

            if (passwordForm.newPassword.length < 6) {
                ElMessage.error('密码长度不能少于6位')
                return
            }

            changingPassword.value = true
            try {
                const response = await userApi.changePassword({
                    oldPassword: passwordForm.oldPassword,
                    newPassword: passwordForm.newPassword,
                    confirmPassword: passwordForm.confirmPassword
                })

                if (response.data && response.data.success) {
                    ElMessage.success(response.data.message || '密码修改成功')
                    // 清空密码表单
                    passwordForm.oldPassword = ''
                    passwordForm.newPassword = ''
                    passwordForm.confirmPassword = ''
                } else {
                    ElMessage.error(response.data?.message || '密码修改失败')
                }
            } catch (error) {
                console.error('修改密码失败:', error)
                ElMessage.error(error.response?.data?.message || '修改密码失败')
            } finally {
                changingPassword.value = false
            }
        }

        // 重置表单
        const resetForm = () => {
            initData()
        }

        // 生命周期
        onMounted(() => {
            fetchUserInfo()
        })

        return {
            userInfo,
            profileForm,
            passwordForm,
            updating,
            changingPassword,
            displayName,
            getAvatarText,
            updateProfile,
            changePassword,
            resetForm
        }
    }
}
</script>

<style scoped>
.profile-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    margin-bottom: 24px;
}

.page-header h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
}

.page-header p {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
}

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-card,
.form-card {
    border-radius: 8px;
}

.card-header {
    font-weight: 600;
    color: #303133;
}

.user-info {
    padding: 0 10px;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.user-details h3 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 18px;
}

.user-details p {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item label {
    color: #909399;
    font-size: 14px;
}

.info-item span {
    color: #303133;
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .profile-page {
        padding: 12px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .avatar-section {
        flex-direction: column;
        text-align: center;
    }
}
</style>
