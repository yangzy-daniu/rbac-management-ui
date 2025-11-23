<template>
    <div class="role-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>角色管理</span>
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增角色
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form inline :model="searchForm" class="search-form">
                <el-form-item label="关键词">
                    <el-input
                            v-model="searchForm.keyword"
                            placeholder="请输入角色名称、代码或描述"
                            clearable
                            @clear="handleSearch"
                            @keyup.enter="handleSearch"
                    />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 表格区域 -->
            <el-table
                    :data="tableData"
                    v-loading="loading"
                    stripe
                    style="width:100%"
                    @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="code" label="角色代码" min-width="120" />
                <el-table-column prop="name" label="角色名称" min-width="120" />
                <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
                <el-table-column prop="menuPermissions" label="菜单权限" min-width="200" show-overflow-tooltip>
                    <template #default="scope">
                        {{ getMenuNames(scope.row.menuPermissions) }}
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">
                            <el-icon><Edit /></el-icon>
                            编辑
                        </el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">
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
                        background
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
                width="800px"
                :before-close="handleDialogClose"
        >
            <el-form
                    ref="roleFormRef"
                    :model="roleForm"
                    :rules="roleRules"
                    label-width="100px"
            >
                <el-form-item label="角色代码" prop="code">
                    <el-input
                            v-model="roleForm.code"
                            placeholder="请输入角色代码"
                            :disabled="isEdit"
                    />
                </el-form-item>

                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
                </el-form-item>

                <el-form-item label="描述" prop="description">
                    <el-input
                            v-model="roleForm.description"
                            type="textarea"
                            :rows="3"
                            placeholder="请输入角色描述"
                    />
                </el-form-item>

                <el-form-item label="菜单权限" prop="menuPermissions">
                    <div class="menu-tree-container">
                        <el-tree
                                ref="menuTreeRef"
                                :data="menuTreeData"
                                show-checkbox
                                node-key="code"
                                :props="treeProps"
                                :default-checked-keys="roleForm.menuPermissions"
                                @check="handleMenuCheck"
                        />
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleDialogClose">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    Search,
    Edit,
    Delete,
    Refresh
} from '@element-plus/icons-vue'
import {
    listRoleByPage,
    addRole,
    deleteRole,
    batchDeleteRoles,
    updateRole,
    checkRoleCode,
    getRoleById
} from '@/api/role'
import {getAllMenus} from '@/api/menu'

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const roleFormRef = ref()
const menuTreeRef = ref()

// 搜索表单
const searchForm = reactive({
    keyword: ''
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 表格数据
const tableData = ref([])

// 菜单树数据
const menuTreeData = ref([])

// 树形配置
const treeProps = {
    children: 'children',
    label: 'name'
}

// 角色表单
const roleForm = reactive({
    id: null,
    code: '',
    name: '',
    description: '',
    menuPermissions: []
})

// 表单验证规则
const roleRules = {
    code: [
        { required: true, message: '请输入角色代码', trigger: 'blur' },
        { min: 2, max: 50, message: '角色代码长度为2-50个字符', trigger: 'blur' },
        { validator: validateCode, trigger: 'blur' }
    ],
    name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 50, message: '角色名称长度为2-50个字符', trigger: 'blur' }
    ],
    description: [
        { max: 200, message: '描述不能超过200个字符', trigger: 'blur' }
    ]
}

// 验证角色代码
async function validateCode(rule, value, callback) {
    if (!value) {
        callback()
        return
    }

    try {
        const params = { code: value }
        if (isEdit.value) {
            params.excludeId = roleForm.id
        }
        const response = await checkRoleCode(params)
        if (response.data.exists) {
            callback(new Error('角色代码已存在'))
        } else {
            callback()
        }
    } catch (error) {
        console.error('验证角色代码失败:', error)
        callback()
    }
}

const dialogTitle = computed(() => isEdit.value ? '编辑角色' : '新增角色')

// 构建查询参数
const buildQueryParams = () => {
    const params = {
        page: pagination.currentPage,
        size: pagination.pageSize
    }

    if (searchForm.keyword) {
        params.keyword = searchForm.keyword
    }

    return params
}

// 加载角色数据
const loadRoles = async () => {
    loading.value = true
    try {
        const params = buildQueryParams()
        const response = await listRoleByPage(params)
        tableData.value = response.data.content
        pagination.total = response.data.totalElements
    } catch (error) {
        console.error('加载角色数据失败:', error)
        ElMessage.error('加载角色数据失败')
        tableData.value = []
        pagination.total = 0
    } finally {
        loading.value = false
    }
}

// 获取菜单名称
const getMenuNames = (menuPermissions) => {
    if (!menuPermissions || menuPermissions.length === 0) {
        return '-'
    }

    const names = menuPermissions.map(permission => {
        return menuMap.value.get(permission) || permission
    })

    // 缩略显示，最多显示3个，超过用...表示
    if (names.length <= 3) {
        return names.join(', ')
    } else {
        return names.slice(0, 3).join(', ') + `... 等${names.length}个菜单`
    }
}

// 菜单映射，用于快速查找菜单名称
const menuMap = ref(new Map())

