<template>
    <div class="dashboard">
        <div class="page-header">
            <h1>我的工作台</h1>
            <p>欢迎回来，{{ userInfo.name }}！今天是 {{ currentDate }}</p>
        </div>

        <!-- 快捷操作 -->
        <el-row :gutter="20" class="quick-actions">
            <el-col :xs="12" :sm="6" v-for="action in quickActions" :key="action.name">
                <el-card class="action-card" shadow="hover" @click="handleAction(action)">
                    <div class="action-content">
                        <div class="action-icon" :style="{ background: action.color }">
                            <el-icon><component :is="action.icon" /></el-icon>
                        </div>
                        <div class="action-info">
                            <div class="action-title">{{ action.title }}</div>
                            <div class="action-desc">{{ action.desc }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 待办事项 -->
        <el-row :gutter="20" class="main-content">
            <el-col :xs="24" :lg="12">
                <el-card class="todo-card">
                    <template #header>
                        <div class="card-header">
                            <span>待办事项</span>
                            <div style="display: flex; gap: 8px; align-items: center;">
                <span v-if="todos.length > 0" style="font-size: 12px; color: #909399;">
                    共 {{ todos.length }} 项
                </span>
                                <el-button type="primary" text @click="addTodo">
                                    <el-icon><Plus /></el-icon>
                                    新增
                                </el-button>
                            </div>
                        </div>
                    </template>

                    <div v-loading="loadingTodos" class="todo-list">
                        <div v-if="todos.length === 0" class="empty-todo">
                            <el-empty description="暂无待办事项" :image-size="100">
                                <el-button type="primary" @click="addTodo">创建待办</el-button>
                            </el-empty>
                        </div>

                        <div v-for="(todo, index) in todos" :key="todo.id" class="todo-item">
                            <div class="todo-content">
                                <el-checkbox v-model="todo.completed" @change="updateTodo(todo)">
                                    <span :class="{ 'completed': todo.completed }">{{ todo.title }}</span>
                                </el-checkbox>
                                <div v-if="todo.description" class="todo-description">
                                    {{ todo.description }}
                                </div>
                            </div>
                            <div class="todo-actions">
                                <div class="todo-meta">
                                    <span class="todo-time">{{ todo.time }}</span>
                                    <el-tag size="small" :type="todo.priorityType">{{ todo.priority }}</el-tag>
                                </div>
                                <el-button
                                        size="small"
                                        type="text"
                                        @click="deleteTodo(todo.id, index)"
                                        style="margin-left: 8px;"
                                >
                                    删除
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 最近访问 -->
            <el-col :xs="24" :lg="12">
                <el-card class="recent-card">
                    <template #header>
                        <span>最近访问</span>
                    </template>
                    <div class="recent-list">
                        <div v-for="item in recentAccess" :key="item.id" class="recent-item" @click="gotoPage(item)">
                            <div class="recent-icon">
                                <el-icon><component :is="item.icon" /></el-icon>
                            </div>
                            <div class="recent-info">
                                <div class="recent-title">{{ item.title }}</div>
                                <div class="recent-time">{{ item.time }}</div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 系统通知 -->
        <el-card class="notification-card">
            <template #header>
                <div class="card-header">
                    <span>系统通知</span>
                    <el-badge :value="unreadCount" :max="99">
                        <el-button type="primary" text @click="viewAllNotifications">查看全部</el-button>
                    </el-badge>
                </div>
            </template>
            <div class="notification-list">
                <div v-for="notice in notifications" :key="notice.id" class="notification-item">
                    <div class="notice-icon" :class="notice.type">
                        <el-icon><component :is="notice.icon" /></el-icon>
                    </div>
                    <div class="notice-content">
                        <div class="notice-title">{{ notice.title }}</div>
                        <div class="notice-desc">{{ notice.description }}</div>
                        <div class="notice-time">{{ notice.time }}</div>
                    </div>
                    <el-button v-if="!notice.read" type="primary" link @click="markAsRead(notice)">
                        标记已读
                    </el-button>
                </div>
            </div>
        </el-card>
        <!-- 新增待办对话框 -->
        <el-dialog
                v-model="addDialogVisible"
                title="新增待办事项"
                width="500px"
                @closed="addDialogVisible = false"
        >
            <el-form :model="todoForm" :rules="todoRules" label-width="80px">
                <el-form-item label="标题" prop="title">
                    <el-input
                            v-model="todoForm.title"
                            placeholder="请输入待办事项标题"
                            maxlength="50"
                            show-word-limit
                    />
                </el-form-item>

                <el-form-item label="优先级" prop="priority">
                    <el-radio-group v-model="todoForm.priority">
                        <el-radio label="HIGH">
                            <el-tag type="danger">高</el-tag>
                        </el-radio>
                        <el-radio label="MEDIUM">
                            <el-tag type="warning">中</el-tag>
                        </el-radio>
                        <el-radio label="LOW">
                            <el-tag type="success">低</el-tag>
                        </el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="截止时间">
                    <el-date-picker
                            v-model="todoForm.dueTime"
                            type="datetime"
                            placeholder="选择截止时间（可选）"
                            format="YYYY-MM-DD HH:mm"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :default-time="new Date(2000, 1, 1, 23, 59, 0)"
                            style="width: 100%;"
                            @change="handleDueTimeChange"
                    />
                </el-form-item>

                <!-- 新增：提醒时间 -->
                <el-form-item label="提醒时间">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <!-- 方案1：直接选择提醒时间 -->
                        <el-date-picker
                                v-model="todoForm.remindTime"
                                type="datetime"
                                placeholder="选择提醒时间（可选）"
                                format="YYYY-MM-DD HH:mm"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                style="width: 100%;"
                                :disabled="!todoForm.dueTime"
                                :disabled-date="disabledRemindDate"
                        />

                        <!-- 方案2：快捷选择按钮（推荐） -->
                        <div v-if="todoForm.dueTime" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <el-button
                                    size="small"
                                    @click="setReminder('15_MINUTES')"
                                    :type="todoForm.reminderType === '15_MINUTES' ? 'primary' : ''"
                            >
                                提前15分钟
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('30_MINUTES')"
                                    :type="todoForm.reminderType === '30_MINUTES' ? 'primary' : ''"
                            >
                                提前30分钟
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('1_HOUR')"
                                    :type="todoForm.reminderType === '1_HOUR' ? 'primary' : ''"
                            >
                                提前1小时
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('1_DAY')"
                                    :type="todoForm.reminderType === '1_DAY' ? 'primary' : ''"
                            >
                                提前1天
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('CUSTOM')"
                                    :type="todoForm.reminderType === 'CUSTOM' ? 'primary' : ''"
                            >
                                自定义
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="clearReminder"
                                    :type="!todoForm.reminderType ? 'primary' : ''"
                            >
                                不提醒
                            </el-button>
                        </div>

                        <!-- 显示提醒时间信息 -->
                        <div v-if="todoForm.remindTime" style="color: #909399; font-size: 12px;">
                            将在 {{ formatRemindTimeInfo() }} 提醒
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input
                            v-model="todoForm.description"
                            type="textarea"
                            placeholder="请输入详细描述（可选）"
                            :rows="3"
                            maxlength="200"
                            show-word-limit
                    />
                </el-form-item>

                <el-form-item label="分类">
                    <el-select v-model="todoForm.category" placeholder="请选择分类" style="width: 100%;">
                        <el-option label="工作" value="工作" />
                        <el-option label="学习" value="学习" />
                        <el-option label="生活" value="生活" />
                        <el-option label="会议" value="会议" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
        <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTodo">确定</el-button>
        </span>
            </template>
        </el-dialog>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    User,
    Setting,
    ShoppingCart,
    TrendCharts,
    Bell,
    Clock,
    Star,
    Document,
    Check,
    Warning,
    Plus
} from '@element-plus/icons-vue'
import { getTodayTodos, deleteTodoById, updateTodoStatus, createTodo } from '@/api/todo'
import { getRecentAccess } from '@/api/recent'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
// 动态导入所有图标
const icons = ElementPlusIconsVue
const userInfo = ref({
    name: '管理员',
    role: '系统管理员'
})

