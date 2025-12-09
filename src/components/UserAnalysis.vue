<template>
    <div class="analysis-page">
        <!-- 页面标题和工具栏 -->
        <div class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <h1>用户分析</h1>
                    <p>实时监控系统运行状态和用户行为</p>
                </div>
                <div class="toolbar">
                    <el-button-group>
                        <el-button
                                :type="timeRange === '7d' ? 'primary' : ''"
                                @click="changeTimeRange('7d')"
                        >
                            最近7天
                        </el-button>
                        <el-button
                                :type="timeRange === '30d' ? 'primary' : ''"
                                @click="changeTimeRange('30d')"
                        >
                            最近30天
                        </el-button>
                        <el-button
                                :type="timeRange === '90d' ? 'primary' : ''"
                                @click="changeTimeRange('90d')"
                        >
                            最近90天
                        </el-button>
                    </el-button-group>
                    <el-button
                            type="primary"
                            @click="exportData"
                            :loading="exportLoading"
                    >
                        <el-icon><Download /></el-icon>
                        导出数据
                    </el-button>
                    <el-button @click="refreshData">
                        <el-icon><Refresh /></el-icon>
                        刷新
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 关键指标卡片 -->
        <el-row :gutter="20" class="stats-cards">
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon user-icon">
                            <el-icon><User /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.totalUsers) }}</div>
                            <div class="stats-label">总用户数</div>
                            <div class="stats-change" :class="getChangeClass(stats.userGrowthRate)">
                                <el-icon><Top v-if="stats.userGrowthRate >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.userGrowthRate) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon active-icon">
                            <el-icon><UserFilled /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.activeUsers) }}</div>
                            <div class="stats-label">活跃用户</div>
                            <div class="stats-change" :class="getChangeClass(stats.activeGrowthRate)">
                                <el-icon><Top v-if="stats.activeGrowthRate >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.activeGrowthRate) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon order-icon">
                            <el-icon><MessageBox /></el-icon> <!-- 更换图标 -->
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.sessionCount) }}</div>
                            <div class="stats-label">会话次数</div> <!-- 修改标签 -->
                            <div class="stats-change" :class="getChangeClass(stats.sessionGrowthRate)">
                                <el-icon><Top v-if="stats.sessionGrowthRate >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.sessionGrowthRate) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon revenue-icon">
                            <el-icon><TrendCharts /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.overallGrowthRate) }}%</div>
                            <div class="stats-label">增长率</div>
