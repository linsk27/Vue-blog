<template>
    <div class="ai-chat-container">
        <!-- 页面头部 -->
        <header class="chat-header">
            <div class="header-left">
                <div class="header-icon">
                    <div class="ai-avatar">🤖</div>
                </div>
                <div class="header-info">
                    <div class="brand-row">
                        <span class="brand-badge">AI增强型博客分享平台</span>
                        <span class="status-pill"><span class="status-dot"></span>可信AI在线</span>
                    </div>
                    <h1 class="chat-title">官方AI对话中心</h1>
                    <p class="chat-subtitle">知识库融合 · 智能写作 · 分享协作</p>
                </div>
            </div>
            <div class="header-right">
                <button class="control-btn" @click="resetContext" title="重置上下文">
                    <span class="btn-icon">🔄</span>
                    <span>重置上下文</span>
                </button>
                <button class="control-btn" @click="clearChat" title="清空对话">
                    <span class="btn-icon">🗑️</span>
                    <span>清空</span>
                </button>
            </div>
        </header>

        <!-- 聊天消息区域 -->
        <main class="chat-messages" ref="messagesRef">
            <!-- 欢迎消息 -->
            <div v-if="messages.length === 0" class="welcome-message">
                <div class="welcome-icon">
                    <div class="welcome-ai-avatar">🤖</div>
                </div>
                <h3 class="welcome-title">AI增强型博客分享平台 · 官方AI对话</h3>
                <p class="welcome-text">聚合知识库与创作场景，支持智能问答、摘要生成与内容共创。</p>
                <div class="welcome-badges">
                    <span class="feature-badge">知识库联动</span>
                    <span class="feature-badge">智能摘要</span>
                    <span class="feature-badge">创作辅助</span>
                </div>
                <div class="welcome-suggestions">
                    <button class="suggestion-btn" @click="sendSuggestion('帮我生成一段博客文章的开头')">
                        <span class="suggestion-icon">✍️</span>
                        帮我生成一段博客文章的开头
                    </button>
                    <button class="suggestion-btn" @click="sendSuggestion('平台的AI智能摘要如何使用？')">
                        <span class="suggestion-icon">🧠</span>
                        平台的AI智能摘要如何使用？
                    </button>
                    <button class="suggestion-btn" @click="sendSuggestion('如何设计多维标签与分类体系？')">
                        <span class="suggestion-icon">🏷️</span>
                        如何设计多维标签与分类体系？
                    </button>
                </div>
            </div>

            <!-- 聊天消息列表 -->
            <div v-for="(message, index) in messages" :key="index" class="chat-message" :class="message.role">
                <div class="message-avatar">
                    <div v-if="message.role === 'user'" class="user-avatar">👤</div>
                    <div v-else class="ai-avatar">🤖</div>
                </div>
                <div class="message-content">
                    <div class="message-meta">
                        <span class="role-tag" :class="message.role">{{ message.role === 'user' ? '作者' : '官方AI' }}</span>
                        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                    </div>
                    <div class="message-bubble" :class="message.role">
                        <div v-if="message.role === 'user'" class="message-text user-text">
                            {{ message.content }}
                        </div>
                        <div v-else class="message-text ai-text markdown-content"
                            v-html="renderMarkdown(message.content)"></div>
                        <button class="copy-btn" @click="copyMessage(message.content)" title="复制文本">
                            <span class="copy-icon">📋</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-if="isLoading" class="chat-message ai">
                <div class="message-avatar">
                    <div class="ai-avatar">🤖</div>
                </div>
                <div class="message-content">
                    <div class="message-bubble ai">
                        <div class="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <!-- 输入区域 -->
        <footer class="chat-input-area">
            <div class="input-wrapper">
                <textarea v-model="inputMessage" placeholder="输入您的问题或创作需求..." rows="2" @keydown.enter.prevent="sendMessage"
                    @keydown.enter.shift.exact="inputMessage += '\n'" :disabled="isLoading"
                    class="message-input"></textarea>
                <div class="input-actions">
                    <button class="action-btn" @click="inputMessage = ''" v-if="inputMessage.trim()" title="清空输入">
                        ✕
                    </button>
                </div>
            </div>
            <button class="send-btn" @click="sendMessage" :disabled="!inputMessage.trim() || isLoading">
                <span v-if="isLoading" class="loading-spinner"></span>
                <span v-else class="send-icon">➤</span>
            </button>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useElMessage } from '@/hooks/useMessage'
