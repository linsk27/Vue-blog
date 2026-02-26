<template>
    <div class="write-article-container">
        <!-- 页面头部 -->
        <div class="write-article-header">
            <div class="header-content">
                <h1 class="write-title">
                    <span class="title-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30L15 10L25 15L30 5" stroke="white" stroke-width="3" stroke-linecap="round"
                                stroke-linejoin="round" />
                            <path d="M5 35H35" stroke="white" stroke-width="3" stroke-linecap="round" />
                        </svg>
                    </span>
                    {{ isEditing ? '编辑文章' : '创作新文章' }}
                </h1>
                <p class="write-subtitle">打造高质量内容，分享你的知识和见解</p>
            </div>
        </div>

        <!-- 文章编辑区域 -->
        <div class="write-article-content">
            <!-- 文章标题 -->
            <div class="form-section">
                <el-input v-model="article.title" placeholder="请输入文章标题" class="title-input" :prefix-icon="Document"
                    :class="{ 'title-input-focused': titleFocused }" @focus="titleFocused = true"
                    @blur="titleFocused = false" />
            </div>

            <!-- 文章分类和标签 -->
            <div class="form-row">
                <!-- 文章分类 -->
                <div class="form-section half-width">
                    <el-select v-model="article.category" placeholder="请选择文章分类" class="category-select"
                        :prefix-icon="Grid" :class="{ 'select-focused': categoryFocused }"
                        @focus="categoryFocused = true" @blur="categoryFocused = false">
                        <el-option v-for="category in categories" :key="category.value" :label="category.label"
                            :value="category.value" />
                    </el-select>
                </div>

                <!-- 文章标签 -->
                <div class="form-section half-width">
                    <div class="tag-input-container">
                        <el-input v-model="newTag" placeholder="请输入文章标签，按回车确认" class="tag-input" @keyup.enter="addTag"
                            clearable :class="{ 'tag-input-focused': tagFocused }" @focus="tagFocused = true"
                            @blur="tagFocused = false" />
                    </div>
                </div>
            </div>

            <!-- 标签列表 -->
            <div class="tags-display-section">
                <div class="tag-list">
                    <el-tag v-for="(tag, index) in article.tags" :key="index" closable @close="removeTag(index)"
                        class="article-tag">
                        {{ tag }}
                    </el-tag>
                </div>
            </div>

            <!-- 文章内容 -->
            <div class="form-section editor-section">
                <div class="editor-header">
                    <h3 class="editor-title">文章内容</h3>
                    <div class="editor-tools">
                        <span class="tool-tip">💡 提示：支持富文本编辑，可插入图片、链接和代码</span>
                        <span class="content-stats">
                            {{ contentStats.words }} 字 · {{ contentStats.paragraphs }} 段
                        </span>
                        <el-button type="danger" size="small" @click="handleClearContent" class="clear-button">
                            清空内容
                        </el-button>
                    </div>
                </div>
                <div class="editor-wrapper">
                    <div ref="editorRef" class="quill-editor"></div>
                </div>
            </div>

            <!-- 文章摘要 -->
            <div class="form-section">
                <el-input v-model="article.summary" type="textarea" placeholder="请输入文章摘要（可选，不填写将自动生成）" :rows="3"
                    class="summary-input" :prefix-icon="CopyDocument"
                    :class="{ 'summary-input-focused': summaryFocused }" @focus="summaryFocused = true"
                    @blur="summaryFocused = false" />
            </div>

            <!-- 操作按钮 -->
            <div class="action-section">
                <el-button type="default" @click="handleCancel" class="cancel-button">
                    <ArrowLeft /> 取消
                </el-button>
                <el-button type="primary" @click="handleSave" :loading="saving" class="save-button">
                    <Upload /> {{ isEditing ? '保存修改' : '发布文章' }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useElMessage } from '@/hooks/useMessage'
import { usePermission } from '@/hooks/usePermission'
import { Document, Grid, CopyDocument, ArrowLeft, Upload } from '@element-plus/icons-vue'
import articleApi from '@/api/modules/article'

// 导入Quill.js富文本编辑器
// @ts-ignore
import Quill from 'quill'
import 'quill/dist/quill.snow.css'