const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
}))

// 待办事项（从接口获取）
const todos = ref([])
const loadingTodos = ref(false)

// 快捷操作
const quickActions = ref([
    {
        name: 'userManagement',
        title: '用户管理',
        desc: '管理系统用户',
        icon: User,
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        path: '/user'
    },
    {
        name: 'orderManagement',
        title: '订单处理',
        desc: '查看待处理订单',
        icon: ShoppingCart,
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        path: '/order'
    },
    {
        name: 'dataAnalysis',
        title: '数据分析',
        desc: '查看系统报表',
        icon: TrendCharts,
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        path: '/dashboard'
    },
    {
        name: 'systemSetting',
        title: '系统设置',
        desc: '配置系统参数',
        icon: Setting,
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        path: '/system'
    }
])

// 新增待办对话框相关
const addDialogVisible = ref(false)
const todoForm = reactive({
    title: '',
    priority: 'MEDIUM',
    dueTime: '',
    remindTime: '',
    reminderType: '',
    description: '',
    category: '工作'
})
// 监听截止时间变化
const handleDueTimeChange = (value) => {
    if (value && todoForm.remindTime) {
        // 如果已有提醒时间，检查是否在截止时间之后
        const remindDate = new Date(todoForm.remindTime)
        const dueDate = new Date(value)
        if (remindDate > dueDate) {
            // 提醒时间不能晚于截止时间
            todoForm.remindTime = ''
            todoForm.reminderType = ''
        }
    }
}