import { aiChatService } from '@/api/modules/ai'
import { marked } from 'marked'

const { message } = useElMessage()

// 渲染Markdown内容
function renderMarkdown(content: string): string {
    // 配置marked以正确处理代码块
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    // 自定义代码块渲染
    const renderer = new marked.Renderer();
    renderer.code = function ({ text, lang, escaped }: { text: string; lang?: string; escaped?: boolean }) {
        return `<pre style="background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 1rem 0;"><code style="font-family: 'Courier New', Courier, monospace; font-size: 0.9rem; color: #333;">${text}</code></pre>`;
    };

    // 使用自定义渲染器解析Markdown
    return marked.parse(content, { renderer }) as string
}



// 聊天消息状态
interface Message {
    role: 'user' | 'ai'
    content: string
    timestamp: Date
}

// 从localStorage加载对话历史
const loadMessagesFromStorage = (): Message[] => {
    try {
        const storedMessages = localStorage.getItem('aiChatMessages')
        if (storedMessages) {
            const parsedMessages = JSON.parse(storedMessages)
            return parsedMessages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
        }
    } catch (error) {
        console.error('加载对话历史失败:', error)
    }
    return []
}

// 保存对话历史到localStorage
const saveMessagesToStorage = (messages: Message[]) => {
    try {
        localStorage.setItem('aiChatMessages', JSON.stringify(messages))
    } catch (error) {
        console.error('保存对话历史失败:', error)
    }
}

const messages = ref<Message[]>(loadMessagesFromStorage())
const inputMessage = ref('')
const isLoading = ref(false)
const messagesRef = ref<HTMLElement | null>(null)

// 获取聊天历史记录
async function fetchChatHistory() {
    // 从localStorage加载对话历史
    messages.value = loadMessagesFromStorage()
}

// 发送消息
async function sendMessage() {
    const content = inputMessage.value.trim()
    if (!content || isLoading.value) return

    // 添加用户消息
    messages.value.push({
        role: 'user',
        content,
        timestamp: new Date()
    })
    // 保存对话历史到localStorage
    saveMessagesToStorage(messages.value)
    inputMessage.value = ''

    // 滚动到底部
    await nextTick(() => {
        scrollToBottom()
    })

    // 显示加载状态
    isLoading.value = true

    try {
        // 获取用户ID（实际项目中应从用户状态获取）
        const userId = '123'

        // 调用真实的AI聊天API
        const response = await aiChatService.sendMessage({
            message: content,
            user_id: userId
        })

        // 添加AI回复
        messages.value.push({
            role: 'ai',
            content: response.reply || response.data?.reply || 'AI回复失败',
            timestamp: new Date()
        })
        // 保存对话历史到localStorage
        saveMessagesToStorage(messages.value)
    } catch (error: any) {
        console.error('AI聊天API调用失败:', error)

        // 处理具体的错误类型
        let errorMessage = 'AI服务暂时不可用，显示模拟回复'
        if (error.response) {
            // 服务器返回错误
            const errorData = error.response.data
            if (errorData && errorData.msg) {
                errorMessage = errorData.msg
            }

            // 处理特定的错误状态码
            switch (error.response.status) {
                case 429:
                    errorMessage = '请求频率过高，请稍后再试'
                    break
                case 504:
                    errorMessage = '请求超时，请稍后再试'
                    break
                case 401:
                    errorMessage = 'API密钥无效'
                    break
                case 400:
                    errorMessage = '请求格式错误'
                    break
            }
        }

        // 使用模拟响应作为fallback
        const aiResponse = await generateResponse(content)
        messages.value.push({
            role: 'ai',
            content: aiResponse,
            timestamp: new Date()
        })
        // 保存对话历史到localStorage
        saveMessagesToStorage(messages.value)
        message.warning(errorMessage)
    } finally {
        isLoading.value = false
        // 滚动到底部
        await nextTick(() => {
            scrollToBottom()
        })
    }
}

// 重置上下文
async function resetContext() {
    try {
        // 获取用户ID（实际项目中应从用户状态获取）
        const userId = '123'

        // 调用AI聊天API重置上下文
        await aiChatService.sendMessage({
            user_id: userId,
            reset_context: true
        })

        // 清空本地对话历史
        messages.value = []
        // 清空localStorage中的对话历史
        saveMessagesToStorage(messages.value)

        message.success('上下文已重置')
    } catch (error: any) {
        console.error('重置上下文失败:', error)
        message.error('重置上下文失败，请稍后重试')
    }
}