// 导入代码高亮库
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 导入文章数据
import { articles } from './articles/index'

const router = useRouter()
const route = useRoute()
const { message } = useElMessage()
const { hasPermission } = usePermission()

// 检查权限
onMounted(() => {
    if (!hasPermission('article:create')) {
        message.warning('您没有权限创作文章，请联系管理员')
        router.push('/')
    }
})

// 富文本编辑器引用
const editorRef = ref<HTMLElement | null>(null)
let quillEditor: Quill | null = null

// 表单焦点状态
const titleFocused = ref(false)
const categoryFocused = ref(false)
const tagFocused = ref(false)
const summaryFocused = ref(false)

// 文章分类
const categories = [
    { value: 'frontend', label: '前端开发' },
    { value: 'backend', label: '后端开发' },
    { value: 'database', label: '数据库' },
    { value: 'algorithm', label: '算法' },
    { value: 'devops', label: 'DevOps' },
    { value: 'architecture', label: '架构设计' },
    { value: 'ai', label: '人工智能' },
    { value: 'other', label: '其他' }
]

// 文章数据
const articleId = computed(() => route.params.id as string)
const isEditing = computed(() => !!articleId.value)

const article = reactive({
    id: '',
    title: '',
    category: '',
    tags: [] as string[],
    content: '',
    summary: '',
    createTime: ''
})

// 新标签输入
const newTag = ref('')

// 编辑器内容统计
const contentStats = reactive({
    words: 0,
    paragraphs: 0
})

// 添加标签
const addTag = () => {
    const tag = newTag.value.trim()
    if (tag && !article.tags.includes(tag)) {
        article.tags.push(tag)
        newTag.value = ''
        handleTagsChange(article.tags)
    }
}

// 移除标签
const removeTag = (index: number) => {
    article.tags.splice(index, 1)
    handleTagsChange(article.tags)
}

// 处理标签变化
const handleTagsChange = (tags: string[]) => {
    // 可以在这里添加标签验证逻辑
    console.log('Tags changed:', tags)
}

// 图片上传处理函数
const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 创建FormData对象
        const formData = new FormData()
        formData.append('image', file)

        // 模拟图片上传过程
        setTimeout(() => {
            // 模拟上传成功，返回图片URL
            // 在实际应用中，这里应该调用真实的上传API
            const mockImageUrl = `https://picsum.photos/800/600?random=${Date.now()}`
            resolve(mockImageUrl)
        }, 1000)

        // 实际的上传代码示例
        /*
        axios.post('/api/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            if (response.data && response.data.url) {
                resolve(response.data.url)
            } else {
                reject(new Error('上传失败：无效的响应'))
            }
        })
        .catch(error => {
            reject(new Error(`上传失败：${error.message}`))
        })
        */
    })
}