<!--                            <div class="stats-change" :class="getChangeClass(stats.overallGrowthRate)">-->
<!--                                <el-icon><Top v-if="stats.overallGrowthRate >= 0" /><Bottom v-else /></el-icon>-->
<!--                                {{ Math.abs(stats.overallGrowthRate) }}%-->
<!--                            </div>-->
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 主要图表区域 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 访问趋势图 -->
            <el-col :xs="24" :lg="16">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>访问趋势分析</span>
                            <div class="chart-actions">
                                <el-radio-group v-model="trendType" size="small">
                                    <el-radio-button label="visit">访问量</el-radio-button>
                                    <el-radio-button label="user">用户数</el-radio-button>
                                    <el-radio-button label="both">对比视图</el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </template>
                    <div ref="trendChart" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 用户行为分布 -->
            <el-col :xs="24" :lg="8">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>用户行为分布</span>
                    </template>
                    <div ref="behaviorChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 第二行图表 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 活跃用户统计 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>活跃用户统计</span>
                    </template>
                    <div class="active-users">
                        <div class="active-item">
                            <div class="active-label">今日登录</div>
                            <div class="active-value">{{ stats.todayLogins }} 次</div>
                        </div>
                        <div class="active-item">
                            <div class="active-label">周活跃用户</div>
                            <div class="active-value">{{ stats.weekActiveUsers }} 人</div>
                        </div>
                        <div class="active-item">
                            <div class="active-label">平均会话时长</div>
                            <div class="active-value">{{ stats.avgSessionTime }} 分钟</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 用户留存率 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>用户留存率</span>
                    </template>
                    <div ref="retentionChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 数据表格区域 -->
        <el-row :gutter="20" class="table-row">
            <el-col :xs="24">
                <el-card class="table-card" shadow="hover">
                    <template #header>
                        <div class="table-header">
                            <span>最近访问记录</span>
                            <el-button type="primary" text @click="showAllLogs">
                                查看全部
                            </el-button>
                        </div>
                    </template>
                    <el-table
                            :data="accessLogs"
                            v-loading="tableLoading"
                            stripe
                            style="width: 100%"
                            :default-sort="{ prop: 'accessTime', order: 'descending' }"
                    >
                        <el-table-column prop="username" label="用户" width="120">
                            <template #default="{ row }">
                                <div class="user-cell">
                                    <el-avatar :size="32" :src="row.avatar" :style="{ backgroundColor: getUserColor(row.username) }">
                                        {{ row.username.charAt(0).toUpperCase() }}
                                    </el-avatar>
                                    <span class="username">{{ row.username }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessMethod" label="方法" width="80">
                            <template #default="{ row }">
                                <el-tag :type="getMethodType(row.accessMethod)" size="small">
                                    {{ row.accessMethod }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessPath" label="访问路径" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="statusCode" label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag
                                        :type="getStatusType(row.statusCode)"
                                        size="small"
                                >
                                    {{ row.statusCode }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="responseTime" label="响应时间" width="100">
                            <template #default="{ row }">
                <span :class="getResponseTimeClass(row.responseTime)">
                  {{ row.responseTime }}ms
                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessTime" label="访问时间" width="180">
                            <template #default="{ row }">
                                {{ formatDateTime(row.accessTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="viewLogDetail(row)">
                                    详情
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

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
            </el-col>
        </el-row>

        <!-- 日志详情对话框 -->
        <el-dialog
                v-model="logDetailVisible"
                title="访问记录详情"
                width="700px"
        >
            <div v-if="selectedLog" class="log-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="用户" :span="1">
                        <div class="user-info">
                            <el-avatar :size="32" :src="selectedLog.avatar" :style="{ backgroundColor: getUserColor(selectedLog.username) }">
                                {{ selectedLog.username?.charAt(0)?.toUpperCase() || 'U' }}
                            </el-avatar>
                            <span style="margin-left: 8px;">{{ selectedLog.username || '未知用户' }}</span>
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="IP地址" :span="1">
                        {{ selectedLog.ipAddress || '未知IP' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="请求方法" :span="1">
                        <el-tag :type="getMethodType(selectedLog.accessMethod)">
                            {{ selectedLog.accessMethod || '未知' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="状态码" :span="1">
                        <el-tag :type="getStatusType(selectedLog.statusCode)">
                            {{ selectedLog.statusCode || '未知' }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="请求路径" :span="2">
                        <el-text class="path-text">{{ selectedLog.accessPath || '无' }}</el-text>
                    </el-descriptions-item>
                    <el-descriptions-item label="用户代理" :span="2">
                        <el-text class="user-agent-text">{{ selectedLog.userAgent || '无' }}</el-text>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作模块" :span="1">
                        {{ selectedLog.module || '无' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="操作类型" :span="1">
                        <el-tag>{{ selectedLog.operation || '无' }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="响应时间" :span="1">
                <span :class="getResponseTimeClass(selectedLog.responseTime)">
                    {{ selectedLog.responseTime || 0 }}ms
                </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="操作结果" :span="1">
                        <el-tag :type="selectedLog.result === 'SUCCESS' ? 'success' : 'danger'">
                            {{ selectedLog.result === 'SUCCESS' ? '成功' : (selectedLog.result === 'FAILURE' ? '失败' : '未知') }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="访问时间" :span="2">
                        {{ formatDateTime(selectedLog.accessTime) }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedLog.errorMessage" label="错误信息" :span="2">
                        <el-alert
                                :title="selectedLog.errorMessage"
                                type="error"
                                :closable="false"
                                show-icon
                        />
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
    User,
    UserFilled,
    ShoppingCart,
    TrendCharts,
    Top,
    Bottom,
    Download,
    Refresh,
    MessageBox
} from '@element-plus/icons-vue'
import { getRecentLogs } from '@/api/operationLog'
import {
    getAnalysisStats,
    getTrendData,
    getBehaviorData,
    getRetentionData
} from '@/api/analysis'

const router = useRouter()

// 响应式数据
const timeRange = ref('7d')
const trendType = ref('both')
const exportLoading = ref(false)
const tableLoading = ref(false)
const logDetailVisible = ref(false)
const selectedLog = ref(null)

// 图表引用
const trendChart = ref(null)
const behaviorChart = ref(null)
const retentionChart = ref(null)

// 图表实例
let trendChartInstance = null
let behaviorChartInstance = null
let retentionChartInstance = null

// 统计数据
const stats = ref({
    totalUsers: 1234,
    activeUsers: 892,
    totalOrders: 5678,
    overallGrowthRate: 23.5,
    userGrowthRate: 12.5,
    activeGrowthRate: 8.3,
    sessionGrowthRate: 15.2,
    growth: -2.1,
    todayLogins: 156,
    weekActiveUsers: 892,
    avgSessionTime: 12.5
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 访问日志数据
const accessLogs = ref([]);
// const accessLogs = ref([
//     {
//         id: 1,
//         username: 'admin',
//         avatar: '',
//         accessMethod: 'GET',
//         accessPath: '/api/users',
//         statusCode: 200,
//         responseTime: 45,
//         accessTime: new Date('2024-01-15 10:30:25'),
//         ipAddress: '192.168.1.100',
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//     },
//     {
//         id: 2,
//         username: 'user01',
//         avatar: '',
//         accessMethod: 'POST',
//         accessPath: '/api/orders',
//         statusCode: 201,
//         responseTime: 120,
//         accessTime: new Date('2024-01-15 10:28:15'),
//         ipAddress: '192.168.1.101',
//         userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
//     },
//     {
//         id: 3,
//         username: 'user02',
//         avatar: '',
//         accessMethod: 'GET',
//         accessPath: '/api/products',
//         statusCode: 200,
//         responseTime: 32,
//         accessTime: new Date('2024-01-15 10:25:40'),
//         ipAddress: '192.168.1.102',
//         userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
//     },
//     {
//         id: 4,
//         username: 'admin',
//         avatar: '',
//         accessMethod: 'PUT',
//         accessPath: '/api/users/1',
//         statusCode: 200,
//         responseTime: 78,
//         accessTime: new Date('2024-01-15 10:20:30'),
//         ipAddress: '192.168.1.100',
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//     },
//     {
//         id: 5,
//         username: 'user03',
//         avatar: '',
//         accessMethod: 'DELETE',
//         accessPath: '/api/orders/5',
//         statusCode: 204,
//         responseTime: 95,
//         accessTime: new Date('2024-01-15 10:18:22'),
//         ipAddress: '192.168.1.103',
//         userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//     }
// ])

// 生命周期
onMounted(() => {
    loadData()
    initCharts()
})

// 监听时间范围变化
watch(timeRange, () => {
    loadData()
})

watch(trendType, () => {
    updateTrendChart()
})

// 加载数据
const loadData = async () => {
    tableLoading.value = true
    try {
        // 并行加载所有数据
        const [statsRes, trendRes, behaviorRes, retentionRes] = await Promise.all([
            getAnalysisStats(timeRange.value),
            getTrendData(timeRange.value),
            getBehaviorData(timeRange.value),
            getRetentionData(timeRange.value)
        ])

        // 更新统计数据
        stats.value = {
            // 指标数值
            totalUsers: statsRes.data.totalUsers,
            activeUsers: statsRes.data.activeUsers,
            sessionCount: statsRes.data.sessionCount,

            // 各个增长率
            userGrowthRate: statsRes.data.userGrowth,      // 用户增长率
            activeGrowthRate: statsRes.data.activeGrowth,  // 活跃用户增长率
            sessionGrowthRate: statsRes.data.sessionGrowth, // 会话增长率

            // 综合增长率
            overallGrowthRate: statsRes.data.growthRate,

            // 其他数据
            todayLogins: statsRes.data.todayLogins,
            weekActiveUsers: statsRes.data.weekActiveUsers,
            avgSessionTime: statsRes.data.avgSessionTime
        }

        // 更新图表数据
        trendData.value = trendRes.data
        behaviorData.value = behaviorRes.data
        retentionData.value = retentionRes.data

        // 更新图表
        updateAllCharts()

        // 获取最近访问记录
        const response = await getRecentLogs()
        accessLogs.value = response.data.map(log => ({
            id: log.id,
            username: log.operator,
            avatar: '',
            accessMethod: log.requestMethod,
            accessPath: log.requestUrl,
            statusCode: log.statusCode,
            responseTime: log.executionTime,
            accessTime: log.accessTime || log.createTime,
            ipAddress: log.operatorIp,
            userAgent: log.userAgent,
            operation: log.operation,
            module: log.module,
            result: log.result
        }))

        pagination.total = accessLogs.value.length
        updateCharts()
    } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
    } finally {
        tableLoading.value = false
    }
}
// 更新所有图表
const updateAllCharts = () => {
    updateTrendChart()
    updateBehaviorChart()
    updateRetentionChart()
}

// 添加图表数据
const trendData = ref([])
const behaviorData = ref([])
const retentionData = ref([])
// 初始化图表
const initCharts = () => {
    nextTick(() => {
        initTrendChart()
        initBehaviorChart()
        initRetentionChart()
    })
}

// 初始化趋势图表
const initTrendChart = () => {
    if (!trendChart.value) return

    trendChartInstance = echarts.init(trendChart.value)
    updateTrendChart()
}

// 初始化行为分布图表
const initBehaviorChart = () => {
    if (!behaviorChart.value) return

    behaviorChartInstance = echarts.init(behaviorChart.value)
    updateBehaviorChart()
}
// 更新行为分布图表（优化布局）
// 修改 updateBehaviorChart 方法
const updateBehaviorChart = () => {
    if (!behaviorChartInstance || behaviorData.value.length === 0) return;

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10, // 减小右边距
            top: 'middle', // 垂直居中
            height: '80%', // 限制图例高度
            itemGap: 10, // 减小图例项间距
            itemWidth: 12,
            itemHeight: 12,
            textStyle: {
                fontSize: 12,
                color: '#606266'
            },
            formatter: function (name) {
                const item = behaviorData.value.find(d => d.name === name)
                if (item) {
                    const total = behaviorData.value.reduce((sum, d) => sum + d.value, 0)
                    const percentage = ((item.value / total) * 100).toFixed(1)
                    // 限制名称长度，防止过长
                    const displayName = name.length > 6 ? name.substring(0, 5) + '...' : name
                    return `${displayName} ${percentage}%`
                }
                return name
            }
        },
        series: [{
            name: '用户行为',
            type: 'pie',
            radius: ['30%', '55%'], // 减小半径
            center: ['30%', '50%'], // 饼图向左移动
            avoidLabelOverlap: true, // 启用避免标签重叠
            itemStyle: {
                borderRadius: 6,
                borderColor: '#fff',
                borderWidth: 2,
                color: (params) => {
                    const item = behaviorData.value[params.dataIndex]
                    return item ? item.color : '#999999'
                }
            },
            label: {
                show: false, // 关闭饼图上的标签
                position: 'center'
            },
            emphasis: {
                label: {
                    show: false // 关闭高亮时的标签
                },
                scale: true,
                scaleSize: 8
            },
            labelLine: {
                show: false
            },
            data: behaviorData.value.map(item => ({
                name: item.name,
                value: item.value
            }))
        }],
        // 移除中间的文本图形，因为空间不够
        graphic: []
    };

    behaviorChartInstance.setOption(option, true);

    // 添加响应式调整
    setTimeout(() => {
        behaviorChartInstance.resize();
    }, 100);
}

// 初始化用户留存率图表
const initRetentionChart = () => {
    if (!retentionChart.value) return

    retentionChartInstance = echarts.init(retentionChart.value)
    updateRetentionChart()
}
const updateRetentionChart = () => {
    if (!retentionChartInstance || retentionData.value.length === 0) return

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                let result = params[0].name + '<br/>'
                params.forEach(param => {
                    result += `${param.marker} ${param.seriesName}: ${param.value}%<br/>`
                })
                return result
            }
        },
        legend: {
            data: ['次日留存', '7日留存', '30日留存'],
            right: 20,
            top: 10,
            itemGap: 12,
            itemWidth: 12,
            itemHeight: 12
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '12%',
            top: '20%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: retentionData.value.map(item => item.period),
            axisLabel: {
                interval: 0
            }
        },
        yAxis: {
            type: 'value',
            name: '留存率(%)',
            max: 100,
            axisLabel: {
                formatter: '{value}%'
            }
        },
        series: [
            {
                name: '次日留存',
                type: 'line',
                smooth: true,
                data: retentionData.value.map(item => item.retention1Day),
                itemStyle: { color: '#5470c6' },
                lineStyle: {
                    width: 3
                },
                symbolSize: 8
            },
            {
                name: '7日留存',
                type: 'line',
                smooth: true,
                data: retentionData.value.map(item => item.retention7Day),
                itemStyle: { color: '#91cc75' },
                lineStyle: {
                    width: 3
                },
                symbolSize: 8
            },
            {
                name: '30日留存',
                type: 'line',
                smooth: true,
                data: retentionData.value.map(item => item.retention30Day),
                itemStyle: { color: '#fac858' },
                lineStyle: {
                    width: 3
                },
                symbolSize: 8
            }
        ]
    }

    retentionChartInstance.setOption(option, true)
}

// 更新趋势图表
const updateTrendChart = () => {
    if (!trendChartInstance || trendData.value.length === 0) return

    const dates = trendData.value.map(item => item.date)
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['访问次数', '用户数量', '平均响应时间'],
            right: 10,
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '12%', // 增加底部间距
            top: '20%',    // 增加顶部间距
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates,
            axisLabel: {
                interval: Math.max(1, Math.floor(dates.length / 10)) // 避免标签重叠
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '数量',
                position: 'left',
                axisLine: {
                    show: true
                }
            },
            {
                type: 'value',
                name: '时间(ms)',
                position: 'right',
                axisLine: {
                    show: true
                }
            }
        ],
        series: [
            {
                name: '访问次数',
                type: 'line',
                smooth: true,
                data: trendData.value.map(item => item.visitCount),
                itemStyle: { color: '#5470c6' },
                lineStyle: {
                    width: 3
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                        ]
                    }
                }
            },
            {
                name: '用户数量',
                type: 'line',
                smooth: true,
                data: trendData.value.map(item => item.userCount),
                itemStyle: { color: '#91cc75' },
                lineStyle: {
                    width: 3
                }
            },
            {
                name: '平均响应时间',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: trendData.value.map(item => item.avgResponseTime),
                itemStyle: { color: '#fac858' },
                lineStyle: {
                    width: 3,
                    type: 'dashed' // 使用虚线区分
                }
            }
        ]
    }

    // 根据选择的视图类型显示/隐藏系列
    if (trendType.value === 'visit') {
        option.series[1].show = false
        option.series[2].show = false
        option.legend.data = ['访问次数']
    } else if (trendType.value === 'user') {
        option.series[0].show = false
        option.series[2].show = false
        option.legend.data = ['用户数量']
    } else {
        option.series[0].show = true
        option.series[1].show = true
        option.series[2].show = true
        option.legend.data = ['访问次数', '用户数量', '平均响应时间']
    }

    trendChartInstance.setOption(option, true)
}

// 更新所有图表
const updateCharts = () => {
    updateTrendChart()
}

// 工具函数
const generateDates = (range) => {
    const days = parseInt(range)
    const dates = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }
    return dates
}

const generateRandomData = (count, min, max) => {
    return Array.from({ length: count }, () =>
            Math.floor(Math.random() * (max - min + 1)) + min
    )
}

const formatNumber = (num) => {
    if (num === undefined || num === null) {
        return '0' // 或者 return '--' 表示无数据
    }
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
const formatDateTime = (date) => {
    return new Date(date).toLocaleString('zh-CN')
}

const getChangeClass = (change) => {
    return change >= 0 ? 'positive' : 'negative'
}

const getUserColor = (username) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
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

const getStatusType = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 300 && statusCode < 400) return 'warning'
    if (statusCode >= 400 && statusCode < 500) return 'danger'
    if (statusCode >= 500) return 'danger'
    return 'info'
}

const getResponseTimeClass = (responseTime) => {
    if (responseTime < 50) return 'fast'
    if (responseTime < 100) return 'medium'
    return 'slow'
}

// 事件处理
const changeTimeRange = (range) => {
    timeRange.value = range
}

const exportData = async () => {
    exportLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('数据导出成功')
    } catch (error) {
        ElMessage.error('导出失败')
    } finally {
        exportLoading.value = false
    }
}

const refreshData = () => {
    loadData()
    ElMessage.success('数据已刷新')
}

const showAllLogs = () => {
    router.push('/auditLogs')
}

const viewLogDetail = (log) => {
    selectedLog.value = {
        ...log,
        // 确保所有字段都有默认值
        username: log.username || '未知用户',
        ipAddress: log.ipAddress || '未知IP',
        accessMethod: log.accessMethod || '未知',
        statusCode: log.statusCode || 0,
        accessPath: log.accessPath || '无',
        userAgent: log.userAgent || '无',
        module: log.module || '无',
        operation: log.operation || '无',
        responseTime: log.responseTime || 0,
        result: log.result || '未知',
        accessTime: log.accessTime || new Date(),
        errorMessage: log.errorMessage || ''
    }
    logDetailVisible.value = true
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadData()
}

const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadData()
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    behaviorChartInstance?.resize()
    retentionChartInstance?.resize()
})
</script>

<style scoped>
.analysis-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    margin-bottom: 24px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.title-section h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
}

.title-section p {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
}

.toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
}

