<template>
    <div class="essays-container">
        <!-- 页面头部和操作按钮 -->
        <div class="header-section">
            <div class="essays-header">
                <h1 class="essays-title">
                    <span class="title-icon">📚</span>
                    知识创作库
                </h1>
                <p class="essays-subtitle">探索精选技术文章和深度解析</p>
            </div>

            <div class="action-bar">
                <div class="layout-switch">
                    <button class="layout-btn" :class="{ active: layoutMode === 'grid' }" @click="layoutMode = 'grid'"
                        title="网格视图">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </button>
                    <button class="layout-btn" :class="{ active: layoutMode === 'list' }" @click="layoutMode = 'list'"
                        title="列表视图">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <el-button type="primary" @click="goToWrite" class="write-btn">
                    <el-icon>
                        <Plus />
                    </el-icon> 写文章
                </el-button>
            </div>
        </div>

        <div class="search-section">
            <div class="search-wrapper">
                <span class="search-icon">🔍</span>
                <div class="input-container">
                    <input v-model="search" class="essay-search" type="text" placeholder="搜索标题、标签或简介..." />
                </div>
            </div>
            <div class="search-stats" v-if="search">
                <span>找到 {{ filteredArticles.length }} 篇相关文章</span>
            </div>
        </div>

        <!-- 标签筛选 -->
        <div class="tags-section" v-if="allTags.length > 0">
            <div class="tags-header">
                <h3 class="tags-title">热门标签</h3>
                <el-button type="text" @click="clearSelectedTags" v-if="selectedTags.length > 0">
                    清除筛选
                </el-button>
            </div>
            <div class="tags-list">
                <el-tag v-for="tag in allTags" :key="tag" :type="selectedTags.includes(tag) ? 'primary' : 'info'"
                    :effect="selectedTags.includes(tag) ? 'dark' : 'plain'" @click="toggleTag(tag)" class="filter-tag">
                    {{ tag }}
                </el-tag>
            </div>
        </div>

        <!-- 网格视图 -->
        <div class="essays-grid" v-if="layoutMode === 'grid'">
            <div class="essay-card" v-for="(article, index) in filteredArticles" :key="article.id"
                @click="goToArticle(article.id)" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="card-header">
                    <div class="card-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="40" height="40" rx="8" fill="rgba(255, 127, 80, 0.1)" />
                            <path d="M12 16 L28 16" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                            <path d="M12 22 L24 22" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                            <path d="M12 28 L20 28" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                        </svg>
                    </div>
                </div>

                <div class="card-content">
                    <h3 class="card-title">{{ article.title }}</h3>
                    <p class="card-summary">{{ article.summary }}</p>
                </div>

                <div class="card-footer">
                    <div class="card-tags">
                        <span class="card-tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
                    </div>
                    <div class="card-meta">
                        <span class="meta-item">{{ formatDate(article.created_at) }}</span>
                        <span class="meta-item" v-if="article.author_name">· {{ article.author_name }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 列表视图 -->
        <div class="essays-list" v-else>
            <div class="list-item" v-for="(article, index) in filteredArticles" :key="article.id"
                @click="goToArticle(article.id)" :style="{ animationDelay: `${index * 0.1}s` }">
                <div class="list-content">
                    <div class="list-header">
                        <h3 class="list-title">{{ article.title }}</h3>
                        <div class="list-tags">
                            <span class="list-tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
                        </div>
                    </div>
                    <p class="list-summary">{{ article.summary }}</p>
                    <div class="list-meta">
                        <span class="meta-author" v-if="article.author_name">
                            <i class="icon-user">👤</i> {{ article.author_name }}
                        </span>
                        <span class="meta-date">
                            <i class="icon-date">📅</i> {{ formatDate(article.created_at) }}
                        </span>
                        <span class="read-more">阅读全文 →</span>
                    </div>
                </div>
                <div class="list-image" v-if="article.cover_image">
                    <img :src="article.cover_image" alt="cover" />
                </div>
                <div class="list-icon" v-else>
                    <svg width="60" height="60" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="40" height="40" rx="8" fill="rgba(255, 127, 80, 0.05)" />
                        <path d="M12 16 L28 16" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                        <path d="M12 22 L24 22" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                        <path d="M12 28 L20 28" stroke="#FF7F50" stroke-width="2" stroke-linecap="round" />
                    </svg>
                </div>
            </div>
        </div>

        <!-- 无搜索结果提示 -->
        <div class="no-results" v-if="filteredArticles.length === 0">
            <div class="no-results-icon">🔍</div>
            <h3 class="no-results-title">未找到相关文章</h3>
            <p class="no-results-text">尝试使用其他关键词搜索</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'
import articleApi from '@/api/modules/article'
import { IArticle } from '@/api/modules/article/interface'
import { useElMessage } from '@/hooks/useMessage'
import { articles as localArticles } from './articles/index'

const router = useRouter()
const { message } = useElMessage()

// 搜索功能
const search = ref('')
const selectedTags = ref<string[]>([])
const articles = ref<IArticle[]>([])
const loading = ref(false)
const layoutMode = ref('list') // 默认使用列表模式，更像官方博客

// 格式化日期
const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 计算所有标签
const allTags = computed(() => {
    const tagsSet = new Set<string>()
    articles.value.forEach(article => {
        article.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet)
})

// 处理本地文章，添加“可交互文章”标签和伪造的时间字段
const processedLocalArticles = localArticles.map(article => ({
    ...article,
    id: article.id, // 保持字符串ID
    tags: [...(article.tags || []), '可交互文章'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author_name: '系统预置',
    content: '' // 列表页不需要详细内容
}))

// 获取文章列表
const fetchArticles = async () => {
    loading.value = true
    try {
        const params: any = {}
        if (search.value) params.search = search.value

        // 获取后端文章
        const res = await articleApi.getList(params)
        const backendArticles = Array.isArray(res) ? res : (res as any).data || []

        // 简单的本地搜索逻辑（因为后端不会返回本地文章）
        let filteredLocal = processedLocalArticles
        if (search.value) {
            const lowerSearch = search.value.toLowerCase()
            filteredLocal = processedLocalArticles.filter(a =>
                a.title.toLowerCase().includes(lowerSearch) ||
                a.summary.toLowerCase().includes(lowerSearch) ||
                a.tags.some(t => t.toLowerCase().includes(lowerSearch))
            )
        }

        // 合并文章：本地文章在前
        // @ts-ignore
        articles.value = [...filteredLocal, ...backendArticles]

    } catch (error) {
        console.error('Failed to fetch articles:', error)
        message.error('获取文章列表失败')
        // 即使后端失败，也显示本地文章
        // @ts-ignore
        articles.value = processedLocalArticles
    } finally {
        loading.value = false
    }
}

// 监听搜索词变化，防抖处理
let searchTimer: any = null
watch(search, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        fetchArticles()
    }, 500)
})