// 初始化富文本编辑器
const initEditor = () => {
    if (editorRef.value) {
        // 配置Quill编辑器
        const toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // 粗体、斜体、下划线、删除线
            ['blockquote', 'code-block'],                    // 引用、代码块
            [{ 'header': 1 }, { 'header': 2 }],               // 标题1、标题2
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],   // 有序列表、无序列表
            [{ 'script': 'sub' }, { 'script': 'super' }],    // 上标、下标
            [{ 'indent': '-1' }, { 'indent': '+1' }],        // 缩进
            [{ 'direction': 'rtl' }],                        // 文本方向
            [{ 'size': ['small', false, 'large', 'huge'] }],  // 字体大小
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],       // 标题级别
            [{ 'color': [] }, { 'background': [] }],          // 字体颜色、背景颜色
            [{ 'font': [] }],                                // 字体
            [{ 'align': [] }],                               // 对齐方式
            ['clean'],                                       // 清除格式
            ['link', 'image', 'video']                       // 链接、图片、视频
        ]

        // 自定义工具栏处理
        const toolbarHandlers = {
            image: function () {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = 'image/*'
                input.onchange = async (e) => {
                    const target = e.target as HTMLInputElement
                    if (target.files && target.files[0]) {
                        const file = target.files[0]
                        try {
                            // 显示加载状态
                            message.info('图片上传中...')

                            // 上传图片
                            const imageUrl = await handleImageUpload(file)

                            // 隐藏加载状态
                            message.success('图片上传成功')

                            // 获取编辑器选区
                            const selection = quillEditor?.getSelection()
                            if (selection) {
                                // 在选区插入图片
                                quillEditor?.insertEmbed(selection.index, 'image', imageUrl)
                            } else {
                                // 如果没有选区，在末尾插入图片
                                quillEditor?.insertEmbed(quillEditor.getLength(), 'image', imageUrl)
                            }
                        } catch (error) {
                            message.error('图片上传失败，请重试')
                            console.error('Image upload error:', error)
                        }
                    }
                }
                input.click()
            },
            clean: function () {
                if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
                    quillEditor?.setText('')
                    message.success('内容已清空')
                }
            }
        }

        // 创建Quill编辑器实例
        quillEditor = new Quill(editorRef.value, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbarOptions,
                    handlers: toolbarHandlers
                }
            },
            placeholder: '开始编写你的文章...',
            scrollingContainer: '.quill-editor'
        })

        // 代码高亮处理函数
        const highlightCode = () => {
            const codeBlocks = quillEditor?.root.querySelectorAll('pre.ql-code-block code')
            codeBlocks?.forEach((block: any) => {
                hljs.highlightElement(block)
            })
        }

        // 更新内容统计
        const updateContentStats = () => {
            if (quillEditor) {
                // 获取纯文本内容
                const text = quillEditor.getText()

                // 1. 统计单词数（同时支持英文和中文）
                let wordCount = 0
                if (text.trim()) {
                    // 对于英文，按空格分割
                    const englishWords = text.trim().replace(/\s+/g, ' ').split(' ').filter((word: string | any[]) => word.length > 0)

                    // 对于中文，统计中文字符数
                    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []

                    // 综合统计：英文单词数 + 中文字符数
                    wordCount = englishWords.length + chineseChars.length
                }

                // 2. 统计段落数
                let paragraphCount = 0
                if (text.trim()) {
                    // 按换行符分割，过滤空段落
                    paragraphCount = text.trim().split(/\n+/).filter((paragraph: string | any[]) => paragraph.length > 0).length
                }

                // 3. 确保至少有一个段落（如果有内容）
                if (text.trim() && paragraphCount === 0) {
                    paragraphCount = 1
                }

                // 更新统计数据
                contentStats.words = wordCount
                contentStats.paragraphs = paragraphCount

                // 调试信息
                console.log('Content stats:', {
                    text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                    wordCount,
                    paragraphCount
                })
            }
        }

        // 初始化时执行一次内容统计
        setTimeout(updateContentStats, 200)

        // 监听内容变化，处理代码高亮和内容统计
        quillEditor.on('text-change', () => {
            article.content = quillEditor?.root.innerHTML || ''
            // 延迟执行高亮，确保DOM已更新
            setTimeout(highlightCode, 0)
            // 更新内容统计
            updateContentStats()
        })

        // 监听代码块添加事件
        quillEditor.on('selection-change', () => {
            // 当选择变化时也检查代码高亮
            setTimeout(highlightCode, 0)
        })

        // 如果是编辑模式，加载现有内容并处理代码高亮
        if (isEditing.value) {
            quillEditor.root.innerHTML = article.content
            // 加载内容后执行代码高亮和内容统计
            setTimeout(() => {
                highlightCode()
                updateContentStats()
            }, 0)
        } else {
            // 初始化时也执行一次代码高亮和内容统计（如果有默认内容）
            setTimeout(() => {
                highlightCode()
                updateContentStats()
            }, 0)
        }

        // 简化工具栏按钮提示 - 直接在CSS中添加
        // 为清空按钮添加视觉标识
        setTimeout(() => {
            const cleanButton: HTMLElement | null = document.querySelector('.ql-toolbar.ql-snow button.ql-clean')
            if (cleanButton) {
                cleanButton.title = '清空内容'
                // 添加醒目的视觉标识
                cleanButton.style.backgroundColor = '#fef2f2'
                cleanButton.style.borderColor = '#fecaca'
                cleanButton.style.color = '#dc2626'
                cleanButton.style.padding = '8px'
                cleanButton.style.borderRadius = '4px'
            }
        }, 100)
    }
}

