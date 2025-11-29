<template>
    <el-dialog
            v-model="visible"
            :title="`日志详情 - ID: ${logData?.id || ''}`"
            width="900px"
            :before-close="handleClose"
    >
        <div v-loading="loading" class="log-detail">
            <!-- 基本信息 -->
            <el-card class="info-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>基本信息</span>
                    </div>
                </template>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="日志ID">
                        {{ logData?.id || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="模块名称">
                        <el-tag size="small">{{ logData?.module || '-' }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作类型">
                        <el-tag :type="getTypeTagType(logData?.type)" size="small">
                            {{ logData?.type || '-' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作结果">
                        <el-tag :type="logData?.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
                            {{ logData?.result === 'SUCCESS' ? '成功' : '失败' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作描述">
                        {{ logData?.operation || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="执行时间">
                        {{ logData?.executionTime || 0 }}ms
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <!-- 用户信息 -->
            <el-card class="user-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>用户信息</span>
                    </div>
                </template>
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="操作者">
                        {{ logData?.operator || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="操作者ID">
                        {{ logData?.operatorId || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="IP地址">
                        {{ logData?.operatorIp || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="访问时间">
                        {{ formatTime(logData?.accessTime) }}
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <!-- 请求信息 -->
            <el-card class="request-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <span>请求信息</span>
                    </div>
                </template>
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="请求方法">
                        <el-tag :type="getMethodType(logData?.requestMethod)" size="small">
                            {{ logData?.requestMethod || '-' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="请求路径">
                        {{ logData?.requestUrl || '-' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="状态码">
                        <el-tag :type="getStatusCodeType(logData?.statusCode)" size="small">
                            {{ logData?.statusCode || '-' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="用户代理">
                        <div class="user-agent">
                            {{ logData?.userAgent || '-' }}
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="请求参数">
                        <pre class="request-params">{{ formatRequestParams(logData?.requestParams) }}</pre>
                    </el-descriptions-item>
                </el-descriptions>
            </el-card>

            <!-- 错误信息 -->
            <el-card
                    v-if="logData?.result === 'FAILURE'"
                    class="error-card"
                    shadow="never"
            >
                <template #header>
                    <div class="card-header">
                        <span style="color: #f56c6c;">错误信息</span>
                    </div>
                </template>
                <div class="error-message">
                    {{ logData?.errorMessage || '未知错误' }}
                </div>
            </el-card>
        </div>

        <template #footer>
            <el-button @click="handleClose">关闭</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    logData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(false)
const loading = ref(false)

watch(() => props.modelValue, (newValue) => {
    visible.value = newValue
})

watch(visible, (newValue) => {
    emit('update:modelValue', newValue)
})

const handleClose = () => {
    visible.value = false
}

// 工具函数
const getTypeTagType = (type) => {
    const typeMap = {
        'CREATE': 'success',
        'UPDATE': 'warning',
        'DELETE': 'danger',
        'QUERY': 'primary',
        'LOGIN': 'info'
    }
    return typeMap[type] || 'info'
}

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

const formatRequestParams = (params) => {
    if (!params) return '无'
    try {
        return JSON.stringify(JSON.parse(params), null, 2)
    } catch {
        return params
    }
}
</script>

<style scoped>
.log-detail {
    max-height: 600px;
    overflow-y: auto;
}

.info-card,
.user-card,
.request-card,
.error-card {
    margin-bottom: 16px;
}

.card-header {
    font-weight: 600;
    color: #303133;
}

.user-agent {
    word-break: break-all;
    font-size: 12px;
    color: #606266;
}

.request-params {
    background: #f5f7fa;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #606266;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
}

.error-message {
    color: #f56c6c;
    background: #fef0f0;
    padding: 12px;
    border-radius: 4px;
    border-left: 4px solid #f56c6c;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
    width: 100px;
}
</style>
