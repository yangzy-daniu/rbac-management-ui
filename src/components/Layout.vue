<template>
    <el-container class="layout-container">
        <!-- 侧边栏 -->
        <el-aside :width="isCollapse ? '64px' : '200px'" class="sidebar">
            <div class="logo">
                <span v-if="!isCollapse">管理系统</span>
                <span v-else>M</span>
            </div>
            <el-menu
                    :default-active="activeMenu"
                    class="sidebar-menu"
                    :collapse="isCollapse"
                    :collapse-transition="false"
                    router
                    background-color="#304156"
                    text-color="#bfcbd9"
                    active-text-color="#409EFF"
            >
                <template v-for="menu in menus" :key="menu.id">
                    <el-menu-item v-if="!menu.children || menu.children.length === 0" :index="menu.path">
                        <el-icon><component :is="menu.icon" /></el-icon>
                        <template #title>{{ menu.name }}</template>
                    </el-menu-item>

                    <el-sub-menu v-else :index="menu.path" :key="menu.id">
                        <template #title>
                            <el-icon><component :is="menu.icon" /></el-icon>
                            <span>{{ menu.name }}</span>
                        </template>
                        <el-menu-item
                                v-for="child in menu.children"
                                :key="child.id"
                                :index="child.path"
                        >
                            {{ child.name }}
                        </el-menu-item>
                    </el-sub-menu>
                </template>
            </el-menu>
        </el-aside>

        <!-- 主内容区 -->
        <el-container>
            <!-- 顶部导航 -->
            <el-header class="header">
                <div class="header-left">
                    <el-button
                            @click="toggleCollapse"
                            :icon="isCollapse ? 'Expand' : 'Fold'"
                            text
                            size="small"
                    />
                    <el-breadcrumb separator="/" class="breadcrumb">
                        <el-breadcrumb-item>首页</el-breadcrumb-item>
                    </el-breadcrumb>
                </div>

                <div class="header-right">
                    <el-dropdown @command="handleCommand">
                        <span class="user-info">
                            <el-avatar :size="32" :src="userInfo.avatar" />
                            <span class="username">{{ userInfo.name }}</span>
                            <el-icon><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </el-header>

            <!-- 内容区域 -->
            <el-main class="main-content">
                <router-view />
            </el-main>
        </el-container>
    </el-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Fold,
    Expand,
    ArrowDown,
    House,
    Setting,
    User,
    Key,
    Menu as MenuIcon
} from '@element-plus/icons-vue'
import { getUserInfo, logout } from '@/api/user'

const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)
const userInfo = reactive({
    name: '',
    username: '',
    avatar: '',
    role: ''
})

// 菜单数据
const menus = ref([
    {
        id: 1,
        name: '首页',
        path: '/home',
        icon: 'House'
    },
    {
        id: 2,
        name: '系统管理',
        path: '/system',
        icon: 'Setting',
        children: [
            {
                id: 21,
                name: '用户管理',
                path: '/user-crud',
                icon: 'User'
            },
            {
                id: 22,
                name: '角色管理',
                path: '/role',
                icon: 'Key'
            },
            {
                id: 23,
                name: '菜单管理',
                path: '/menu',
                icon: 'MenuIcon'
            }
        ]
    }
])

const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
    isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
    if (command === 'logout') {
        try {
            await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
                type: 'warning'
            })
            await logout()
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            ElMessage.success('退出成功')
            router.push('/login')
        } catch (error) {
            // 用户取消退出
        }
    } else if (command === 'profile') {
        // 跳转到个人信息页面
        ElMessage.info('个人信息功能开发中...')
    }
}

const loadUserInfo = async () => {
    try {
        const response = await getUserInfo()
        Object.assign(userInfo, response.data)
    } catch (error) {
        console.error('获取用户信息失败:', error)
    }
}

onMounted(() => {
    loadUserInfo()
})
</script>

<style scoped>
.layout-container {
    height: 100vh;
}

.sidebar {
    background-color: #304156;
    transition: width 0.3s;
}

.logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #263445;
}

.sidebar-menu {
    border: none;
    height: calc(100vh - 60px);
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    border-bottom: 1px solid #e6e6e6;
    background: #fff;
}

.header-left {
    display: flex;
    align-items: center;
}

.breadcrumb {
    margin-left: 15px;
}

.header-right {
    display: flex;
    align-items: center;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.user-info:hover {
    background-color: #f5f7fa;
}

.username {
    margin: 0 8px;
    font-size: 14px;
}

.main-content {
    background-color: #f0f2f5;
    padding: 20px;
}
</style>