// 加载文章数据（编辑模式）
if (isEditing.value) {
    // 从API获取文章详情
    articleApi.getDetail(articleId.value).then((data: any) => {
        if (data) {
            article.id = String(data.id)
            article.title = data.title
            article.content = data.content
            article.summary = data.summary || ''
            article.category = data.category || ''
            article.tags = data.tags || []
            article.createTime = data.created_at

            // 更新编辑器内容
            if (quillEditor) {
                quillEditor.root.innerHTML = article.content
                // 触发高亮和统计更新
                setTimeout(() => {
                    const codeBlocks = quillEditor?.root.querySelectorAll('pre.ql-code-block code')
                    codeBlocks?.forEach((block: any) => {
                        hljs.highlightElement(block)
                    })
                }, 100)
            }
        }
    }).catch(err => {
        console.error('Failed to load article:', err)
        message.error('加载文章失败')
    })
}

// 组件挂载后初始化编辑器
onMounted(() => {
    nextTick(() => {
        initEditor()
    })
})

const saving = ref(false)

// 保存文章
const handleSave = async () => {
    // 表单验证
    if (!article.title.trim()) {
        message.warning('请输入文章标题')
        return
    }

    if (!article.content.trim()) {
        message.warning('请输入文章内容')
        return
    }

    if (!article.summary.trim()) {
        // 自动生成摘要
        article.summary = article.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
    }

    saving.value = true

    try {
        const params = {
            title: article.title,
            content: article.content,
            summary: article.summary,
            category: article.category,
            tags: article.tags
        }

        if (isEditing.value) {
            // 更新现有文章
            await articleApi.update(article.id, params)
            message.success('文章修改成功')
        } else {
            // 创建新文章
            const res = await articleApi.create(params)
            article.id = String(res.id) // 确保ID类型匹配
            message.success('文章发布成功')
        }

        // 返回文章列表页
        router.push('/essays')
    } catch (error) {
        message.error('保存失败，请稍后重试')
        console.error('Save error:', error)
    } finally {
        saving.value = false
    }
}

// 清空内容操作
const handleClearContent = () => {
    if (confirm('确定要清空所有内容吗？此操作不可撤销。')) {
        quillEditor?.setText('')
        article.content = ''
        // 更新内容统计
        contentStats.words = 0
        contentStats.paragraphs = 0
        message.success('内容已清空')
    }
}

// 取消操作
const handleCancel = () => {
    if (article.title || article.content) {
        if (confirm('确定要放弃当前编辑内容吗？')) {
            router.push('/essays')
        }
    } else {
        router.push('/essays')
    }
}
</script>

<style>
/* 全局样式重置 */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* Quill编辑器样式覆盖 */
.quill-editor {
    min-height: 500px;
    border-radius: 12px;
}

.ql-container {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
    font-size: 16px;
    line-height: 1.7;
}

.ql-toolbar {
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
}

.ql-toolbar.ql-snow .ql-picker-label {
    color: #475569;
}

.ql-toolbar.ql-snow .ql-picker-label:hover,
.ql-toolbar.ql-snow .ql-picker-item:hover {
    color: var(--primary-color);
}

.ql-toolbar.ql-snow .ql-picker-item.ql-selected {
    color: var(--primary-color);
}

.ql-toolbar.ql-snow .ql-picker-options {
    border-radius: 8px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.ql-toolbar.ql-snow button:hover {
    color: var(--primary-color);
}

.ql-toolbar.ql-snow button.ql-active {
    color: var(--primary-color);
}

.ql-editor h1,
.ql-editor h2,
.ql-editor h3,
.ql-editor h4,
.ql-editor h5,
.ql-editor h6 {
    color: #1e293b;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.ql-editor p {
    margin-bottom: 1rem;
}

.ql-editor ul,
.ql-editor ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
}

.ql-editor li {
    margin-bottom: 0.5rem;
}

.ql-editor pre {
    background-color: #f1f5f9;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    overflow-x: auto;
}

.ql-editor code {
    background-color: #f1f5f9;
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
}