// 设置提醒
const setReminder = (type) => {
    if (!todoForm.dueTime) {
        ElMessage.warning('请先设置截止时间')
        return
    }

    const dueDate = new Date(todoForm.dueTime)
    let remindDate = new Date()

    switch (type) {
        case '15_MINUTES':
            remindDate = new Date(dueDate.getTime() - 15 * 60 * 1000)
            break
        case '30_MINUTES':
            remindDate = new Date(dueDate.getTime() - 30 * 60 * 1000)
            break
        case '1_HOUR':
            remindDate = new Date(dueDate.getTime() - 60 * 60 * 1000)
            break
        case '1_DAY':
            remindDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
            break
        case 'CUSTOM':
            // 自定义模式，不自动设置时间
            todoForm.reminderType = 'CUSTOM'
            return
    }

    // 格式化时间为字符串
    const year = remindDate.getFullYear()
    const month = String(remindDate.getMonth() + 1).padStart(2, '0')
    const day = String(remindDate.getDate()).padStart(2, '0')
    const hours = String(remindDate.getHours()).padStart(2, '0')
    const minutes = String(remindDate.getMinutes()).padStart(2, '0')

    todoForm.remindTime = `${year}-${month}-${day} ${hours}:${minutes}:00`
    todoForm.reminderType = type
}

// 清除提醒
const clearReminder = () => {
    todoForm.remindTime = ''
    todoForm.reminderType = ''
}

// 格式化提醒时间信息
const formatRemindTimeInfo = () => {
    if (!todoForm.remindTime || !todoForm.dueTime) return ''

    const remindDate = new Date(todoForm.remindTime)
    const dueDate = new Date(todoForm.dueTime)
    const timeDiff = dueDate.getTime() - remindDate.getTime()

    if (timeDiff < 0) return '提醒时间晚于截止时间'

    const minutes = Math.floor(timeDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `提前${days}天`
    if (hours > 0) return `提前${hours}小时`
    if (minutes > 0) return `提前${minutes}分钟`
    return '截止时提醒'
}

// 禁用提醒日期（不能晚于截止时间）
const disabledRemindDate = (time) => {
    if (!todoForm.dueTime) return false

    const remindDate = new Date(time)
    const dueDate = new Date(todoForm.dueTime)
    return remindDate.getTime() > dueDate.getTime()
}

// 新增待办表单验证规则
const todoRules = {
    title: [
        { required: true, message: '请输入待办标题', trigger: 'blur' },
        { min: 2, max: 50, message: '标题长度为2-50个字符', trigger: 'blur' }
    ],
    priority: [
        { required: true, message: '请选择优先级', trigger: 'change' }
    ]
}

// 加载待办数据
const loadTodos = async () => {
    loadingTodos.value = true
    try {
        const response = await getTodayTodos()
        todos.value = response.data.map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
            time: todo.timeLabel,
            priority: todo.priorityLabel,
            priorityType: getPriorityType(todo.priority),
            description: todo.description
        }))
    } catch (error) {
        console.error('加载待办事项失败:', error)
        ElMessage.error('加载待办事项失败')
    } finally {
        loadingTodos.value = false
    }
}

