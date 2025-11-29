<template>
    <div class="operation-log-container">
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" :inline="true" label-width="80px">
                <el-form-item label="模块名称">
                    <el-select v-model="searchForm.module" placeholder="请选择模块" clearable>
                        <el-option label="用户管理" value="用户管理" />
                        <el-option label="订单管理" value="订单管理" />
                        <el-option label="角色管理" value="角色管理" />
                        <el-option label="系统管理" value="系统管理" />
                    </el-select>
                </el-form-item>

                <el-form-item label="操作类型">
                    <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable>
                        <el-option label="CREATE" value="CREATE" />
                        <el-option label="UPDATE" value="UPDATE" />
                        <el-option label="DELETE" value="DELETE" />
                        <el-option label="QUERY" value="QUERY" />
                        <el-option label="LOGIN" value="LOGIN" />
                    </el-select>
                </el-form-item>

                <el-form-item label="操作者">
                    <el-input v-model="searchForm.operator" placeholder="请输入操作者" clearable />
                </el-form-item>

                <el-form-item label="请求方法">
                    <el-select v-model="searchForm.requestMethod" placeholder="请选择请求方法" clearable>
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                        <el-option label="PUT" value="PUT" />
                        <el-option label="DELETE" value="DELETE" />
                    </el-select>
                </el-form-item>

                <el-form-item label="状态码">
                    <el-select v-model="searchForm.statusCode" placeholder="请选择状态码" clearable>
                        <el-option label="200" value="200" />
                        <el-option label="400" value="400" />
                        <el-option label="401" value="401" />
                        <el-option label="403" value="403" />
                        <el-option label="500" value="500" />
                    </el-select>
                </el-form-item>

                <el-form-item label="操作结果">
                    <el-select v-model="searchForm.result" placeholder="请选择操作结果" clearable>
                        <el-option label="SUCCESS" value="SUCCESS" />
                        <el-option label="FAILURE" value="FAILURE" />
                    </el-select>
                </el-form-item>

                <el-form-item label="时间范围">
                    <el-date-picker
                            v-model="searchForm.timeRange"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            value-format="YYYY-MM-DD HH:mm:ss"
                    />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        查询
                    </el-button>
                    <el-button @click="handleReset">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>操作日志列表</span>
                    <div>
                        <el-button @click="refreshData">
                            <el-icon><Refresh /></el-icon>
                            刷新
                        </el-button>
                        <el-button type="warning" @click="exportData">
                            <el-icon><Download /></el-icon>
                            导出
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table
                    v-loading="loading"
                    :data="tableData"
                    stripe
                    style="width: 100%"
                    @sort-change="handleSortChange"
            >
                <el-table-column prop="id" label="ID" width="80" sortable="custom" />

                <el-table-column prop="module" label="模块" width="120">
                    <template #default="{ row }">
                        <el-tag size="small">{{ row.module }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="operation" label="操作描述" min-width="200" show-overflow-tooltip />

                <el-table-column prop="operator" label="操作者" width="120">
                    <template #default="{ row }">
                        <el-tag type="info" size="small">{{ row.operator }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="operatorIp" label="IP地址" width="140" />

                <el-table-column prop="requestMethod" label="请求方法" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="getMethodType(row.requestMethod)"
                                size="small"
                        >
                            {{ row.requestMethod }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="requestUrl" label="请求路径" min-width="180" show-overflow-tooltip />

                <el-table-column prop="statusCode" label="状态码" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="getStatusCodeType(row.statusCode)"
                                size="small"
                        >
                            {{ row.statusCode }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="executionTime" label="响应时间" width="100" sortable="custom">
                    <template #default="{ row }">
                        {{ row.executionTime }}ms
                    </template>
                </el-table-column>

                <el-table-column prop="result" label="操作结果" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="row.result === 'SUCCESS' ? 'success' : 'danger'"
                                size="small"
                        >
                            {{ row.result === 'SUCCESS' ? '成功' : '失败' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="accessTime" label="访问时间" width="180" sortable="custom">
                    <template #default="{ row }">
                        {{ formatTime(row.accessTime) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="120" fixed="right">
                    <template #default="{ row }">
                        <el-button
                                link
                                type="primary"
                                size="small"
                                @click="handleViewDetail(row)"
                        >
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                        background
                        v-model:current-page="pagination.current"
                        v-model:page-size="pagination.size"
                        :total="pagination.total"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 日志详情对话框 -->
        <LogDetailDialog
                v-model="detailVisible"
                :log-data="currentLog"
                @refresh="refreshData"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import LogDetailDialog from './LogDetailDialog.vue'
import { getOperationLogs } from '@/api/operationLog'

// 搜索表单
const searchForm = reactive({
    module: '',
    type: '',
    operator: '',
    requestMethod: '',
    statusCode: null,
    result: '',
    timeRange: []
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
})

// 排序
const sort = reactive({
    prop: '',
    order: ''
})

// 对话框
const detailVisible = ref(false)
const currentLog = ref(null)

// 加载数据
const loadData = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.current,
            size: pagination.size,
            ...searchForm
        }

        // 处理时间范围
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
            params.startTime = searchForm.timeRange[0]
            params.endTime = searchForm.timeRange[1]
        }

        // 处理排序
        if (sort.prop) {
            params.sort = `${sort.prop},${sort.order}`
        }

        const response = await getOperationLogs(params)
        const { data } = response

        tableData.value = data.content
        pagination.total = data.totalElements
    } catch (error) {
        console.error('加载操作日志失败:', error)
        ElMessage.error('加载操作日志失败')
        // 使用模拟数据
        loadMockData()
    } finally {
        loading.value = false
    }
}

// 模拟数据
const loadMockData = () => {
    tableData.value = [
        {
            id: 1,
            module: '用户管理',
            type: 'UPDATE',
            operation: '修改了用户"张三"的权限',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'PUT',
            requestUrl: '/api/users/1',
            statusCode: 200,
            executionTime: 45,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-15 10:30:25',
            createTime: '2024-01-15 10:30:25'
        },
        {
            id: 2,
            module: '角色管理',
            type: 'CREATE',
            operation: '创建了新角色"内容编辑"',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'POST',
            requestUrl: '/api/roles',
            statusCode: 200,
            executionTime: 78,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-15 09:15:30',
            createTime: '2024-01-15 09:15:30'
        },
        {
            id: 3,
            module: '系统管理',
            type: 'UPDATE',
            operation: '更新了系统菜单结构',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'PUT',
            requestUrl: '/api/menus',
            statusCode: 200,
            executionTime: 120,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-14 16:20:15',
            createTime: '2024-01-14 16:20:15'
        },
        {
            id: 4,
            module: '系统管理',
            type: 'LOGIN',
            operation: '登录系统',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'POST',
            requestUrl: '/api/login',
            statusCode: 200,
            executionTime: 234,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-14 14:30:45',
            createTime: '2024-01-14 14:30:45'
        },
        {
            id: 5,
            module: '订单管理',
            type: 'DELETE',
            operation: '删除了订单"ORD202401010001"',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'DELETE',
            requestUrl: '/api/orders/1',
            statusCode: 500,
            executionTime: 89,
            result: 'FAILURE',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            errorMessage: '数据库连接超时',
            accessTime: '2024-01-14 11:05:20',
            createTime: '2024-01-14 11:05:20'
        }
    ]
    pagination.total = tableData.value.length
}

// 事件处理
const handleSearch = () => {
    pagination.current = 1
    loadData()
}

const handleReset = () => {
    Object.assign(searchForm, {
        module: '',
        type: '',
        operator: '',
        requestMethod: '',
        statusCode: null,
        result: '',
        timeRange: []
    })
    pagination.current = 1
    loadData()
}

const handleSizeChange = (size) => {
    pagination.size = size
    pagination.current = 1
    loadData()
}

const handleCurrentChange = (current) => {
    pagination.current = current
    loadData()
}

const handleSortChange = (sortInfo) => {
    sort.prop = sortInfo.prop
    sort.order = sortInfo.order === 'ascending' ? 'asc' : 'desc'
    loadData()
}

const refreshData = () => {
    loadData()
}

const exportData = () => {
    ElMessage.info('导出功能开发中...')
}

const handleViewDetail = (row) => {
    currentLog.value = row
    detailVisible.value = true
}

// 工具函数
const getMethodType = (method) => {
    const typeMap = {
        'GET': 'primary',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'danger'
    }
    return typeMap[method] || 'info'
}

const getStatusCodeType = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 400 && statusCode < 500) return 'warning'
    if (statusCode >= 500) return 'danger'
    return 'info'
}

const formatTime = (time) => {
    if (!time) return '-'
    return time.replace('T', ' ').substring(0, 19)
}

// 生命周期
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.operation-log-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-card {
    margin-bottom: 16px;
}

.pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}
</style>
