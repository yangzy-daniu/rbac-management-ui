<template>
    <el-dialog
            v-model="visible"
            :title="`订单详情 - ${orderDetail?.orderNo || ''}`"
            width="800px"
            :before-close="handleClose"
    >
        <div v-loading="loading" class="order-detail">
            <!-- 订单基本信息 -->
            <el-card class="info-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>基本信息</span>
                    </div>
                </template>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="订单号">
                        {{ orderDetail?.orderNo || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="客户">
                        {{ orderDetail?.customer || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="订单状态">
                        <el-tag :type="getStatusType(orderDetail?.status)">
                            {{ getStatusText(orderDetail?.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="订单金额">
                        <span class="amount">¥{{ orderDetail?.amount?.toFixed(2) || '0.00' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="创建时间">
                        {{ orderDetail?.createTime || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="商品数量">
                        {{ orderDetail?.productCount || 0 }} 件
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <!-- 商品信息 -->
            <el-card class="products-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>商品信息</span>
                    </div>
                </template>
                <el-table :data="orderDetail?.items || []" stripe>
                    <el-table-column prop="productName" label="商品名称" min-width="200" />
                    <el-table-column prop="price" label="单价" width="120" align="right">
                        <template #default="{ row }">
                            ¥{{ row.price?.toFixed(2) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="quantity" label="数量" width="80" align="center" />
                    <el-table-column prop="total" label="小计" width="120" align="right">
                        <template #default="{ row }">
                            ¥{{ ((row.price || 0) * (row.quantity || 0)).toFixed(2) }}
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>

            <!-- 操作记录 -->
            <el-card class="logs-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>操作记录</span>
                    </div>
                </template>
                <div class="operation-logs">
                    <div v-for="log in operationLogs" :key="log.id" class="log-item">
                        <div class="log-time">{{ log.time }}</div>
                        <div class="log-action">
                            <el-tag size="small" :type="log.type">{{ log.action }}</el-tag>
                        </div>
                        <div class="log-operator">{{ log.operator }}</div>
                        <div class="log-remark">{{ log.remark }}</div>
                    </div>
                </div>
            </el-card>
        </div>

        <template #footer>
            <el-button @click="handleClose">关闭</el-button>
            <el-button
                    type="primary"
                    v-if="orderDetail?.status === 'pending'"
                    @click="handleProcessOrder"
            >
                处理订单
            </el-button>
            <el-button
                    type="success"
                    v-if="orderDetail?.status === 'paid'"
                    @click="handleShipOrder"
            >
                发货
            </el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
    getOrderDetail,
    updateOrderStatus
} from '@/api/order'

    const props = defineProps({
    modelValue: {
    type: Boolean,
    default: false
},
    orderId: {
    type: Number,
    default: null
}
})

    const emit = defineEmits(['update:modelValue', 'refresh'])

    const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

    const loading = ref(false)
    const orderDetail = ref(null)
    const operationLogs = ref([])

    // 监听订单ID变化
    watch(() => props.orderId, (newOrderId) => {
    if (newOrderId && props.modelValue) {
    loadOrderDetail(newOrderId)
}
})

    // 监听对话框显示状态
    watch(() => props.modelValue, (newValue) => {
    if (newValue && props.orderId) {
    loadOrderDetail(props.orderId)
} else {
    orderDetail.value = null
    operationLogs.value = []
}
})

    // 加载订单详情 - 调用后端API
    const loadOrderDetail = async (orderId) => {
    loading.value = true
    try {
    const response = await getOrderDetail(orderId)

    // 检查HTTP状态码
    if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: 获取订单详情失败`)
}

    const { data } = response
    orderDetail.value = data

    // 从后端数据中提取操作日志
    if (data.logs) {
    operationLogs.value = data.logs.map(log => ({
    id: log.id,
    time: log.createTime,
    action: log.action,
    operator: log.operator,
    type: log.type || 'info',
    remark: log.remark
}))
} else {
    operationLogs.value = []
}

} catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
    // 失败时使用模拟数据作为fallback
    loadMockOrderDetail(orderId)
} finally {
    loading.value = false
}
}

    // 模拟数据作为fallback
    const loadMockOrderDetail = (orderId) => {
    const mockOrderDetails = {
    1: {
    id: 1,
    orderNo: 'ORD202401010001',
    customer: '张三',
    amount: 2999.00,
    status: 'paid',
    createTime: '2024-01-01 10:00:00',
    productCount: 2,
    items: [
{
    id: 1,
    productName: 'iPhone 15 Pro',
    price: 7999.00,
    quantity: 1
},
{
    id: 2,
    productName: 'AirPods Pro',
    price: 1999.00,
    quantity: 1
}
    ]
},
    2: {
    id: 2,
    orderNo: 'ORD202401010002',
    customer: '李四',
    amount: 1599.50,
    status: 'pending',
    createTime: '2024-01-01 11:30:00',
    productCount: 1,
    items: [
{
    id: 3,
    productName: 'iPad Air',
    price: 1599.50,
    quantity: 1
}
    ]
}
}

    orderDetail.value = mockOrderDetails[orderId] || null
    operationLogs.value = [
{
    id: 1,
    time: '2024-01-15 10:00:00',
    action: '创建订单',
    operator: '系统',
    type: 'info',
    remark: '用户提交订单'
},
{
    id: 2,
    time: '2024-01-15 10:05:00',
    action: '支付成功',
    operator: '支付系统',
    type: 'success',
    remark: '金额：¥2999.00'
}
    ]

    if (!orderDetail.value) {
    ElMessage.error('订单不存在')
    handleClose()
}
}

    const handleClose = () => {
    visible.value = false
    orderDetail.value = null
    operationLogs.value = []
}

    const handleProcessOrder = async () => {
    try {
    // 使用 updateOrderStatus API
    const response = await updateOrderStatus(props.orderId, 'paid', '管理员')

    // 检查HTTP状态码
    if (response.status === 200) {
    ElMessage.success('订单处理成功')
    emit('refresh')
    handleClose()
} else {
    throw new Error('处理订单失败')
}
} catch (error) {
    console.error('处理订单失败:', error)
    ElMessage.error('处理订单失败')
}
}

    const handleShipOrder = async () => {
    try {
    // 使用 updateOrderStatus API
    const response = await updateOrderStatus(props.orderId, 'shipped', '管理员')

    // 检查HTTP状态码
    if (response.status === 200) {
    ElMessage.success('发货成功')
    emit('refresh')
    handleClose()
} else {
    throw new Error('发货失败')
}
} catch (error) {
    console.error('发货失败:', error)
    ElMessage.error('发货失败')
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
</script>

<style scoped>
.order-detail {
    max-height: 600px;
    overflow-y: auto;
}

.info-card, .products-card, .logs-card {
    margin-bottom: 16px;
}

.card-header {
    font-weight: 600;
    color: #303133;
}

.amount {
    color: #f56c6c;
    font-weight: 600;
    font-size: 16px;
}

.operation-logs {
    padding: 0;
}

.log-item {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.log-item:last-child {
    border-bottom: none;
}

.log-time {
    width: 160px;
    color: #909399;
    font-size: 12px;
}

.log-action {
    width: 100px;
}

.log-operator {
    width: 100px;
    color: #606266;
    font-size: 14px;
}

.log-remark {
    flex: 1;
    color: #909399;
    font-size: 12px;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
}
</style>
