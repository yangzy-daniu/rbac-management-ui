import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/Login.vue'
import Layout from '@/components/Layout.vue'
import Home from '@/components/Home.vue'
import { recordAccess } from '@/api/recent'
import { getMenuConfig } from '@/api/menu'

let configLoaded = false
// 定义菜单配置
let menuConfig = {}
// 加载菜单配置
async function loadMenuConfig() {
    try {
        const token = localStorage.getItem('token')
        if (!token) {
            console.log('未登录，跳过菜单配置加载')
            return
        }

        const response = await getMenuConfig()
        menuConfig = response.data || {}
        configLoaded = true
        console.log('菜单配置加载成功:', menuConfig)
    } catch (error) {
        console.error('加载菜单配置失败:', error)
        // 使用默认配置作为fallback
        menuConfig = getDefaultMenuConfig()
    }
}

// 默认配置（作为fallback）
function getDefaultMenuConfig() {
    return {
        '/workstation': {
            name: '工作台',
            icon: 'Monitor',
            type: 'MENU'
        },
        '/user': {
            name: '用户管理',
            icon: 'User',
            type: 'MENU'
        },
        '/order': {
            name: '订单处理',
            icon: 'ShoppingCart',
            type: 'MENU'
        },
        '/dashboard': {
            name: '数据分析',
            icon: 'TrendCharts',
            type: 'MENU'
        },
        '/system': {
            name: '系统设置',
            icon: 'Setting',
            type: 'MENU'
        },
        '/analysis': {
            name: '系统分析',
            icon: 'TrendCharts',
            type: 'MENU'
        }
    }
}

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
                component: () => import('../components/UserManagement.vue'),
                meta: { title: '用户管理', icon: 'User' }
            },
            {
                path: '/role',
                name: 'roleManagement',
                component: () => import('../components/RoleManagement.vue'),
                meta: { title: '角色管理', icon: 'Key', requiresAuth: true }
            },
            {
                path: '/menu',
                name: 'menuManagement',
                component: () => import('../components/MenuManagement.vue'),
                meta: { title: '菜单管理', icon: 'Menu' }
            },
            {
                path: '/system',
                name: 'system',
                component: () => import('../components/SystemSettings.vue'),
                meta: { title: '系统设置', icon: 'Tools' }
            },
            {
                path: '/monitor',
                name: 'monitor',
                component: () => import('../components/SystemMonitor.vue'),
                meta: { title: '系统监控', icon: 'DataBoard' }
            },
            {
                path: '/auditLogs',
                name: 'auditLogs',
                component: () => import('../components/OperationLog.vue'),
                meta: { title: '操作日志', icon: 'Operation', requiresAuth: true }
            },
            {
                path: '/systemLogs',
                name: 'sysLogs',
                component: () => import('../components/SystemLogs.vue'),
                meta: { title: '系统日志', icon: 'Document' }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
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
            // 登录状态下，确保菜单配置已加载
            if (!configLoaded && to.path !== '/home') {
                try {
                    await loadMenuConfig()
                } catch (error) {
                    console.error('加载菜单配置失败:', error)
                }
            }
            next()
        }
    }
    // 获取菜单配置
    const menuInfo = menuConfig[to.path]

    if (menuInfo) {
        // 记录访问（异步，不影响路由跳转）
        recordAccess({
            menuName: menuInfo.name || to.meta?.title || to.name,
            menuPath: to.path,
            menuIcon: menuInfo.icon,
            menuType: menuInfo.type || 'MENU'
        }).catch(error => {
            console.error('记录访问历史失败:', error)
            // 记录失败不影响路由跳转
        })
    }

    next()
})

export default router
