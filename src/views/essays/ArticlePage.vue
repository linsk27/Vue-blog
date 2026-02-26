<template>
    <div class="article-page">
        <div class="article-container">
            <div class="article-header">
                <button class="back-btn" @click="$router.back()">← 返回列表</button>
                <div v-if="article">
                    <h1 class="article-title">{{ article.title }}</h1>
                    <div class="article-meta">
                        <span class="article-date" v-if="article.created_at">发布于 {{ formatDate(article.created_at)
                            }}</span>
                        <span class="article-author" v-if="article.author_name"> · 作者: {{ article.author_name }}</span>
                    </div>
                    <div class="article-tags">
                        <span class="article-tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
                    </div>
                    <p class="article-summary">{{ article.summary }}</p>
                </div>
            </div>
            <div class="article-content-card">
                <div v-if="loading" class="loading">加载中...</div>

                <!-- 交互式组件渲染 -->
                <div v-else-if="activeComponent" class="interactive-component">
                    <component :is="activeComponent" />
                </div>

                <!-- 富文本内容渲染 -->
                <div v-else-if="article" class="article-html-content ql-editor" v-html="article.content"></div>

                <div v-else class="not-found">文章不存在</div>
            </div>
        </div>

        <!-- AI 摘要悬浮按钮 -->
        <div class="ai-float-btn" @click="generateAiSummary" v-if="article && !loading" title="生成 AI 摘要">
            <span class="ai-icon">✨</span>
            <span class="ai-text">AI 摘要</span>
        </div>

        <!-- AI 摘要面板 -->
        <transition name="slide-fade">
            <div class="ai-summary-panel" v-if="showAiPanel" ref="aiPanelRef">
                <div class="panel-header">
                    <h3>✨ AI 智能摘要</h3>
                    <button class="close-btn" @click="showAiPanel = false">×</button>
                </div>
                <div class="panel-content">
                    <div v-if="isAiGenerating" class="ai-loading">
                        <div class="spinner"></div>
                        <p>AI 正在阅读并生成摘要...</p>
                    </div>
                    <div v-else class="ai-result">
                        <p>{{ aiSummary }}</p>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted, shallowRef, defineAsyncComponent, nextTick } from 'vue'
import articleApi from '@/api/modules/article'
import { aiSummaryService } from '@/api/modules/ai'
import { IArticle } from '@/api/modules/article/interface'
import { useElMessage } from '@/hooks/useMessage'
import 'quill/dist/quill.snow.css' // 引入 Quill 样式以正确渲染 HTML 内容
import { articles as localArticles } from './articles/index'

const route = useRoute()
const { message } = useElMessage()
const article = ref<IArticle | null>(null)
const loading = ref(false)
const activeComponent = shallowRef<any>(null)

// AI 摘要相关状态
const showAiPanel = ref(false)
const aiSummary = ref('')
const isAiGenerating = ref(false)
const aiPanelRef = ref<HTMLElement | null>(null)

const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString()
}

// 提取纯文本内容
const extractTextContent = (html: string) => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    return tempDiv.textContent || tempDiv.innerText || ''
}

// 生成 AI 摘要
const generateAiSummary = async () => {
    if (!article.value) return

    // 如果已经有摘要了，直接显示面板
    if (aiSummary.value) {
        showAiPanel.value = true
        return
    }

    showAiPanel.value = true
    isAiGenerating.value = true

    try {
        // 获取文章内容（优先使用 content，如果是交互式组件则尝试获取描述）
        let contentToSummarize = ''
        if (article.value.content) {
            contentToSummarize = extractTextContent(article.value.content)
        } else {
            contentToSummarize = article.value.summary || article.value.title
        }

        if (!contentToSummarize || contentToSummarize.length < 50) {
            aiSummary.value = '文章内容过短，无法生成摘要。'
            return
        }

        const res = await aiSummaryService.generateSummary({
            content: contentToSummarize,
            length: 200, // 侧边栏展示，200字左右比较合适
        }) as any

        const summaryText = res?.reply || res?.data?.reply || res?.summary || res?.data?.summary

        if (summaryText) {
            aiSummary.value = summaryText
        } else {
            throw new Error('未获取到有效摘要')
        }
    } catch (error) {
        console.error('AI summary generation failed:', error)
        message.error('摘要生成失败，请稍后重试')
        showAiPanel.value = false
    } finally {
        isAiGenerating.value = false
    }
}