// 初始化加载
onMounted(() => {
    fetchArticles()
})

// 过滤文章：只显示已发布的（status === 'published'）
// 但如果有本地文章，我们假设本地文章都是已发布的
const filteredArticles = computed(() => {
    return articles.value.filter(article => {
        // 状态条件：只显示已发布的
        // 注意：本地文章没有status字段，或者我们默认它们是published
        // 后端文章有status字段
        const isPublished = !article.status || article.status === 'published'

        // 标签条件
        const matchesTags = selectedTags.value.length === 0 ||
            (article.tags && selectedTags.value.every(tag => article.tags?.includes(tag)))

        return isPublished && matchesTags
    })
})

// 跳转到文章详情页
function goToArticle(id: string | number) {
    router.push(`/essays/${id}`)
}

// 跳转到写文章页面
function goToWrite() {
    router.push('/essays/write')
}

// 切换标签选择
function toggleTag(tag: string) {
    const index = selectedTags.value.indexOf(tag)
    if (index > -1) {
        selectedTags.value.splice(index, 1)
    } else {
        selectedTags.value.push(tag)
    }
}

// 清除标签筛选
function clearSelectedTags() {
    selectedTags.value = []
}
</script>

<style scoped>
/* 全局变量定义 */
.essays-container {
    --primary-color: #FF7F50;
    --primary-dark: #FF6347;
    --primary-light: rgba(255, 127, 80, 0.1);
    --primary-lighter: rgba(255, 127, 80, 0.05);
    --text-primary: #333;
    --text-secondary: #666;
    --text-muted: #999;
    --background-primary: rgba(255, 255, 255, 0.85);
    --background-gradient: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 248, 245, 0.85) 100%);
    --border-radius: 16px;
    --shadow-sm: 0 4px 20px rgba(255, 127, 80, 0.1);
    --shadow-md: 0 8px 30px rgba(255, 127, 80, 0.15);
    --shadow-lg: 0 12px 40px rgba(255, 127, 80, 0.2);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 40px 20px;
    background: var(--background-gradient);
    min-height: calc(100vh - 140px);
    box-sizing: border-box;
    font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 页面头部区域 */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 40px;
    flex-wrap: wrap;
    gap: 20px;
    animation: fadeInDown 0.8s ease-out;
}