// 获取优先级对应的颜色类型
const getPriorityType = (priority) => {
    switch (priority) {
        case 'HIGH': return 'danger'
        case 'MEDIUM': return 'warning'
        case 'LOW': return 'success'
        default: return 'info'
    }
}

// 新增待办
const addTodo = () => {
    addDialogVisible.value = true
    Object.assign(todoForm, {
        title: '',
        priority: 'MEDIUM',
        dueTime: '',
        description: ''
    })
}

// 提交新增待办
const submitTodo = async () => {
    try {
        // 构建待办数据
        const todoData = {
            title: todoForm.title.trim(),
            priority: todoForm.priority,
            description: todoForm.description.trim() || '',
            category: todoForm.category,
            type: 'PERSONAL'  // 默认为个人待办
        }

        // 处理截止时间
        if (todoForm.dueTime) {
            todoData.dueTime = todoForm.dueTime
        }

        // 处理提醒时间
        if (todoForm.remindTime) {
            todoData.remindTime = todoForm.remindTime
        }

        console.log('提交的待办数据:', todoData)

        // 调用API
        await createTodo(todoData)
        ElMessage.success('待办事项创建成功')

        // 重置表单
        resetTodoForm()
        addDialogVisible.value = false

        // 重新加载待办列表
        await loadTodos()
    } catch (error) {
        console.error('创建待办失败:', error)
        ElMessage.error('创建失败: ' + (error.response?.data?.message || error.message))
    }
}

// 重置表单
const resetTodoForm = () => {
    Object.assign(todoForm, {
        title: '',
        priority: 'MEDIUM',
        dueTime: '',
        remindTime: '',
        reminderType: '',
        description: '',
        category: '工作'
    })
}

// 删除待办
const deleteTodo = async (todoId, index) => {
    try {
        await ElMessageBox.confirm('确定要删除这个待办事项吗？', '提示', {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        });

        // 调用删除接口
        await deleteTodoById(todoId);

        // 从列表中移除
        todos.value.splice(index, 1);
        ElMessage.success('删除成功');
    } catch (error) {
        // 用户取消删除或删除失败
        if (error && error !== 'cancel') {
            console.error('删除待办失败:', error);
            ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message));
        }
    }
};

// 最近访问记录
const recentAccess = ref([])
const loadingRecent = ref(false)

// 加载最近访问记录
const loadRecentAccess = async () => {
    loadingRecent.value = true
    try {
        const response = await getRecentAccess()
        if (response.data && response.data.code === 200) {
            const data = response.data.data
            // 转换数据格式，确保有图标组件
            recentAccess.value = data.map(item => {
                // 获取图标组件，如果找不到则使用默认图标
                const iconComponent = icons[item.menuIcon] || Document

                return {
                    id: item.id,
                    title: item.menuName,
                    path: item.menuPath,
                    icon: iconComponent,
                    time: item.displayTime || '未知时间',
                    rawTime: item.accessTime,
                    visitCount: item.visitCount || 1
                }
            })
        }
    } catch (error) {
        console.error('加载最近访问记录失败:', error)
        ElMessage.error('加载最近访问记录失败')
        // 如果API失败，使用默认数据
        recentAccess.value = getDefaultRecentAccess()
    } finally {
        loadingRecent.value = false
    }
}