onMounted(async () => {
    const id = route.params.id as string
    if (id) {
        loading.value = true

        // 1. 优先检查是否为本地交互式文章
        const localArticle = localArticles.find(a => a.id === id)
        if (localArticle) {
            // @ts-ignore
            article.value = {
                ...localArticle,
                tags: [...(localArticle.tags || []), '可交互文章'],
                created_at: new Date().toISOString(),
                author_name: '系统预置',
                content: '' // 本地文章不使用content字段
            }

            // 加载对应组件
            if (localArticle.component) {
                try {
                    // component 是一个返回 Promise 的函数
                    const compModule = await localArticle.component()
                    activeComponent.value = compModule.default || compModule
                } catch (err) {
                    console.error('Failed to load component:', err)
                    message.error('组件加载失败')
                }
            }
            loading.value = false
            return
        }

        // 2. 如果不是本地文章，请求后端
        try {
            const res = await articleApi.getDetail(id)
            // @ts-ignore
            article.value = res.data || res
        } catch (error) {
            console.error('Failed to load article:', error)
            message.error('加载文章失败')
        } finally {
            loading.value = false
        }
    }
})
</script>

<style scoped>
.article-page {
    width: 100%;
    min-height: calc(100vh - 140px);
    padding: 40px 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 248, 245, 0.85) 100%);
    box-sizing: border-box;
}

.article-container {
    max-width: 900px;
    margin: 0 auto;
}

.article-header {
    margin-bottom: 32px;
    border-bottom: 1.5px solid rgba(255, 127, 80, 0.15);
    padding-bottom: 18px;
}

.back-btn {
    background: #fff5f0;
    color: #ff7f50;
    border: none;
    border-radius: 5px;
    padding: 6px 18px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    margin-bottom: 18px;
    transition: background 0.2s, color 0.2s;
}

.back-btn:hover {
    background: #ff7f50;
    color: #fff;
}

.article-title {
    font-size: 2rem;
    font-weight: 700;
    color: #ff7f50;
    margin-bottom: 10px;
}

.article-meta {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 12px;
}

.article-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.article-tag {
    background: #fff5f0;
    color: #ff7f50;
    border-radius: 4px;
    padding: 2px 10px;
    font-size: 13px;
    font-weight: 500;
}

.article-summary {
    color: #444;
    font-size: 1.1rem;
    margin-bottom: 0;
    line-height: 1.7;
    background-color: #f8f9fa;
    padding: 12px;
    border-radius: 6px;
    border-left: 4px solid #ff7f50;
}

.article-content-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(255, 127, 80, 0.08);
    border: 1.5px solid rgba(255, 127, 80, 0.1);
    padding: 30px;
    min-height: 300px;
    margin-top: 18px;
}

.not-found {
    color: #d32f2f;
    font-size: 1.2rem;
    text-align: center;
    padding: 40px 0;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #666;
}

/* 复用 Quill 编辑器的样式来渲染内容 */
.article-html-content {
    line-height: 1.8;
    color: #333;
}

.article-html-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 10px 0;
}

.article-html-content :deep(pre) {
    background-color: #f6f8fa;
    padding: 16px;
    border-radius: 6px;
    overflow-x: auto;
}

@media (max-width: 700px) {
    .article-content-card {
        padding: 16px 12px;
    }

    .article-title {
        font-size: 1.3rem;
    }

    .ai-float-btn {
        bottom: 20px;
        right: 20px;
        top: auto;
    }

    .ai-summary-panel {
        width: 90%;
        right: 5%;
        top: 20%;
    }
}

/* AI 功能样式 */
.ai-float-btn {
    position: fixed;
    right: 40px;
    top: 150px;
    /* 位于文章内容右侧上方 */
    background: white;
    padding: 12px 20px;
    border-radius: 50px;
    box-shadow: 0 4px 15px rgba(255, 127, 80, 0.25);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    border: 1px solid rgba(255, 127, 80, 0.1);
    z-index: 100;
}

.ai-float-btn:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 127, 80, 0.35);
    background: linear-gradient(135deg, #fff 0%, #fff5f0 100%);
}

.ai-icon {
    font-size: 1.2rem;
}

.ai-text {
    font-weight: 600;
    color: #ff7f50;
    font-size: 0.95rem;
}

/* 摘要面板 */
.ai-summary-panel {
    position: fixed;
    right: 40px;
    top: 220px;
    /* 按钮下方 */
    width: 320px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    z-index: 99;
    border: 1px solid rgba(255, 127, 80, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.panel-header {
    padding: 15px 20px;
    background: linear-gradient(135deg, #fff5f0 0%, #fff 100%);
    border-bottom: 1px solid rgba(255, 127, 80, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.panel-header h3 {
    margin: 0;
    font-size: 1rem;
    color: #ff7f50;
    font-weight: 700;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #999;
    cursor: pointer;
    line-height: 1;
    padding: 0 5px;
}

.close-btn:hover {
    color: #666;
}

.panel-content {
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.ai-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    color: #666;
    gap: 15px;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #ffece5;
    border-top: 3px solid #ff7f50;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.ai-result {
    line-height: 1.6;
    color: #333;
    font-size: 0.95rem;
    text-align: justify;
}

/* 动画效果 */
.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}
</style>