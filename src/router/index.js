import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import Layout from '@/components/Layout.vue'
import Home from '@/components/Home.vue'
import userManagement from '@/components/UserManagement.vue'
import menuManagement from '@/components/MenuManagement.vue'
import roleManagement from '@/components/RoleManagement.vue'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/',
        component: Layout,
        redirect: '/home',
        children: [
            {
                path: '/home',
                name: 'home',
                component: Home,
                meta: { title: '首页', icon: 'House' }
            },
            {
                path: '/workstation',
                name: 'workstation',
                component: () => import('../components/Workstation.vue'),
                meta: { title: '工作台', icon: 'Monitor', permission: 'analysis:view' }
            },
            {
                path: '/profile',
                name: 'profile',
                component: () => import('../components/ProfilePage.vue'),
                meta: { title: '个人中心', icon: 'User' }
            },
            {
                path: '/dashboard',
                name: 'dashboard',
                component: () => import('../components/Dashboard.vue'),
                meta: { title: '数据概览', icon: 'DataAnalysis' }
            },
            {
                path: '/sysA',
                name: 'systemAnalysis',
                component: () => import('../components/SystemAnalysis.vue'),
                meta: { title: '系统分析', icon: 'Histogram', permission: 'analysis:view' }
            },
            {
                path: '/userA',
                name: 'userAnalysis',
                component: () => import('../components/UserAnalysis.vue'),
                meta: { title: '用户分析', icon: 'PieChart', permission: 'analysis:view' }
            },
            {
                path: '/order',
                name: 'orderManagement',
                component: () => import('../components/OrderManagement.vue'),
                meta: { title: '订单管理', icon: 'ShoppingCart', permission: 'order:view' }
            },
            {
                path: '/user',
                name: 'userManagement',
                component: userManagement,
                meta: { title: '用户管理', icon: 'User' }
            },
            {
                path: '/role',
                component: roleManagement,
                meta: { title: '角色管理', icon: 'Key', requiresAuth: true }
            },
            {
                path: '/menu',
                name: 'menuManagement',
                component: menuManagement,
                meta: { title: '菜单管理', icon: 'Menu' }
            },
            {
                path: '/system',
                name: 'system',
                component: () => import('../components/SystemSettings.vue'),
                meta: { title: '系统设置', icon: 'Tools' }
            },
            {
                path: '/auditLogs',
                name: 'auditLogs',
                component: () => import('../components/OperationLog.vue'),
                meta: { title: '操作日志', icon: 'Operation', requiresAuth: true }
            },
            {
                path: '/sysLogs',
                name: 'sysLogs',
                component: () => import('../components/SystemLogs.vue'),
                meta: { title: '系统日志', icon: 'DataBoard' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.path === '/login') {
        if (token) {
            next('/home')
        } else {
            next()
        }
    } else {
        if (!token) {
            next('/login')
        } else {
            next()
        }
    }
})

export default router