.ql-editor blockquote {
    border-left: 4px solid var(--primary-color);
    margin: 1rem 0;
    padding-left: 1rem;
    color: var(--text-muted);
    font-style: italic;
}

/* 图片样式 */
.ql-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ql-editor img:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* 响应式图片 */
@media (max-width: 768px) {
    .ql-editor img {
        margin: 0.75rem 0;
        border-radius: 6px;
    }
}

/* 全局变量定义 - 新的颜色方案 */
:root {
    /* 主色调 - 橙色主题 */
    --primary-color: #FF7F50;
    --primary-dark: #FF6347;
    --primary-light: #FFA07A;
    --primary-lighter: #FFDAB9;
    --primary-lightest: #FFF5F0;

    /* 辅助色 - 更鲜明的对比色 */
    --secondary-color: #E67E22;
    --secondary-light: #FAD7A0;
    --accent-color: #D35400;
    --accent-light: #EDBB99;
    --warning-color: #F39C12;
    --warning-light: #FDEBD0;

    /* 中性色 */
    --text-primary: #111827;
    --text-secondary: #374151;
    --text-muted: #6B7280;
    --background-primary: #FFFFFF;
    --background-secondary: #FFF8F5;
    --background-tertiary: #FFF0E6;
    --border-color: #FEE8D6;
    --border-light: #FFF5EE;

    /* 阴影 */
    --shadow-sm: 0 1px 2px 0 rgba(255, 127, 80, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(255, 127, 80, 0.1), 0 2px 4px -1px rgba(255, 127, 80, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(255, 127, 80, 0.1), 0 4px 6px -2px rgba(255, 127, 80, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(255, 127, 80, 0.1), 0 10px 10px -5px rgba(255, 127, 80, 0.04);
    --shadow-2xl: 0 25px 50px -12px rgba(255, 127, 80, 0.25);

    /* 边框半径 */
    --border-radius-sm: 0.375rem;
    --border-radius-md: 0.5rem;
    --border-radius-lg: 0.75rem;
    --border-radius-xl: 1rem;
    --border-radius-2xl: 1.5rem;
    --border-radius-3xl: 2rem;

    /* 过渡效果 */
    --transition-fast: 0.15s ease-in-out;
    --transition-normal: 0.3s ease-in-out;
    --transition-slow: 0.5s ease-in-out;
}
</style>

<style scoped>
/* 页面容器 */
.write-article-container {
    width: 100%;
    /* max-width: 1200px; */
    /* margin: 0 auto; */
    padding: 40px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 248, 245, 0.85) 100%);
    min-height: calc(100vh - 140px);
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    position: relative;
    overflow: hidden;
}

/* 背景装饰 */
.write-article-container::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 60%;
    background: radial-gradient(circle at 100% 0%, var(--primary-lightest) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

.write-article-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30%;
    height: 40%;
    background: radial-gradient(circle at 0% 100%, var(--secondary-light) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

/* 页面头部 */
.write-article-header {
    text-align: center;
    margin-bottom: 60px;
    position: relative;
    z-index: 1;
    animation: fadeInDown 0.8s ease-out;
}

.header-content {
    max-width: 800px;
    margin: 0 auto;
}

.write-title {
    font-size: 3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, var(--text-primary) 0%, var(--primary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% 100%;
    animation: gradientShift 3s ease-in-out infinite;
}

.write-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

.title-icon {
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border-radius: 50%;
    box-shadow: var(--shadow-xl);
    animation: pulse 2s ease-in-out infinite;
    border: 3px solid white;
}

/* 文章编辑内容区域 */
.write-article-content {
    max-width: 1200px;
    margin: 0 auto;
    background: var(--background-primary);
    border-radius: var(--border-radius-2xl);
    padding: 50px;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--border-light);
    position: relative;
    z-index: 1;
    animation: slideInUp 0.8s ease-out 0.4s both;
}

/* 表单行布局 */
.form-row {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
}

.half-width {
    flex: 1;
}

/* 表单区域 */
.form-section {
    margin-bottom: 32px;
    transition: var(--transition-normal);
    position: relative;
}

/* 标题输入 */
.title-input {
    font-size: 1.5rem;
    font-weight: 600;
    border-radius: var(--border-radius-lg);
    padding: 1.5rem 2rem;
    border: none;
    transition: var(--transition-normal);
    background: var(--background-secondary);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
}

.title-input::placeholder {
    color: var(--text-muted);
}

.title-input-focused,
.title-input:focus {
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-lighter), var(--shadow-md);
    transform: translateY(-2px);
    background: var(--background-primary);
}

/* 选择器样式 */
.category-select {
    width: 100%;
    border-radius: var(--border-radius-lg);
    padding: 1.25rem 1.75rem;
    border: none;
    transition: var(--transition-normal);
    background: var(--background-secondary);
    box-shadow: var(--shadow-sm);
}

.select-focused,
.category-select:focus {
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-lighter), var(--shadow-md);
    transform: translateY(-2px);
    background: var(--background-primary);
}

/* 标签输入 */
.tag-input-container {
    width: 100%;
}

.tag-input {
    width: 100%;
    border-radius: var(--border-radius-lg);
    padding: 1.25rem 1.75rem;
    border: none;
    transition: var(--transition-normal);
    background: var(--background-secondary);
    box-shadow: var(--shadow-sm);
}

.tag-input-focused,
.tag-input:focus {
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-lighter), var(--shadow-md);
    transform: translateY(-2px);
    background: var(--background-primary);
}