// 组件加载时获取聊天历史
onMounted(() => {
    fetchChatHistory()
})

// 生成模拟AI响应
function generateResponse(content: string): Promise<string> {
    // 模拟不同类型问题的回复
    const responses: Record<string, string> = {
        '帮我生成一段博客文章的开头': '好的，这里是一段适合知识分享类文章的开头：\n“在内容创作逐渐走向系统化的今天，个人经验不再只是零散的记录，而是可以被沉淀为可复用的知识资产。本篇文章将从实际场景出发，梳理构建高质量分享内容的关键步骤与方法。”\n如果告诉我文章主题，我可以继续优化语气与风格。',
        '平台的AI智能摘要如何使用？': '使用AI智能摘要功能的流程如下：\n1. 进入AI中心的摘要模块\n2. 选择或粘贴需要摘要的内容\n3. 点击“生成摘要”并等待完成\n4. 支持手动编辑与重新生成\n5. 一键保存到知识库并用于分享',
        '如何设计多维标签与分类体系？': '建议从“主题、场景、对象、阶段”四个维度构建标签体系：\n1. 主题：前端、后端、AI、产品等\n2. 场景：教程、实践、复盘、方案\n3. 对象：新手、进阶、团队\n4. 阶段：规划、实施、优化\n同时设置主分类作为导航层级，标签用于跨域关联。',
        '如何优化Vue3应用性能？': 'Vue3应用性能优化可以从以下几个方面入手：\n1. 使用Teleport优化DOM结构\n2. 合理使用KeepAlive缓存组件\n3. 使用虚拟列表处理大数据渲染\n4. 优化图片加载策略\n5. 合理使用计算属性和监听器\n6. 避免不必要的响应式数据',
        '介绍一下智能知识库平台的功能？': '智能知识库平台是一个集成了AI技术的现代化知识管理系统，主要功能包括：\n1. 富文本编辑与知识发布\n2. 多维分类与标签系统\n3. 智能AI助手（选中文本右键呼出）\n4. 全局AI聊天功能\n5. AI辅助摘要生成\n6. 数据可视化看板\n7. 基于角色的权限管理',
        '如何使用AI智能摘要功能？': '使用AI智能摘要功能非常简单：\n1. 进入智能AI中心的摘要页面\n2. 粘贴或上传您需要生成摘要的文章\n3. 点击"生成摘要"按钮\n4. 等待AI处理完成，即可获取结构清晰的摘要\n5. 您可以根据需要调整摘要内容或重新生成'
    }

    // 返回匹配的回复或默认回复
    return Promise.resolve(responses[content] || `这是AI对"${content}"的回复。在实际项目中，这里会调用真实的LLM API来获取智能回答。`)
}

// 发送建议问题
function sendSuggestion(suggestion: string) {
    inputMessage.value = suggestion
    sendMessage()
}

// 清空对话
function clearChat() {
    if (messages.value.length > 0) {
        messages.value = []
        // 清空localStorage中的对话历史
        try {
            localStorage.removeItem('aiChatMessages')
        } catch (error) {
            console.error('清空对话历史失败:', error)
        }
        message.success('对话已清空')
    }
}

// 滚动到底部
function scrollToBottom() {
    messagesRef.value?.scrollTo({
        top: messagesRef.value.scrollHeight,
        behavior: 'smooth'
    })
}