.essays-header {
    flex: 1;
    min-width: 300px;
}

.essays-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 1rem;
    letter-spacing: -0.5px;
}

.title-icon {
    font-size: 2rem;
}

.essays-subtitle {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
    font-weight: 400;
    line-height: 1.6;
}

/* 搜索区域 */
.search-section {
    margin-bottom: 40px;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

.search-wrapper {
    position: relative;
    max-width: 800px;
    margin: 0 auto 10px;
}

.search-icon {
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 1.2rem;
    z-index: 2;
}

.input-container {
    position: relative;
    background: var(--primary-lighter);
    border-radius: 24px;
    transition: var(--transition);
    padding: 3px;
}

.input-container:focus-within {
    background: var(--primary-light);
    box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.15), 0 8px 25px rgba(255, 127, 80, 0.2);
    transform: translateY(-2px);
}

.essay-search {
    width: 100%;
    padding: 1.2rem 1.5rem 1.2rem 3.75rem;
    border: 2px solid rgba(255, 127, 80, 0.1);
    border-radius: 22px;
    font-size: 1.125rem;
    color: var(--text-primary);
    background: var(--background-primary);
    outline: none;
    transition: var(--transition);
    box-sizing: border-box;
    font-weight: 500;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    &::placeholder {
        color: var(--text-muted);
        font-weight: 400;
    }

    &:focus {
        border-color: var(--primary-color);
        outline: none;
        box-shadow: none;
    }

    &:active {
        border-color: var(--primary-color);
    }
}

.search-stats {
    text-align: center;
    font-size: 0.95rem;
    color: var(--text-secondary);
    margin-top: 0.75rem;
    font-weight: 500;
}

/* 操作栏 */
.action-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.write-btn {
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    border: none;
    font-weight: 600;
    padding: 0.875rem 2rem;
    font-size: 1.05rem;
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    transition: var(--transition);
    color: white;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.write-btn:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    background: linear-gradient(135deg, var(--primary-dark) 0%, #FF4500 100%);
}

/* 布局切换按钮 */
.layout-switch {
    display: flex;
    background: var(--primary-lighter);
    padding: 4px;
    border-radius: 12px;
    margin-right: 15px;
    gap: 4px;
}

.layout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.layout-btn:hover {
    color: var(--primary-color);
    background: rgba(255, 255, 255, 0.5);
}

.layout-btn.active {
    background: white;
    color: var(--primary-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 列表视图样式 */
.essays-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-top: 2rem;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
}

.list-item {
    display: flex;
    background: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    gap: 2rem;
    border: 1px solid rgba(255, 127, 80, 0.08);
    transition: var(--transition);
    cursor: pointer;
    animation: fadeInUp 0.5s ease-out both;
    position: relative;
    overflow: hidden;
}

.list-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.list-item:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-md);
    border-color: rgba(255, 127, 80, 0.2);
}

.list-item:hover::before {
    opacity: 1;
}

.list-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* 确保内容不溢出 */
    min-width: 0;
}

.list-header {
    margin-bottom: 1rem;
}

.list-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 0.8rem 0;
    line-height: 1.3;
    transition: color 0.3s ease;
}

.list-item:hover .list-title {
    color: var(--primary-color);
}

.list-tags {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
}

.list-tag {
    font-size: 0.85rem;
    color: var(--primary-color);
    background: var(--primary-lighter);
    padding: 2px 10px;
    border-radius: 6px;
}

.list-summary {
    color: var(--text-secondary);
    font-size: 1.05rem;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.list-meta {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    color: var(--text-muted);
    font-size: 0.9rem;
    margin-top: auto;
}

.meta-author,
.meta-date {
    display: flex;
    align-items: center;
    gap: 6px;
}

.read-more {
    margin-left: auto;
    color: var(--primary-color);
    font-weight: 600;
    opacity: 0;
    transform: translateX(-10px);
    transition: all 0.3s ease;
}

.list-item:hover .read-more {
    opacity: 1;
    transform: translateX(0);
}

/* 列表右侧封面图 */
.list-image {
    width: 240px;
    height: 160px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    /* 增加一个默认背景，防止图片加载失败时太难看 */
    background: var(--primary-lighter);
}

.list-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.list-item:hover .list-image img {
    transform: scale(1.05);
}

/* 列表右侧默认图标占位 */
.list-icon {
    width: 160px;
    /* 调整为更窄一点，或者保持 240px */
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--background-gradient);
    border-radius: 12px;
}

/* Card Meta Update */
.card-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: var(--text-muted);
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 1rem;
    margin-top: auto;
}