/* 标签显示区域 */
.tags-display-section {
    margin-bottom: 32px;
}

.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.article-tag {
    background: var(--primary-lighter);
    color: var(--primary-color);
    border-color: var(--primary-light);
    font-size: 1rem;
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 25px;
    transition: var(--transition-normal);
    animation: tagSlideIn 0.3s ease-out;
}

.article-tag:hover {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-dark);
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
}

/* 编辑器区域 */
.editor-section {
    margin-bottom: 40px;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.editor-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.editor-tools {
    display: flex;
    align-items: center;
}

.tool-tip {
    font-size: 0.9rem;
    color: var(--text-muted);
    background: var(--background-tertiary);
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    border: none;
    margin-right: 16px;
}

.content-stats {
    font-size: 0.9rem;
    color: var(--primary-color);
    background: var(--primary-lightest);
    padding: 8px 16px;
    border-radius: var(--border-radius-md);
    font-weight: 500;
    border: 1px solid var(--primary-lighter);
    margin-right: 16px;
}

.clear-button {
    font-size: 0.9rem;
    font-weight: 500;
    border-radius: var(--border-radius-md);
    transition: var(--transition-normal);
}

.clear-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.editor-wrapper {
    border: 2px solid transparent;
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    transition: var(--transition-normal);
    background: var(--background-primary);
    min-height: 600px;
    box-shadow: var(--shadow-md);
}

.editor-wrapper:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
}

.editor-wrapper:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), var(--shadow-lg);
    transform: translateY(-2px);
}

.quill-editor {
    min-height: 600px;
    max-height: 800px;
    overflow-y: auto;
}

/* 摘要输入 */
.summary-input {
    width: 100%;
    border-radius: var(--border-radius-lg);
    padding: 1.5rem 2rem;
    border: none;
    transition: var(--transition-normal);
    background: var(--background-secondary);
    font-size: 1rem;
    line-height: 1.6;
    box-shadow: var(--shadow-sm);
}

.summary-input::placeholder {
    color: var(--text-muted);
}

.summary-input-focused,
.summary-input:focus {
    border: 1px solid var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-lighter), var(--shadow-md);
    transform: translateY(-2px);
    background: var(--background-primary);
}

/* 操作按钮区域 */
.action-section {
    display: flex;
    justify-content: flex-end;
    gap: 20px;
    margin-top: 60px;
    padding-top: 40px;
    border-top: 2px solid var(--border-light);
}

/* 按钮样式 */
.cancel-button,
.save-button {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    border-radius: var(--border-radius-lg);
    transition: var(--transition-normal);
    position: relative;
    overflow: hidden;
}

.cancel-button {
    background: var(--background-secondary);
    border: none;
    color: var(--text-primary);
}

.cancel-button:hover {
    background: var(--background-tertiary);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.save-button {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    color: white;
    box-shadow: var(--shadow-lg);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.save-button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--primary-dark) 0%, #1E40AF 100%);
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    animation: none;
}