// 格式化时间
function formatTime(date: Date): string {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

// 复制消息文本
function copyMessage(content: string) {
    navigator.clipboard.writeText(content).then(() => {
        message.success('文本已复制到剪贴板')
    }).catch(err => {
        console.error('复制失败:', err)
        message.error('复制失败，请手动复制')
    })
}
</script>

<style scoped>
/* 全局变量定义 */
:root {
    --primary-color: #ff5252;
    --primary-dark: #d32f2f;
    --primary-light: rgba(255, 82, 82, 0.1);
    --primary-lighter: rgba(255, 82, 82, 0.05);
    --text-primary: #212121;
    --text-secondary: #424242;
    --text-muted: #757575;
    --background-primary: #fff;
    --background-gradient: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    --border-radius: 16px;
    --shadow-sm: 0 4px 20px rgba(255, 82, 82, 0.08);
    --shadow-md: 0 8px 30px rgba(255, 82, 82, 0.12);
    --shadow-lg: 0 12px 40px rgba(255, 82, 82, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --status-green: #2e7d32;
    --status-green-bg: rgba(46, 125, 50, 0.12);
    --grid-line: rgba(255, 82, 82, 0.05);
}

.ai-chat-container {
    font-family: 'Source Han Sans SC', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background-color: #ffffff;
    background-image: var(--background-gradient), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px), linear-gradient(var(--grid-line) 1px, transparent 1px);
    background-size: cover, 32px 32px, 32px 32px;
    background-position: center, 0 0, 0 0;
    background-repeat: no-repeat, repeat, repeat;
    height: 100vh;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    width: 100%;
    margin: 0;
    padding: 0;
    min-width: 320px;
    box-sizing: border-box;
}

/* 背景装饰 */
.ai-chat-container::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 40%;
    height: 50%;
    background: radial-gradient(circle at 100% 0%, rgba(255, 127, 80, 0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

.ai-chat-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 30%;
    height: 40%;
    background: radial-gradient(circle at 0% 100%, rgba(255, 127, 80, 0.03) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
}

/* 页面头部 */
.chat-header {
    background: rgba(255, 255, 255, 0.95);
    padding: 1.5rem 2rem;
    box-shadow: var(--shadow-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 127, 80, 0.2);
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
}

.header-left {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    box-shadow: var(--shadow-md);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 127, 80, 0.4);
    }

    70% {
        box-shadow: 0 0 0 10px rgba(255, 127, 80, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(255, 127, 80, 0);
    }
}

.header-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    overflow: hidden;
}

.brand-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.brand-badge {
    background: rgba(255, 82, 82, 0.12);
    color: var(--primary-dark);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    border: 1px solid rgba(255, 82, 82, 0.2);
}

.status-pill {
    background: var(--status-green-bg);
    color: var(--status-green);
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--status-green);
    box-shadow: 0 0 0 6px rgba(46, 125, 50, 0.08);
}

.chat-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 0;
    letter-spacing: -0.3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-subtitle {
    font-size: 1rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.header-right {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.control-btn {
    background: rgba(255, 255, 255, 0.9);
    color: var(--primary-color);
    border: 2px solid rgba(255, 82, 82, 0.3);
    padding: 0.875rem 1.75rem;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(255, 82, 82, 0.1);
}

.control-btn:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 8px 25px rgba(255, 82, 82, 0.2);
}

.btn-icon {
    font-size: 1.1rem;
}

/* 聊天消息区域 */
.chat-messages {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    max-width: 1080px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    scroll-behavior: smooth;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
    width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
    background: var(--primary-lighter);
    border-radius: 10px;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: var(--primary-light);
    border-radius: 10px;
    transition: var(--transition);
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: var(--primary-color);
}

/* 欢迎消息 */
.welcome-message {
    text-align: center;
    padding: 2rem;
    max-width: 600px;
    margin: auto;
    animation: fadeInUp 0.8s ease-out;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.welcome-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
}

.welcome-ai-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    box-shadow: var(--shadow-lg);
    animation: bounce 2s infinite;
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0);
    }

    40% {
        transform: translateY(-20px);
    }

    60% {
        transform: translateY(-10px);
    }
}

.welcome-title {
    font-size: 2.25rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 1.5rem;
    letter-spacing: -0.5px;
}

.welcome-text {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin: 0 0 3rem;
    line-height: 1.7;
}

.welcome-badges {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-bottom: 2.5rem;
}

.feature-badge {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 82, 82, 0.2);
    color: var(--primary-dark);
    padding: 0.45rem 1rem;
    border-radius: 999px;
    font-size: 0.88rem;
    font-weight: 600;
    box-shadow: 0 6px 16px rgba(255, 82, 82, 0.08);
}

.welcome-suggestions {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    align-items: center;
}

.suggestion-btn {
    background: rgba(255, 255, 255, 0.95);
    color: var(--primary-color);
    border: 2px solid rgba(255, 127, 80, 0.2);
    padding: 1.25rem 1.75rem;
    border-radius: 16px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    text-align: left;
    width: 100%;
    max-width: 450px;
    display: flex;
    align-items: center;
    gap: 1rem;
    backdrop-filter: blur(5px);
}

.suggestion-btn:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
}

.suggestion-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
}

/* 聊天消息 */
.chat-message {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    animation: messageSlide 0.4s ease-out;
    position: relative;
}

.chat-message.user {
    flex-direction: row-reverse;
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(255, 127, 80, 0.3);
}

