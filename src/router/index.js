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
                path: 'home',
                name: 'Home',
                component: Home,
                meta: { title: '首页' }
            },
            {
                path: 'user',
                name: 'userManagement',
                component: userManagement,
                meta: { title: '用户管理' }
            },
            {
                path: 'role',
                component: roleManagement,
                meta: { title: '角色管理', requiresAuth: true }
            },
            {
                path: 'menu',
                name: 'menuManagement',
                component: menuManagement,
                meta: { title: '菜单管理' }
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