/* 标签筛选 */
.tags-section {
    margin-bottom: 30px;
    animation: fadeInUp 0.8s ease-out 0.6s both;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
}

.tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
    padding: 0 10px;
}

.tags-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    max-width: 100%;
}

.filter-tag {
    cursor: pointer;
    transition: var(--transition);
    padding: 8px 18px;
    border-radius: 20px;
    font-size: 0.95rem;
    font-weight: 500;
    border: 2px solid rgba(255, 127, 80, 0.15);
    color: var(--text-secondary);
    background: var(--background-primary);
}

.filter-tag:hover {
    background: var(--primary-light);
    color: var(--primary-color);
    border-color: var(--primary-color);
}

/* Element Plus tag组件的选中状态样式 */
.el-tag--primary.el-tag--dark {
    background: var(--primary-light);
    color: var(--primary-color);
    border-color: var(--primary-color);
}

.el-tag--info.el-tag--plain {
    background: var(--background-primary);
    color: var(--text-secondary);
    border-color: rgba(255, 127, 80, 0.15);
}

.filter-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 127, 80, 0.25);
}

/* 文章卡片网格 */
.essays-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2.5rem;
    margin-top: 3rem;
    width: 100%;
    max-width: 1400px;
    margin-left: auto;
    margin-right: auto;
}

/* 响应式网格布局 */
@media (min-width: 1200px) {
    .essays-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (min-width: 900px) and (max-width: 1199px) {
    .essays-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 600px) and (max-width: 899px) {
    .essays-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 599px) {
    .essays-grid {
        grid-template-columns: 1fr;
    }
}

.essay-card {
    background: var(--background-primary);
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: var(--transition);
    position: relative;
    overflow: hidden;
    animation: cardSlideUp 0.6s ease-out both;
    border: 1px solid rgba(255, 127, 80, 0.08);

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary-color) 0%, var(--primary-dark) 100%);
        transform: scaleX(0);
        transition: transform 0.4s ease;
    }

    &:hover {
        transform: translateY(-10px);
        box-shadow: var(--shadow-lg);
        border-color: rgba(255, 127, 80, 0.15);

        &::before {
            transform: scaleX(1);
        }
    }
}

.card-header {
    margin-bottom: 1.5rem;
}

.card-icon {
    width: 70px;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    background: var(--primary-lighter);
    border-radius: 12px;
}

.card-content {
    margin-bottom: 2rem;
}

.card-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 1rem;
    line-height: 1.4;
    letter-spacing: -0.3px;
}

.card-summary {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.7;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.card-footer {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.card-tags {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.card-tag {
    background: var(--primary-light);
    color: var(--primary-color);
    border-radius: 14px;
    padding: 0.375rem 1rem;
    font-size: 0.9rem;
    font-weight: 500;
    transition: var(--transition);

    &:hover {
        background: rgba(255, 127, 80, 0.25);
        transform: translateY(-2px);
    }
}

.card-action {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--primary-color);
    font-weight: 600;
    font-size: 1rem;
    transition: var(--transition);

    .essay-card:hover & {
        transform: translateX(8px);
    }
}

.action-icon {
    font-size: 1.2rem;
}

/* 无搜索结果 */
.no-results {
    grid-column: 1 / -1;
    text-align: center;
    padding: 5rem 2rem;
    background: var(--background-primary);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(255, 127, 80, 0.08);
}

.no-results-icon {
    font-size: 5rem;
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    opacity: 0.8;
}

.no-results-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 0.75rem;
    letter-spacing: -0.3px;
}

.no-results-text {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
}

/* 动画效果 */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-40px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(40px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes cardSlideUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 响应式设计 */
@media (min-width: 1200px) {
    .essays-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

@media (min-width: 900px) and (max-width: 1199px) {
    .essays-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 600px) and (max-width: 899px) {
    .essays-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }
}

@media (max-width: 599px) {
    .essays-container {
        padding: 30px 20px;
    }

    .essays-title {
        font-size: 2.2rem;
        gap: 0.75rem;
    }

    .title-icon {
        font-size: 1.8rem;
    }

    .essays-subtitle {
        font-size: 1rem;
    }

    .essays-grid {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .essay-card {
        padding: 1.5rem;
    }

    .card-title {
        font-size: 1.25rem;
    }
}

@media (max-width: 480px) {
    .essays-title {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.75rem;
    }

    .essay-search {
        padding: 1rem 1.25rem 1rem 3.5rem;
        font-size: 1rem;
        border-radius: 20px;
    }

    .search-icon {
        left: 1.25rem;
        font-size: 1.1rem;
    }
}
</style>