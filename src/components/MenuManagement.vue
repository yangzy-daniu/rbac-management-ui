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
            <el-form :inline="true" :model="searchForm" class="search-form">
                <el-form-item label="菜单名称">
                    <el-input
                            v-model="searchForm.name"
                            placeholder="请输入菜单名称"
                            clearable
                            @clear="handleSearch"
                    />
                </el-form-item>

                <el-form-item label="菜单类型">
                    <el-select v-model="searchForm.type" placeholder="请选择类型" clearable @change="handleSearch">
                        <el-option label="目录" :value="0" />
                        <el-option label="菜单" :value="1" />
                        <el-option label="按钮" :value="2" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        搜索
                    </el-button>
                    <el-button @click="handleReset">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 表格区域 -->
            <el-table
                    :data="tableData"
                    v-loading="loading"
                    row-key="id"
                    :tree-props="{ children: 'children' }"
                    stripe
                    style="width:100%"
                    @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="name" label="菜单名称" min-width="200">
                    <template #default="scope">
                        <span v-if="scope.row.icon" style="margin-right: 8px;">
                            <el-icon><component :is="scope.row.icon" /></el-icon>
                        </span>
                        {{ scope.row.name }}
                    </template>
                </el-table-column>
                <el-table-column prop="type" label="类型" width="100">
                    <template #default="scope">
                        <el-tag :type="getTypeTagType(scope.row.type)">
                            {{ getTypeText(scope.row.type) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="path" label="路由路径" min-width="150" />
                <el-table-column prop="component" label="组件路径" min-width="150" />
                <el-table-column prop="icon" label="图标" width="100">
                    <template #default="scope">
                        <el-icon v-if="scope.row.icon">
                            <component :is="scope.row.icon" />
                        </el-icon>
                        <span v-else>-</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sort" label="排序" width="80" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">
                            <el-icon><Edit /></el-icon>
                            编辑
                        </el-button>
                        <el-button
                                size="small"
                                type="danger"
                                @click="handleDelete(scope.row.id)"
                                :disabled="scope.row.children && scope.row.children.length > 0"
                        >
                            <el-icon><Delete /></el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <div class="pagination-container">
                <div class="batch-actions" v-if="selectedRows.length > 0">
                    <el-button type="danger" size="small" @click="handleBatchDelete">
                        <el-icon><Delete /></el-icon>
                        批量删除 ({{ selectedRows.length }})
                    </el-button>
                </div>

                <el-pagination
                        v-model:current-page="pagination.currentPage"
                        v-model:page-size="pagination.pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        :total="pagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <el-dialog
                :title="dialogTitle"
                v-model="dialogVisible"
                width="600px"
                :before-close="handleDialogClose"
        >
            <el-form
                    ref="menuFormRef"
                    :model="menuForm"
                    :rules="menuRules"
                    label-width="100px"
            >
                <el-form-item label="菜单名称" prop="name">
                    <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
                </el-form-item>

                <el-form-item label="菜单类型" prop="type">
                    <el-radio-group v-model="menuForm.type" @change="handleTypeChange">
                        <el-radio :label="0">目录</el-radio>
                        <el-radio :label="1">菜单</el-radio>
                        <el-radio :label="2">按钮</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="父级菜单" prop="parentId" v-if="menuForm.type !== 0">
                    <el-tree-select
                            v-model="menuForm.parentId"
                            :data="menuTreeData"
                            check-strictly
                            :render-after-expand="false"
                            placeholder="请选择父级菜单"
                            style="width: 100%"
                    />
                </el-form-item>

                <el-form-item label="路由路径" prop="path" v-if="menuForm.type !== 2">
                    <el-input v-model="menuForm.path" placeholder="请输入路由路径" />
                </el-form-item>

                <el-form-item label="组件路径" prop="component" v-if="menuForm.type === 1">
                    <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
                </el-form-item>

                <el-form-item label="菜单图标" prop="icon" v-if="menuForm.type !== 2">
                    <el-input v-model="menuForm.icon" placeholder="请输入图标名称（Element Plus图标名）">
                        <template #append>
                            <el-button @click="showIconDialog = true">选择图标</el-button>
                        </template>
                    </el-input>
                </el-form-item>

                <el-form-item label="排序" prop="sort">
                    <el-input-number
                            v-model="menuForm.sort"
                            :min="0"
                            controls-position="right"
                    />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleDialogClose">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 图标选择对话框 -->
        <el-dialog title="选择图标" v-model="showIconDialog" width="800px">
            <div class="icon-grid">
                <div
                        v-for="icon in availableIcons"
                        :key="icon"
                        class="icon-item"
                        :class="{ active: menuForm.icon === icon }"
                        @click="selectIcon(icon)"
                >
                    <el-icon><component :is="icon" /></el-icon>
                    <span class="icon-name">{{ icon }}</span>
                </div>
            </div>

            <template #footer>
                <el-button @click="showIconDialog = false">取消</el-button>
                <el-button type="primary" @click="showIconDialog = false">确定</el-button>
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
    Edit,
    Delete,
    Refresh,
    House,
    Setting,
    User,
    Key,
    Menu as MenuIcon,
    Document,
    Fold,
    Expand,
    ArrowDown
} from '@element-plus/icons-vue'
import {
    getMenus,
    createMenu,
    updateMenu,
    deleteMenu,
    batchDeleteMenus
} from '@/api/menu'

const loading = ref(false)
const dialogVisible = ref(false)
const showIconDialog = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const menuFormRef = ref()

// 搜索表单
const searchForm = reactive({
    name: '',
    type: null
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 表格数据
const tableData = ref([])
const menuTreeData = ref([])

// 菜单表单
const menuForm = reactive({
    id: null,
    name: '',
    type: 0,
    parentId: null,
    path: '',
    component: '',
    icon: '',
    sort: 0
})

// 可用图标列表
const availableIcons = ref([
    'House', 'Setting', 'User', 'Key', 'Menu', 'Document',
    'Fold', 'Expand', 'ArrowDown', 'Search', 'Plus', 'Edit',
    'Delete', 'Refresh', 'Lock', 'Unlock', 'Message', 'Notification'
])

// 表单验证规则
const menuRules = {
    name: [
        { required: true, message: '请输入菜单名称', trigger: 'blur' }
    ],
    type: [
        { required: true, message: '请选择菜单类型', trigger: 'change' }
    ],
    sort: [
        { required: true, message: '请输入排序', trigger: 'blur' }
    ]
}

const dialogTitle = computed(() => isEdit.value ? '编辑菜单' : '新增菜单')

// 加载菜单数据
const loadMenus = async () => {
    loading.value = true
    try {
        const response = await getMenus()
        tableData.value = response.data
        pagination.total = tableData.value.length

        // 构建菜单树数据（用于父级菜单选择）
        buildMenuTreeData(response.data)
    } catch (error) {
        console.error('加载菜单数据失败:', error)
        ElMessage.error('加载菜单数据失败')
    } finally {
        loading.value = false
    }
}

// 构建菜单树数据
const buildMenuTreeData = (menus) => {
    const treeData = []

    const buildTree = (parentId) => {
        return menus
                .filter(menu => menu.parentId === parentId)
                .map(menu => ({
                    value: menu.id,
                    label: menu.name,
                    children: buildTree(menu.id)
                }))
    }

    menuTreeData.value = buildTree(null)
}

// 搜索
const handleSearch = () => {
    pagination.currentPage = 1
    loadMenus()
}

// 重置搜索
const handleReset = () => {
    Object.assign(searchForm, {
        name: '',
        type: null
    })
    handleSearch()
}

// 新增菜单
const handleAdd = () => {
    isEdit.value = false
    Object.assign(menuForm, {
        id: null,
        name: '',
        type: 0,
        parentId: null,
        path: '',
        component: '',
        icon: '',
        sort: 0
    })
    dialogVisible.value = true
}

// 编辑菜单
const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(menuForm, {
        id: row.id,
        name: row.name,
        type: row.type,
        parentId: row.parentId,
        path: row.path,
        component: row.component,
        icon: row.icon,
        sort: row.sort
    })
    dialogVisible.value = true
}

// 删除菜单
const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该菜单吗？', '提示', {
            type: 'warning'
        })

        await deleteMenu(id)
        ElMessage.success('删除成功')
        loadMenus()
    } catch (error) {
        // 用户取消删除
    }
}

