<template>
    <div class="menu-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>菜单管理</span>
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增菜单
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form inline :model="queryParams" class="search-form">
                <el-form-item label="菜单名称">
                    <el-input
                            v-model="queryParams.name"
                            placeholder="请输入菜单名称"
                            clearable
                            style="width: 200px"
                            @keyup.enter="getMenuList"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getMenuList">
                        <el-icon><Search /></el-icon>
                        搜索
                    </el-button>
                    <el-button @click="resetQuery">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 菜单表格 -->
            <el-table
                    :data="menuList"
                    row-key="id"
                    :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
                    default-expand-all
                    v-loading="loading"
            >
                <el-table-column prop="name" label="菜单名称" min-width="200">
                    <template #default="{ row }">
                        <el-icon v-if="row.icon" style="margin-right: 8px">
                            <component :is="row.icon" />
                        </el-icon>
                        {{ row.name }}
                    </template>
                </el-table-column>
                <el-table-column prop="path" label="路由路径" min-width="150" />
                <el-table-column prop="component" label="组件路径" min-width="150" />
                <el-table-column prop="type" label="菜单类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getMenuTypeTag(row.type)">
                            {{ getMenuTypeText(row.type) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="80" />
                <el-table-column prop="icon" label="图标" width="100">
                    <template #default="{ row }">
                        <el-icon v-if="row.icon">
                            <component :is="row.icon" />
                        </el-icon>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" @click="handleEdit(row)">
                            编辑
                        </el-button>
                        <el-button link type="primary" @click="handleAddChild(row)" v-if="row.type === 0">
                            添加子菜单
                        </el-button>
                        <el-button link type="danger" @click="handleDelete(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 新增/编辑菜单对话框 -->
        <el-dialog
                :title="dialogTitle"
                v-model="dialogVisible"
                width="500px"
                :close-on-click-modal="false"
        >
            <el-form
                    ref="menuFormRef"
                    :model="menuForm"
                    :rules="menuRules"
                    label-width="80px"
            >
                <el-form-item label="父菜单" prop="parentId">
                    <el-tree-select
                            v-model="menuForm.parentId"
                            :data="menuTree"
                            :props="{ label: 'name', value: 'id' }"
                            check-strictly
                            clearable
                            placeholder="选择父菜单"
                            style="width: 100%"
                    />
                </el-form-item>
                <el-form-item label="菜单类型" prop="type">
                    <el-radio-group v-model="menuForm.type">
                        <el-radio :label="0">目录</el-radio>
                        <el-radio :label="1">菜单</el-radio>
                        <el-radio :label="2">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
                </el-form-item>
                <el-form-item label="路由路径" prop="path" v-if="menuForm.type !== 2">
                    <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
                </el-form-item>
                <el-form-item label="组件路径" prop="component" v-if="menuForm.type === 1">
                    <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
                </el-form-item>
                <el-form-item label="菜单图标" prop="icon">
                    <el-input v-model="menuForm.icon" placeholder="请输入图标名称">
                        <template #append>
                            <el-button @click="showIconSelector = true">选择图标</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="是否可用" prop="available">
                    <el-switch v-model="menuForm.available" />
                </el-form-item>
                <el-form-item label="排序" prop="sort">
                    <el-input-number v-model="menuForm.sort" :min="0" :max="999" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm" :loading="submitLoading">
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 图标选择器 -->
        <el-dialog title="选择图标" v-model="showIconSelector" width="800px">
            <div class="icon-selector">
                <div
                        v-for="icon in iconList"
                        :key="icon"
                        class="icon-item"
                        :class="{ active: menuForm.icon === icon }"
                        @click="selectIcon(icon)"
                >
                    <el-icon><component :is="icon" /></el-icon>
                    <span>{{ icon }}</span>
                </div>
            </div>
            <template #footer>
                <el-button @click="showIconSelector = false">取消</el-button>
                <el-button type="primary" @click="showIconSelector = false">
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    Search,
    Refresh,
    House,
    Setting,
    User,
    Key,
    Menu as MenuIcon,
    Fold,
    Expand
} from '@element-plus/icons-vue'
import {getMenuTree, createMenu, updateMenu, deleteMenu, searchMenus} from '@/api/menu'

// 常用图标列表
const iconList = ref([
    'House', 'Setting', 'User', 'Key', 'Menu', 'Document',
    'Fold', 'Expand', 'ArrowDown', 'Search', 'Plus', 'Edit',
    'Delete', 'Refresh', 'Lock', 'Unlock', 'Message', 'Notification'
])

const loading = ref(false)
const dialogVisible = ref(false)
const showIconSelector = ref(false)
const submitLoading = ref(false)
const menuFormRef = ref()

// 查询参数
const queryParams = reactive({
    name: ''
})

// 菜单表单
const menuForm = reactive({
    id: null,
    name: '',
    path: '',
    icon: '',
    sort: 0,
    parentId: null,
    component: '',
    type: 0,
    available: true
})

// 表单验证规则
const menuRules = {
    name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
    sort: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

// 菜单列表数据
const menuList = ref([])

// 计算属性
const dialogTitle = computed(() => {
    return menuForm.id ? '编辑菜单' : '新增菜单'
})

const menuTree = computed(() => {
    const buildTree = (menus, parentId = null) => {
        return menus
                .filter(menu => menu.parentId === parentId && menu.type !== 2)
                .map(menu => ({
                    ...menu,
                    children: buildTree(menus, menu.id)
                }))
    }
    return buildTree(menuList.value)
})

// 方法
const getMenuList = async () => {
    loading.value = true
    try {
        let response
        if (queryParams.name) {
            // 如果有搜索条件，调用搜索API
            response = await searchMenus(queryParams.name)
        } else {
            // 否则获取菜单树，这里会自动使用角色权限过滤
            response = await getMenuTree()
        }
        menuList.value = response.data

    } catch (error) {
        console.error('获取菜单列表失败:', error)
        ElMessage.error('获取菜单列表失败: ' + (error.response?.data?.message || error.message))
        // 使用模拟数据继续开发
        menuList.value = getMockMenuData()
    } finally {
        loading.value = false
    }
}

const getMockMenuData = () => {
    return [
        {
            id: 1,
            name: '首页',
            path: '/home',
            icon: 'House',
            sort: 1,
            parentId: null,
            component: 'Home',
            type: 1,
            children: []
        },
        {
            id: 2,
            name: '系统管理',
            path: '/system',
            icon: 'Setting',
            sort: 2,
            parentId: null,
            component: '',
            type: 0,
            children: [
                {
                    id: 21,
                    name: '用户管理',
                    path: '/user',
                    icon: 'User',
                    sort: 1,
                    parentId: 2,
                    component: 'UserManagement',
                    type: 1,
                    children: []
                },
                {
                    id: 22,
                    name: '角色管理',
                    path: '/role',
                    icon: 'Key',
                    sort: 2,
                    parentId: 2,
                    component: 'RoleManagement',
                    type: 1,
                    children: []
                },
                {
                    id: 23,
                    name: '菜单管理',
                    path: '/menu',
                    icon: 'MenuIcon',
                    sort: 3,
                    parentId: 2,
                    component: 'MenuManagement',
                    type: 1,
                    children: []
                }
            ]
        },
        {
            id: 3,
            name: '业务管理',
            path: '/business',
            icon: 'Document',
            sort: 3,
            parentId: null,
            component: '',
            type: 0,
            children: [
                {
                    id: 31,
                    name: '订单管理',
                    path: '/order',
                    icon: 'ShoppingCart',
                    sort: 1,
                    parentId: 3,
                    component: 'OrderManagement',
                    type: 1,
                    children: []
                },
                {
                    id: 32,
                    name: '商品管理',
                    path: '/product',
                    icon: 'Goods',
                    sort: 2,
                    parentId: 3,
                    component: 'ProductManagement',
                    type: 1,
                    children: [
                        {
                            id: 321,
                            name: '商品列表',
                            path: '/product/list',
                            icon: 'List',
                            sort: 1,
                            parentId: 32,
                            component: 'ProductList',
                            type: 1,
                            children: []
                        },
                        {
                            id: 322,
                            name: '商品分类',
                            path: '/product/category',
                            icon: 'Collection',
                            sort: 2,
                            parentId: 32,
                            component: 'ProductCategory',
                            type: 1,
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            id: 4,
            name: '数据统计',
            path: '/statistics',
            icon: 'DataAnalysis',
            sort: 4,
            parentId: null,
            component: '',
            type: 0,
            children: [
                {
                    id: 41,
                    name: '销售统计',
                    path: '/statistics/sales',
                    icon: 'TrendCharts',
                    sort: 1,
                    parentId: 4,
                    component: 'SalesStatistics',
                    type: 1,
                    children: []
                },
                {
                    id: 42,
                    name: '用户统计',
                    path: '/statistics/users',
                    icon: 'UserFilled',
                    sort: 2,
                    parentId: 4,
                    component: 'UserStatistics',
                    type: 1,
                    children: []
                }
            ]
        },
        {
            id: 5,
            name: '个人中心',
            path: '/profile',
            icon: 'User',
            sort: 5,
            parentId: null,
            component: 'Profile',
            type: 1,
            children: []
        }
    ]
}

const resetQuery = () => {
    Object.assign(queryParams, {
        name: ''
    })
    getMenuList()
}

const handleAdd = () => {
    resetForm()
    dialogVisible.value = true
}

const handleAddChild = (row) => {
    resetForm()
    menuForm.parentId = row.id
    menuForm.type = 1 // 子菜单默认为菜单类型
    dialogVisible.value = true
}

const handleEdit = (row) => {
    resetForm()
    Object.assign(menuForm, { ...row })
    dialogVisible.value = true
}

const handleDelete = async (row) => {
    try {
        await ElMessageBox.confirm(
                `确定要删除菜单"${row.name}"吗？`,
                '提示',
                {
                    type: 'warning',
                    confirmButtonText: '确定',
                    cancelButtonText: '取消'
                }
        )

        // 使用统一的API调用方式
        await deleteMenu(row.id)
        ElMessage.success('删除成功')
        await getMenuList()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message))
        }
    }
}

const resetForm = () => {
    if (menuFormRef.value) {
        menuFormRef.value.resetFields()
    }
    Object.assign(menuForm, {
        id: null,
        name: '',
        path: '',
        icon: '',
        sort: 0,
        parentId: null,
        component: '',
        type: 0,
        available: true
    })
}

const submitForm = async () => {
    if (!menuFormRef.value) return

    try {
        const valid = await menuFormRef.value.validate()
        if (!valid) return

        submitLoading.value = true

        if (menuForm.id) {
            // 编辑菜单
            await updateMenu(menuForm.id, menuForm)
            ElMessage.success('编辑成功')
        } else {
            // 新增菜单
            await createMenu(menuForm)
            ElMessage.success('新增成功')
        }

        dialogVisible.value = false
        await getMenuList()
    } catch (error) {
        console.error('操作失败:', error)
        ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message))
    } finally {
        submitLoading.value = false
    }
}

const selectIcon = (icon) => {
    menuForm.icon = icon
    showIconSelector.value = false
}

const getMenuTypeText = (type) => {
    const typeMap = {
        0: '目录',
        1: '菜单',
        2: '按钮'
    }
    return typeMap[type] || '未知'
}

const getMenuTypeTag = (type) => {
    const tagMap = {
        0: 'primary',
        1: 'success',
        2: 'info'
    }
    return tagMap[type] || 'info'
}

// 生命周期
onMounted(() => {
    getMenuList()
})
</script>

<style scoped>
.menu-management {
    padding: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-form {
    margin-bottom: 20px;
}

.icon-selector {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 10px;
    max-height: 400px;
    overflow-y: auto;
}

.icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
}

.icon-item:hover {
    border-color: #409eff;
    background-color: #f5f7fa;
}

.icon-item.active {
    border-color: #409eff;
    background-color: #ecf5ff;
}

.icon-item .el-icon {
    font-size: 20px;
    margin-bottom: 5px;
}

.icon-item span {
    font-size: 12px;
    color: #666;
}
</style>