// 默认的最近访问数据
const getDefaultRecentAccess = () => {
    return [
        {
            id: 1,
            title: '用户管理',
            path: '/user',
            icon: User,
            time: '10分钟前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        },
        {
            id: 2,
            title: '订单处理',
            path: '/order',
            icon: ShoppingCart,
            time: '30分钟前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        },
        {
            id: 3,
            title: '系统分析',
            path: '/analysis',
            icon: TrendCharts,
            time: '1小时前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        }
    ]
}

// 最近访问
// const recentAccess = ref([
//     {
//         id: 1,
//         title: '用户管理',
//         path: '/user',
//         icon: User,
//         time: '10分钟前'
//     },
//     {
//         id: 2,
//         title: '订单管理',
//         path: '/order',
//         icon: ShoppingCart,
//         time: '30分钟前'
//     },
//     {
//         id: 3,
//         title: '系统分析',
//         path: '/analysis',
//         icon: TrendCharts,
//         time: '1小时前'
//     }
// ])

// 系统通知
const notifications = ref([
    {
        id: 1,
        title: '新用户注册',
        description: '用户 "张三" 完成了注册，请及时审核',
        type: 'info',
        icon: User,
        time: '5分钟前',
        read: false
    },
    {
        id: 2,
        title: '订单待处理',
        description: '有3个新订单等待处理',
        type: 'warning',
        icon: ShoppingCart,
        time: '10分钟前',
        read: false
    },
    {
        id: 3,
        title: '系统更新',
        description: '系统已更新至最新版本 v1.2.0',
        type: 'success',
        icon: Check,
        time: '1小时前',
        read: true
    }
])

const unreadCount = computed(() => {
    return notifications.value.filter(notice => !notice.read).length
})

const handleAction = (action) => {
    router.push(action.path)
}

// 更新待办状态
const updateTodo = async (todo) => {
    try {
        await updateTodoStatus(todo.id, todo.completed)
        ElMessage.success(`任务 "${todo.title}" ${todo.completed ? '已完成' : '标记为未完成'}`)

        // 如果是完成状态，3秒后从列表中移除
        if (todo.completed) {
            setTimeout(() => {
                todos.value = todos.value.filter(t => t.id !== todo.id)
            }, 3000)
        }
    } catch (error) {
        console.error('更新待办状态失败:', error)
        ElMessage.error('更新失败')
        // 恢复原状态
        todo.completed = !todo.completed
    }
}

const gotoPage = (item) => {
    router.push(item.path)
}

const viewAllNotifications = () => {
    ElMessage.info('查看全部通知功能开发中...')
}

const markAsRead = (notice) => {
    notice.read = true
    ElMessage.success('标记为已读')
}

onMounted(async () => {
    // loadTodos()
    await Promise.all([
        loadTodos(),
        loadRecentAccess()
    ])

    // 设置定时刷新最近访问记录（每分钟刷新一次）
    refreshTimer = setInterval(() => {
        loadRecentAccess()
    }, 60000)
})

// 清理定时器
let refreshTimer = null
onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
})
</script>

<style scoped>
.dashboard {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    margin-bottom: 24px;
}

.page-header h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
}

.page-header p {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
}

.quick-actions {
    margin-bottom: 20px;
}

.action-card {
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 12px;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.action-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.action-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 20px;
    color: white;
}

.action-title {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
}

.action-desc {
    color: #909399;
    font-size: 12px;
}

.main-content {
    margin-bottom: 20px;
}

.todo-list, .recent-list, .notification-list {
    padding: 0;
}

.todo-item, .recent-item, .notification-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}

.todo-item:last-child, .recent-item:last-child, .notification-item:last-child {
    border-bottom: none;
}

.todo-item {
    justify-content: space-between;
}

.completed {
    text-decoration: line-through;
    color: #909399;
}

.todo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.todo-time {
    color: #909399;
    font-size: 12px;
}

.recent-item {
    gap: 12px;
}

.recent-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
}

.recent-title {
    font-weight: 500;
    color: #303133;
}

.recent-time {
    color: #909399;
    font-size: 12px;
    margin-top: 2px;
}

.notice-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 18px;
}

.notice-icon.info {
    background: #ecf5ff;
    color: #409EFF;
}

.notice-icon.warning {
    background: #fdf6ec;
    color: #e6a23c;
}

.notice-icon.success {
    background: #f0f9eb;
    color: #67c23a;
}

.notice-content {
    flex: 1;
}

.notice-title {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
}

.notice-desc {
    color: #606266;
    font-size: 14px;
    margin-bottom: 4px;
}

.notice-time {
    color: #909399;
    font-size: 12px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 在 Workstation.vue 的 style 部分添加 */
.todo-content {
    flex: 1;
    min-width: 0;
}

.todo-description {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.4;
    max-height: 36px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.todo-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.empty-todo {
    padding: 40px 0;
    text-align: center;
}

.completed {
    text-decoration: line-through;
    color: #909399 !important;
}

/* 待办项悬停效果 */
.todo-item:hover {
    background-color: #fafafa;
    border-radius: 4px;
    margin: 0 -16px;
    padding: 12px 16px;
}
</style>