// 批量删除
const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的菜单')
        return
    }

    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个菜单吗？`, '提示', {
            type: 'warning'
        })

        const ids = selectedRows.value.map(row => row.id)
        await batchDeleteMenus(ids)
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        loadMenus()
    } catch (error) {
        // 用户取消删除
    }
}

// 菜单类型变化
const handleTypeChange = (type) => {
    if (type === 0) {
        menuForm.parentId = null
    }
}

// 选择图标
const selectIcon = (icon) => {
    menuForm.icon = icon
}

// 提交表单
const handleSubmit = async () => {
    if (!menuFormRef.value) return

    try {
        const valid = await menuFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        if (isEdit.value) {
            await updateMenu(menuForm.id, menuForm)
            ElMessage.success('更新成功')
        } else {
            await createMenu(menuForm)
            ElMessage.success('新增成功')
        }

        dialogVisible.value = false
        loadMenus()
    } catch (error) {
        console.error('保存菜单失败:', error)
        ElMessage.error('保存菜单失败')
    } finally {
        submitting.value = false
    }
}

// 关闭对话框
const handleDialogClose = () => {
    dialogVisible.value = false
    menuFormRef.value?.clearValidate()
}

// 选择行变化
const handleSelectionChange = (selection) => {
    selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadMenus()
}

// 当前页变化
const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadMenus()
}

// 获取类型文本
const getTypeText = (type) => {
    const types = { 0: '目录', 1: '菜单', 2: '按钮' }
    return types[type] || '未知'
}

// 获取类型标签样式
const getTypeTagType = (type) => {
    const types = { 0: 'primary', 1: 'success', 2: 'info' }
    return types[type] || 'info'
}

onMounted(() => {
    loadMenus()
})
</script>

<style scoped>
.menu-management {
    height: 100%;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-form {
    margin-bottom: 20px;
}

.pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}

.batch-actions {
    display: flex;
    align-items: center;
}

.icon-grid {
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
    padding: 15px;
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
    font-size: 24px;
    margin-bottom: 8px;
}

.icon-name {
    font-size: 12px;
    color: #666;
}
</style>