.message-avatar {
    flex-shrink: 0;
}

.message-content {
    max-width: 75%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.message-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: var(--text-muted);
    font-size: 0.85rem;
}

.role-tag {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 0.4px;
    background: rgba(255, 82, 82, 0.12);
    color: var(--primary-dark);
    border: 1px solid rgba(255, 82, 82, 0.2);
}

.role-tag.user {
    background: rgba(183, 28, 28, 0.12);
    color: #b71c1c;
    border-color: rgba(183, 28, 28, 0.25);
}

.message-bubble {
    position: relative;
    display: inline-block;
}

.copy-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(255, 255, 255, 0.8);
    color: var(--text-muted);
    border: none;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
    opacity: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-bubble:hover .copy-btn {
    opacity: 1;
}

.copy-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
}

.copy-icon {
    font-size: 0.9rem;
}

.message-bubble.user {
    align-self: flex-end;
}

.message-text {
    padding: 1.25rem 1.5rem;
    border-radius: 20px;
    line-height: 1.6;
    position: relative;
    word-wrap: break-word;
}

.user-text {
    background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 8px 25px rgba(183, 28, 28, 0.4);
    font-weight: 600;
    font-size: 1.05rem;
    animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-text {
    background: rgba(255, 255, 255, 0.95);
    color: var(--text-primary);
    border-bottom-left-radius: 4px;
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 82, 82, 0.2);
    animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Markdown内容样式 */
.markdown-content {
    line-height: 1.7;
    color: var(--text-primary);
    width: 100%;
    overflow-x: hidden;
}

.markdown-content h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 1.5rem 0 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary-light);
    width: 100%;
    overflow-x: hidden;
}

.markdown-content h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 1.25rem 0 0.75rem;
    padding-bottom: 0.25rem;
    border-bottom: 1px solid var(--primary-light);
    width: 100%;
    overflow-x: hidden;
}

.markdown-content p {
    margin: 0.75rem 0;
    width: 100%;
    overflow-x: hidden;
    word-wrap: break-word;
}

.markdown-content ul,
.markdown-content ol {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
    width: 100%;
    overflow-x: hidden;
}

.markdown-content li {
    margin: 0.5rem 0;
    width: 100%;
    overflow-x: hidden;
    word-wrap: break-word;
}

.markdown-content strong {
    font-weight: 600;
    color: var(--primary-color);
}

.markdown-content code {
    background: var(--primary-light);
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 0.9rem;
    color: var(--primary-dark);
    word-wrap: break-word;
}

.markdown-content pre {
    background: var(--primary-light);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1rem 0;
    color: var(--text-primary);
    max-width: 100%;
    box-sizing: border-box;
}

.markdown-content pre code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    word-wrap: break-word;
}

.message-time {
    font-size: 0.85rem;
    color: var(--text-muted);
    font-weight: 600;
}

.chat-message.user .message-time {
    align-self: flex-end;
}

/* 输入区域 */
.chat-input-area {
    background: rgba(255, 255, 255, 0.95);
    padding: 1.75rem 2rem;
    box-shadow: 0 -4px 20px rgba(255, 82, 82, 0.08);
    display: flex;
    gap: 1.25rem;
    align-items: center;
    max-width: 1080px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    position: sticky;
    bottom: 0;
    z-index: 100;
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 82, 82, 0.2);
}

.input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
}

.message-input {
    width: 100%;
    padding: 1.25rem 1.5rem;
    border: 2px solid rgba(255, 82, 82, 0.2);
    border-radius: 20px;
    font-size: 1rem;
    resize: none;
    min-height: 88px;
    max-height: 250px;
    font-family: inherit;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-sizing: border-box;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    box-shadow: 0 4px 15px rgba(255, 82, 82, 0.05);
}

.message-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.2), 0 8px 25px rgba(255, 82, 82, 0.15);
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
}

.message-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.input-actions {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    gap: 0.5rem;
}

.action-btn {
    background: rgba(255, 255, 255, 0.8);
    color: var(--text-muted);
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    font-size: 0.9rem;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(5px);
}

.action-btn:hover {
    background: var(--primary-light);
    color: var(--primary-color);
    transform: scale(1.1);
}