// 加载菜单数据
const loadMenus = async () => {
    try {
        const response = await getAllMenus()
        const menus = response.data
        const menuMap = new Map()
        const tree = []

        // 首先创建所有菜单节点的映射
        menus.forEach(menu => {
            menuMap.set(menu.id, {
                id: menu.id,
                code: menu.id, // 使用 id 作为 node-key
                name: menu.name,
                children: []
            })
        })

        // 构建树形结构
        menus.forEach(menu => {
            const menuNode = menuMap.get(menu.id)

            if (menu.parentId && menuMap.has(menu.parentId)) {
                // 有父菜单，添加到父菜单的children中
                // const parentMenu = menuMap.get(menu.parentId)
                // if (!parentMenu.children) {
                //     parentMenu.children = []
                // }
                // parentMenu.children.push(menuNode)
                menuMap.get(menu.parentId).children.push(menuNode)

            } else {
                // 没有父菜单，作为根节点
                tree.push(menuNode)
            }
        })

        menuTreeData.value = tree

    } catch (error) {
        console.error('加载菜单数据失败:', error)
        ElMessage.error('加载菜单数据失败')
    }
}

// 搜索
const handleSearch = () => {
    pagination.currentPage = 1
    loadRoles()
}

// 重置搜索
const resetSearch = () => {
    searchForm.keyword = ''
    pagination.currentPage = 1
    loadRoles()
}

// 新增角色
const handleAdd = async () => {
    isEdit.value = false
    resetForm()
    await loadMenus()
    dialogVisible.value = true
}

// 编辑角色
const handleEdit = async (row) => {
    isEdit.value = true
    await loadMenus()

    try {
        // 直接通过ID获取角色详情，而不是通过分页查询
        const response = await getRoleById(row.id)
        if (response.data) {
            const roleDetail = response.data
            Object.assign(roleForm, {
                id: roleDetail.id,
                code: roleDetail.code,
                name: roleDetail.name,
                description: roleDetail.description,
                menuPermissions: roleDetail.menuPermissions || []
            })

            // 等待DOM更新后设置选中的菜单
            await nextTick()
            if (menuTreeRef.value) {
                menuTreeRef.value.setCheckedKeys(roleForm.menuPermissions)
            }
        }
        dialogVisible.value = true
    } catch (error) {
        console.error('获取角色详情失败:', error)
        ElMessage.error('获取角色详情失败')
    }
}

// 删除角色
const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
            type: 'warning'
        })

        await deleteRole(id)
        ElMessage.success('删除成功')
        await loadRoles()
    } catch (error) {
        // 用户取消删除
    }
}

// 批量删除
const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的角色')
        return
    }

    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个角色吗？`, '提示', {
            type: 'warning'
        })

        const ids = selectedRows.value.map(row => row.id)
        await batchDeleteRoles(ids)
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        await loadRoles()
    } catch (error) {
        // 用户取消删除
    }
}

// 菜单选择变化
const handleMenuCheck = (checkedNodes, checkedKeys) => {
    roleForm.menuPermissions = checkedKeys.checked
}

// 重置表单
const resetForm = () => {
    Object.assign(roleForm, {
        id: null,
        code: '',
        name: '',
        description: '',
        menuPermissions: []
    })
    if (roleFormRef.value) {
        roleFormRef.value.clearValidate()
    }
    if (menuTreeRef.value) {
        menuTreeRef.value.setCheckedKeys([])
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!roleFormRef.value) return

    try {
        const valid = await roleFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        // 在提交前确保获取最新的菜单权限数据
        if (menuTreeRef.value) {
            const checkedKeys = menuTreeRef.value.getCheckedKeys()
            roleForm.menuPermissions = checkedKeys
        }

        // 确保 menuPermissions 不是 null
        if (!roleForm.menuPermissions) {
            roleForm.menuPermissions = []
        }

        console.log('提交的角色数据:', JSON.parse(JSON.stringify(roleForm))) // 调试用

        if (isEdit.value) {
            await updateRole(roleForm.id, roleForm)
            ElMessage.success('更新成功')
        } else {
            await addRole(roleForm)
            ElMessage.success('新增成功')
        }

        dialogVisible.value = false
        await loadRoles()
    } catch (error) {
        console.error('保存角色失败:', error)
        ElMessage.error('保存角色失败: ' + (error.response?.data?.message || error.message))
    } finally {
        submitting.value = false
    }
}


// 关闭对话框
const handleDialogClose = () => {
    dialogVisible.value = false
    resetForm()
}

// 选择行变化
const handleSelectionChange = (selection) => {
    selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadRoles()
}

// 当前页变化
const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadRoles()
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
}

onMounted(() => {
    loadRoles()
})
</script>

<style scoped>

.role-management {
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

.menu-tree-container {
    width: 100%;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
}

:deep(.menu-tree-container .el-tree) {
    min-width: 100%;
    width: auto;
    padding: 10px;
    border: none !important;
}

/* 确保树形组件不会撑开容器 */
:deep(.menu-tree-container .el-tree > .el-tree-node) {
    min-width: 100%;
}

/* 调整树节点的样式以适应容器 */
:deep(.menu-tree-container .el-tree-node__content) {
    height: auto;
    min-height: 26px;
}

:deep(.menu-tree-container .el-tree-node__label) {
    white-space: normal;
    word-break: break-word;
}
</style>