.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-sm);
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .write-article-content {
        padding: 40px;
    }

    .write-title {
        font-size: 2.5rem;
    }

    .form-row {
        flex-direction: column;
        gap: 32px;
    }

    .half-width {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .write-article-container {
        padding: 30px 20px;
    }

    .write-article-content {
        padding: 30px;
    }

    .write-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 1rem;
    }

    .title-icon {
        width: 50px;
        height: 50px;
        font-size: 2rem;
    }

    .write-subtitle {
        font-size: 1.1rem;
    }

    .editor-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .tool-tip {
        font-size: 0.8rem;
        padding: 6px 12px;
    }

    .quill-editor {
        min-height: 500px;
    }

    .action-section {
        flex-direction: column;
        gap: 16px;
    }

    .cancel-button,
    .save-button {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .write-article-container {
        padding: 25px 15px;
    }

    .write-article-content {
        padding: 20px;
    }

    .write-title {
        font-size: 1.8rem;
    }

    .title-icon {
        width: 45px;
        height: 45px;
        font-size: 1.75rem;
    }

    .write-subtitle {
        font-size: 1rem;
    }

    .quill-editor {
        min-height: 400px;
    }

    .editor-wrapper {
        min-height: 400px;
    }
}

/* 动画效果 */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes gradientShift {

    0%,
    100% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }
}

@keyframes pulse {

    0%,
    100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
    }

    70% {
        box-shadow: 0 0 0 20px rgba(99, 102, 241, 0);
    }
}

@keyframes tagSlideIn {
    from {
        opacity: 0;
        transform: translateX(-20px) scale(0.8);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/* 代码块高亮样式 */
.ql-editor pre.ql-code-block {
    background-color: #f6f8fa;
    border: 1px solid #e1e4e8;
    border-radius: 8px;
    padding: 1.25rem;
    margin: 1.5rem 0;
    overflow-x: auto;
    position: relative;
}

.ql-editor pre.ql-code-block::before {
    content: '代码';
    position: absolute;
    top: -0.5rem;
    left: 1rem;
    background: var(--primary-color);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}

.ql-editor pre.ql-code-block code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
}

/* 适配highlight.js的样式 */
.ql-editor pre code.hljs {
    display: block;
    overflow-x: auto;
    padding: 0;
    background: transparent;
    color: inherit;
}

.ql-editor pre .hljs {
    background: transparent;
}

/* 工具栏按钮提示 */
.ql-toolbar.ql-snow button {
    position: relative;
}

.ql-toolbar.ql-snow button::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--text-primary);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    z-index: 1000;
    margin-bottom: 8px;
}

.ql-toolbar.ql-snow button:hover::after {
    opacity: 1;
    visibility: visible;
}

/* 为工具栏按钮添加title属性 */
.ql-bold::before {
    content: '粗体';
}

.ql-italic::before {
    content: '斜体';
}

.ql-underline::before {
    content: '下划线';
}

.ql-strike::before {
    content: '删除线';
}

.ql-blockquote::before {
    content: '引用';
}

.ql-code-block::before {
    content: '代码块';
}

.ql-header::before {
    content: '标题';
}

.ql-list.ql-ordered::before {
    content: '有序列表';
}

.ql-list.ql-bullet::before {
    content: '无序列表';
}

.ql-script.ql-sub::before {
    content: '下标';
}

.ql-script.ql-super::before {
    content: '上标';
}

.ql-indent.ql-minus::before {
    content: '减少缩进';
}

.ql-indent.ql-plus::before {
    content: '增加缩进';
}

.ql-direction::before {
    content: '文本方向';
}

.ql-size::before {
    content: '字体大小';
}

.ql-color::before {
    content: '字体颜色';
}

.ql-background::before {
    content: '背景颜色';
}

.ql-font::before {
    content: '字体';
}

.ql-align::before {
    content: '对齐方式';
}

.ql-clean::before {
    content: '清空内容';
}

.ql-link::before {
    content: '插入链接';
}

.ql-image::before {
    content: '插入图片';
}

.ql-video::before {
    content: '插入视频';
}
</style>