.stats-cards {
    margin-bottom: 20px;
}

.stats-card {
    border-radius: 12px;
    border: none;
}

.stats-card :deep(.el-card__body) {
    padding: 20px;
}

.stats-content {
    display: flex;
    align-items: center;
}

.stats-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 24px;
    color: white;
}

.user-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.active-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.order-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.revenue-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stats-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1;
}

.stats-label {
    margin: 4px 0;
    color: #909399;
    font-size: 14px;
}

.stats-change {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 4px;
}

.stats-change.positive {
    color: #f56c6c;
}

.stats-change.negative {
    color: #67c23a;
}

.chart-row, .table-row {
    margin-bottom: 20px;
}

.chart-card, .table-card {
    border-radius: 12px;
    border: none;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chart-container {
    height: 300px;
    width: 100%;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}
/* 确保头像容器始终为圆形 */
:deep(.el-avatar) {
    flex-shrink: 0; /* 防止头像被压缩 */
}

.username {
    font-weight: 500;
    word-break: keep-all; /* 防止用户名换行 */
}

/* 在日志详情对话框中也修复同样的问题 */
.log-detail .user-info {
    display: flex;
    align-items: center;
}

.log-detail .user-info :deep(.el-avatar) {
    flex-shrink: 0;
}

.fast {
    color: #67c23a;
    font-weight: 600;
}

.medium {
    color: #e6a23c;
    font-weight: 600;
}

.slow {
    color: #f56c6c;
    font-weight: 600;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.log-detail {
    max-height: 70vh;
    overflow-y: auto;
}

.path-text,
.user-agent-text {
    word-break: break-all;
    white-space: normal;
}

:deep(.el-descriptions) {
    margin-top: 10px;
}

:deep(.el-descriptions__body) {
    background-color: #fafafa;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
    color: #606266;
    width: 100px;
}

:deep(.el-descriptions__content) {
    color: #303133;
}

.user-info {
    display: flex;
    align-items: center;
}
.active-users {
    padding: 0;
}

.active-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;
}

.active-item:last-child {
    border-bottom: none;
}

.active-label {
    color: #606266;
    font-size: 14px;
}

.active-value {
    color: #303133;
    font-weight: 600;
    font-size: 16px;
}
/* 响应式调整 */
@media (max-width: 768px) {
    .analysis-page {
        padding: 12px;
    }

    .header-content {
        flex-direction: column;
        gap: 16px;
    }

    .toolbar {
        width: 100%;
        justify-content: space-between;
    }

    .stats-content {
        flex-direction: column;
        text-align: center;
    }

    .stats-icon {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }
    .active-item {
        padding: 12px 0;
    }

    .active-label {
        font-size: 13px;
    }

    .active-value {
        font-size: 14px;
    }
    /* 移动端表格调整 */
    .user-cell {
        min-width: 120px;
    }

    .log-detail {
        max-height: 60vh;
    }

    :deep(.el-descriptions) {
        font-size: 14px;
    }

    :deep(.el-descriptions__label) {
        width: 80px;
    }
}
</style>