.send-btn {
    background: linear-gradient(135deg, #ff5252 0%, #d32f2f 100%);
    color: white;
    border: none;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    font-size: 1.5rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 25px rgba(255, 82, 82, 0.4);
    flex-shrink: 0;
    animation: pulse 2s infinite;
}

.send-btn:hover:not(:disabled) {
    transform: translateY(-4px) scale(1.1);
    box-shadow: 0 12px 35px rgba(255, 82, 82, 0.5);
    animation: none;
}

.send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: var(--shadow-sm);
}

.send-icon {
    font-size: 1.5rem;
    font-weight: bold;
}

.loading-spinner {
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* 加载状态 */
.typing-indicator {
    display: flex;
    gap: 0.5rem;
    padding: 1.25rem 1.5rem;
}

.typing-indicator span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--primary-color);
    animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

/* 动画效果 */
@keyframes messageSlide {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes typing {

    0%,
    60%,
    100% {
        transform: translateY(0);
        opacity: 0.4;
    }

    30% {
        transform: translateY(-10px);
        opacity: 1;
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

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px) scale(0.9);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px) scale(0.9);
    }

    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .chat-header {
        flex-direction: row;
        gap: 0.5rem;
        text-align: left;
        padding: 1rem;
        flex-wrap: wrap;
    }

    .header-left {
        flex-direction: row;
        gap: 0.75rem;
        flex: 1;
        min-width: 0;
    }

    .header-info {
        flex: 1;
        min-width: 0;
    }

    .chat-title {
        font-size: 1.25rem;
    }

    .chat-subtitle {
        font-size: 0.85rem;
    }

    .brand-badge,
    .status-pill {
        font-size: 0.75rem;
        padding: 0.3rem 0.6rem;
    }

    .header-right {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .control-btn {
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
    }

    .chat-messages {
        padding: 1rem;
    }

    .welcome-message {
        padding: 4rem 1rem;
    }

    .welcome-ai-avatar {
        width: 80px;
        height: 80px;
        font-size: 2.5rem;
    }

    .welcome-title {
        font-size: 1.75rem;
    }

    .welcome-badges {
        gap: 0.5rem;
    }

    .feature-badge {
        font-size: 0.78rem;
    }

    .message-content {
        max-width: 85%;
    }

    .chat-input-area {
        padding: 1.25rem 1rem;
        gap: 1rem;
    }

    .message-input {
        min-height: 80px;
        padding: 1rem 1.25rem;
    }

    .send-btn {
        width: 48px;
        height: 48px;
    }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
    .ai-chat-container {
        background-color: #151515;
        background-image: linear-gradient(135deg, #151515 0%, #252525 100%), linear-gradient(90deg, rgba(255, 82, 82, 0.08) 1px, transparent 1px), linear-gradient(rgba(255, 82, 82, 0.08) 1px, transparent 1px);
        background-size: cover, 32px 32px, 32px 32px;
        background-repeat: no-repeat, repeat, repeat;
    }

    .chat-header,
    .chat-input-area {
        background: rgba(30, 30, 30, 0.95);
        border-color: rgba(255, 127, 80, 0.2);
    }

    .chat-title {
        color: var(--primary-color);
    }

    .chat-subtitle,
    .welcome-text {
        color: #aaa;
    }

    .welcome-title {
        color: #fff;
    }

    .suggestion-btn,
    .ai-text {
        background: rgba(40, 40, 40, 0.95);
        border-color: rgba(255, 127, 80, 0.3);
        color: #fff;
    }

    .brand-badge,
    .feature-badge {
        background: rgba(255, 82, 82, 0.18);
        color: #ffb3b3;
        border-color: rgba(255, 82, 82, 0.35);
    }

    .status-pill {
        background: rgba(46, 125, 50, 0.2);
        color: #8be28f;
    }

    .role-tag {
        background: rgba(255, 82, 82, 0.22);
        color: #ffb3b3;
        border-color: rgba(255, 82, 82, 0.35);
    }

    .role-tag.user {
        background: rgba(183, 28, 28, 0.25);
        color: #ff9a9a;
        border-color: rgba(183, 28, 28, 0.4);
    }

    .message-input {
        background: rgba(40, 40, 40, 0.9);
        border-color: rgba(255, 127, 80, 0.3);
        color: #fff;
    }

    .markdown-content h1,
    .markdown-content h2 {
        color: #fff;
    }

    .markdown-content code {
        background: rgba(255, 127, 80, 0.2);
        color: var(--primary-color);
    }

    .markdown-content pre {
        background: rgba(40, 40, 40, 0.8);
    }
}
</style>
