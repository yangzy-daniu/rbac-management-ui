<template>
    <div class="order-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>订单管理</span>
                    <el-button type="primary" @click="handleCreate">
                        <el-icon><Plus /></el-icon>
                        新建订单
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form inline :model="searchForm" class="search-form">
                <el-form-item label="订单号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
                </el-form-item>
                <el-form-item label="客户">
                    <el-input v-model="searchForm.customer" placeholder="请输入客户名称" clearable />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 120px">
                        <el-option label="待支付" value="pending" />
                        <el-option label="已支付" value="paid" />
                        <el-option label="已发货" value="shipped" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                    </el-select>
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

            <!-- 订单表格 -->
            <el-table :data="orderList" v-loading="loading" stripe style="width: 100%" table-layout="auto" :header-cell-style="{ 'text-align': 'center' }" >
                <el-table-column prop="orderNo" label="订单号" width="180" />
                <el-table-column prop="customer" label="客户" width="120" />
                <el-table-column prop="amount" label="金额" width="100" align="right">
                    <template #default="{ row }">
                        ¥{{ row.amount.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                    <template #default="{ row }">
                        {{ formatDateTime(row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <div style="display:flex;gap:4px;">
                            <el-button size="small" @click="handleView(row)">查看</el-button>
                            <el-button
                                    size="small"
                                    type="primary"
                                    @click="handleEdit(row)"
                                    v-if="hasPermission('order:edit')"
                            >
                                编辑
                            </el-button>
                            <el-button
                                    size="small"
                                    type="danger"
                                    @click="handleDelete(row.id)"
                                    v-if="hasPermission('order:delete')"
                            >
                                删除
                            </el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
                <el-pagination
                        background
                        v-model:current-page="pagination.currentPage"
                        v-model:page-size="pagination.pageSize"
                        :total="pagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 订单详情对话框 -->
        <OrderDetailDialog
                v-model="detailVisible"
                :order-id="selectedOrderId"
                @refresh="loadOrders"
        />
    </div>
    <!-- 新建订单对话框 -->
    <el-dialog
            v-model="createVisible"
            title="新建订单"
            width="720px"
            :before-close="handleCreateClose"
    >
        <el-form :model="editForm" :rules="editRules" ref="createFormRef" label-width="80px">
            <el-form-item label="客户" prop="customer">
                <el-input v-model="editForm.customer" placeholder="请输入客户名称" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="editForm.remark" type="textarea" placeholder="请输入订单备注" />
            </el-form-item>

            <el-form-item label="商品信息">
                <div class="product-list">
                    <div v-for="(item, index) in editForm.items" :key="index" class="product-item">
                        <el-row :gutter="10">
                            <el-col :span="8">
                                <el-form-item :prop="`items[${index}].productName`" :rules="{ required: true, message: '请输入商品名称', trigger: 'blur' }">
                                    <el-input v-model="item.productName" placeholder="商品名称" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="5">                  <!-- 价格输入框列宽由4改为5 -->
                                <el-form-item :prop="`items[${index}].price`" :rules="{ required: true, message: '请输入价格', trigger: 'blur' }">
                                    <el-input-number v-model="item.price" :min="0" :precision="2" placeholder="价格" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="5">                  <!-- 数量输入框列宽由4改为5 -->
                                <el-form-item :prop="`items[${index}].quantity`" :rules="{ required: true, message: '请输入数量', trigger: 'blur' }">
                                    <el-input-number v-model="item.quantity" :min="1" placeholder="数量" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                            <el-input v-model="item.description" placeholder="商品描述" />
                            </el-col>
                            <el-col :span="2">
                                <el-button type="danger" @click="removeProductItem(index)" :disabled="editForm.items.length === 1">
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <el-button type="primary" @click="addProductItem" class="add-product-btn">
                    <el-icon><Plus /></el-icon>
                    添加商品
                </el-button>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleCreateClose">取消</el-button>
            <el-button type="primary" @click="submitCreateOrder" :loading="creating">
                创建订单
            </el-button>
        </template>
    </el-dialog>

    <!-- 编辑订单对话框 -->
    <el-dialog
            v-model="editVisible"
            title="编辑订单"
            width="720px"
            :before-close="handleEditClose"
    >
        <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
            <el-form-item label="客户" prop="customer">
                <el-input v-model="editForm.customer" placeholder="请输入客户名称" />
            </el-form-item>
            <el-form-item label="备注">
                <el-input v-model="editForm.remark" type="textarea" placeholder="请输入订单备注" />
            </el-form-item>

            <el-form-item label="商品信息">
                <div class="product-list">
                    <div v-for="(item, index) in editForm.items" :key="index" class="product-item">
                        <el-row :gutter="10">
                            <el-col :span="8">
                                <el-form-item :prop="`items[${index}].productName`" :rules="{ required: true, message: '请输入商品名称', trigger: 'blur' }">
                                    <el-input v-model="item.productName" placeholder="商品名称" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="5">
                                <el-form-item :prop="`items[${index}].price`" :rules="{ required: true, message: '请输入价格', trigger: 'blur' }">
                                    <el-input-number v-model="item.price" :min="0" :precision="2" placeholder="价格" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="5">
                                <el-form-item :prop="`items[${index}].quantity`" :rules="{ required: true, message: '请输入数量', trigger: 'blur' }">
                                    <el-input-number v-model="item.quantity" :min="1" placeholder="数量" style="width:100%" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="4">
                                <el-input v-model="item.description" placeholder="商品描述" />
                            </el-col>
                            <el-col :span="2">
                                <el-button type="danger" @click="removeProductItem(index)" :disabled="editForm.items.length === 1">
                                    <el-icon><Delete /></el-icon>
                                </el-button>
                            </el-col>
                        </el-row>
                    </div>
                </div>
                <el-button type="primary" @click="addProductItem" class="add-product-btn">
                    <el-icon><Plus /></el-icon>
                    添加商品
                </el-button>
            </el-form-item>
        </el-form>

        <template #footer>
            <el-button @click="handleEditClose">取消</el-button>
            <el-button type="primary" @click="submitEditOrder" :loading="editing">
                更新订单
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import OrderDetailDialog from './OrderDetailDialog.vue'
import { Delete } from '@element-plus/icons-vue'
import {
    listOrderByPage,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderDetail
} from '@/api/order'

const loading = ref(false)
const orderList = ref([])
const detailVisible = ref(false)
const selectedOrderId = ref(null)

const createVisible = ref(false)
const creating = ref(false)
const createFormRef = ref()

const searchForm = reactive({
    orderNo: '',
    customer: '',
    status: ''
})

const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 权限检查
const hasPermission = (permission) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')

    debugger;
    // 超级管理员和管理员拥有所有权限
    if (userInfo.roleName === 'super' || userInfo.roleName === 'admin') {
        return true
    }

    // 其他角色根据实际权限列表检查
    const userPermissions = userInfo.permissions || []
    return userPermissions.includes(permission)
}

const editForm = reactive({
    customer: '',
    remark: '',
    items: [
        {
            productName: '',
            price: 0,
            quantity: 1,
            description: ''
        }
    ]
})

const editRules = {
    customer: [
        { required: true, message: '请输入客户名称', trigger: 'blur' }
    ]
}

// 加载订单数据 - 调用后端API
const loadOrders = async () => {
    loading.value = true
    try {
        // 构建查询参数
        const params = new URLSearchParams()
        if (searchForm.orderNo) params.append('orderNo', searchForm.orderNo)
        if (searchForm.customer) params.append('customer', searchForm.customer)
        if (searchForm.status) params.append('status', searchForm.status)
        params.append('page', pagination.currentPage)
        params.append('size', pagination.pageSize)

        const response = await listOrderByPage(params)
        // 检查HTTP状态码
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: 获取订单列表失败`)
        }

        orderList.value = response.data.content
        pagination.total = response.data.totalElements

    } catch (error) {
        console.error('加载订单失败:', error)
        ElMessage.error('加载订单失败')
        // 失败时使用模拟数据作为fallback
        orderList.value = getMockOrders()
        pagination.total = orderList.value.length
    } finally {
        loading.value = false
    }
}

// 模拟数据作为fallback
const getMockOrders = () => {
    return [
        {
            id: 1,
            orderNo: 'ORD202401010001',
            customer: '张三',
            amount: 2999.00,
            status: 'paid',
            createTime: '2024-01-01 10:00:00',
            productCount: 2
        },
        {
            id: 2,
            orderNo: 'ORD202401010002',
            customer: '李四',
            amount: 1599.50,
            status: 'pending',
            createTime: '2024-01-01 11:30:00',
            productCount: 1
        }
    ]
}

const handleSearch = () => {
    pagination.currentPage = 1
    loadOrders()
}

const resetSearch = () => {
    Object.assign(searchForm, {
        orderNo: '',
        customer: '',
        status: ''
    })
    loadOrders()
}

const handleCreate = () => {
    createVisible.value = true
}

const handleCreateClose = () => {
    createVisible.value = false
    resetEditForm();
}

const addProductItem = () => {
    editForm.items.push({
        productName: '',
        price: 0,
        quantity: 1,
        description: ''
    })
}

const removeProductItem = (index) => {
    if (editForm.items.length > 1) {
        editForm.items.splice(index, 1)
    }
}

const submitCreateOrder = async () => {
    if (!createFormRef.value) return

    try {
        await createFormRef.value.validate()
        creating.value = true

        // 调用后端API创建订单
        const response = await createOrder(editForm)

        // 检查HTTP状态码
        if (response.status == 200) {
            ElMessage.success('订单创建成功')
            // 确保创建成功后关闭弹窗
            createVisible.value = false
            handleCreateClose()
            await loadOrders()
        } else {
            throw new Error('创建订单失败')
        }

    } catch (error) {
        console.error('创建订单失败:', error)
        ElMessage.error('创建订单失败')
    } finally {
        creating.value = false
    }
}

const handleView = (row) => {
    selectedOrderId.value = row.id
    detailVisible.value = true
}

// 编辑订单相关
const editVisible = ref(false)
const editing = ref(false)
const editFormRef = ref()
const editingOrderId = ref(null)


const handleEdit = async (row) => {
    try {
        loading.value = true
        editingOrderId.value = row.id

        // 调用获取订单详情接口
        const response = await getOrderDetail(row.id)

        if (response.status === 200) {
            const orderDetail = response.data

            // 填充编辑表单数据，使用接口返回的完整数据
            Object.assign(editForm, {
                customer: orderDetail.customer,
                remark: orderDetail.remark || '',
                items: orderDetail.items && orderDetail.items.length > 0
                        ? orderDetail.items.map(item => ({
                            productName: item.productName || '',
                            price: item.price || 0,
                            quantity: item.quantity || 1,
                            description: item.description || ''
                        }))
                        : [
                            {
                                productName: '',
                                price: 0,
                                quantity: 1,
                                description: ''
                            }
                        ]
            })
            editVisible.value = true
        } else {
            throw new Error('获取订单详情失败')
        }
    } catch (error) {
        console.error('获取订单详情失败:', error)
        ElMessage.error('获取订单详情失败，无法编辑')
        // 失败时使用列表中的基本信息
        Object.assign(editForm, {
            customer: row.customer,
            remark: row.remark || '',
            items: [
                {
                    productName: '',
                    price: 0,
                    quantity: 1,
                    description: ''
                }
            ]
        })
        editVisible.value = true
    } finally {
        loading.value = false
    }
}

const submitEditOrder = async () => {
    if (!editFormRef.value) return

    try {
        await editFormRef.value.validate()
        editing.value = true

        // 调用后端API更新订单
        const response = await updateOrder(editingOrderId.value, editForm)

        // 检查HTTP状态码
        if (response.status === 200) {
            ElMessage.success('订单更新成功')
            handleEditClose()
            await loadOrders()
        } else {
            throw new Error('更新订单失败')
        }

    } catch (error) {
        console.error('更新订单失败:', error)
        ElMessage.error('更新订单失败')
    } finally {
        editing.value = false
    }
}

const resetEditForm = () => {
    editFormRef.value?.resetFields()
    Object.assign(editForm, {
        customer: '',
        remark: '',
        items: [
            {
                productName: '',
                price: 0,
                quantity: 1,
                description: ''
            }
        ]
    })
    editingOrderId.value = null
}

const handleEditClose = () => {
    editVisible.value = false
    resetEditForm()
}

const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定删除该订单吗？', '提示', { type: 'warning' })

        // 调用后端API删除订单
        const response = await deleteOrder(id)

        // 检查HTTP状态码
        if (response.status === 200) {
            ElMessage.success('删除成功')
            await loadOrders()
        } else {
            throw new Error('删除订单失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除订单失败:', error)
            ElMessage.error('删除订单失败')
        }
    }
}

const getStatusType = (status) => {
    const typeMap = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'info',
        completed: 'success',
        cancelled: 'danger'
    }
    return typeMap[status] || 'info'
}

const getStatusText = (status) => {
    const textMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
    }
    return textMap[status] || '未知'
}

// 格式化日期时间，移除T字符
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return ''
    return dateTimeStr.replace('T', ' ').replace(/\.\d+/, '')
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    loadOrders()
}

const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadOrders()
}

onMounted(() => {
    loadOrders()
})
</script>

<style scoped>
.order-management {
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
    justify-content: flex-end;
    margin-top: 20px;
}

.product-list {
    margin-bottom: 10px;
}

.product-item {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
}

.add-product-btn {
    width: 100%;
}

</style>
