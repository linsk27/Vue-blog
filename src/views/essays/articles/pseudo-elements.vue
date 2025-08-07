<!--
 * @Author: linsk27 14062626+linsk27@user.noreply.gitee.com
 * @Date: 2025-07-24
 * @FilePath: /performance/src/views/essays/articles/pseudo-elements.vue
 * @Description: CSS伪元素教学交互页面
-->
<template>
    <div class="teach-page">
        <div class="header-row">
            <h1>CSS 伪元素是什么？有什么作用？</h1>
            <button class="reset-btn" @click="resetDemo">重置全部演示</button>
        </div>
        <p class="desc">
            本页面通过交互演示和代码讲解，帮助你理解 <b>CSS 伪元素</b> 的作用和常见用法。
            <br>
            <b>伪元素</b>用于为元素的特定部分设置样式，如首字母、首行、内容前后等。
        </p>

        <div class="pseudo-list">
            <section v-for="item in pseudoList" :key="item.key" class="pseudo-card">
                <h2>{{ item.label }} <span class="pseudo-desc">{{ item.desc }}</span></h2>
                <div class="demo-preview">
                    <div class="demo-label">演示效果：</div>
                    <div :class="['demo-box', pseudoStates[item.key] ? item.key : '']">
                        {{ demoTexts[item.key] }}
                    </div>
                </div>
                <div class="interaction-area">
                    <div class="interaction-label">交互操作：</div>
                    <div class="interaction-btns">
                        <button @click="togglePseudo(item.key)" class="action-btn">
                            {{ pseudoStates[item.key] ? '隐藏' : '显示' }} {{ item.label }} 效果
                        </button>
                        <button @click="changeDemoText(item.key)" class="action-btn">
                            更换演示文本
                        </button>
                    </div>
                </div>
                <div class="code-block">
                    <div class="code-title">对应 CSS 代码</div>
                    <pre><code>{{ item.code }}</code></pre>
                </div>
                <button class="reset-btn small" @click="resetOne(item.key)">重置本项</button>
            </section>
        </div>

        <section class="card">
            <h2>伪元素的原理与作用</h2>
            <div class="explain">
                <ul>
                    <li>伪元素本质上是 <b>选择器</b>，用于选中元素的某个特殊部分（如首字母、首行、内容前后等）。</li>
                    <li>常见的伪元素有
                        <code>::before</code>、<code>::after</code>、<code>::first-letter</code>、<code>::first-line</code>、<code>::selection</code>
                        等。
                    </li>
                    <li>伪元素不会改变 HTML 结构，但能让你用 CSS 实现更丰富的视觉效果和交互。</li>
                    <li>如 <b>::before/::after</b> 可用于插入装饰性内容，<b>::first-letter/::first-line</b>
                        可用于美化文本，<b>::selection</b> 可自定义选中样式。</li>
                </ul>
            </div>
        </section>

        <section class="summary-card">
            <h2>总结</h2>
            <ul>
                <li><b>伪元素</b>让你无需修改 HTML，即可为元素的特定部分添加样式或内容。</li>
                <li>常用于装饰、排版、交互增强，是 CSS 进阶必备技能。</li>
                <li>掌握伪元素，能让你的页面更灵活、更美观。</li>
            </ul>
        </section>
    </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

const pseudoList = [
    {
        key: 'before',
        label: '::before',
        desc: '在元素内容前插入内容',
        code: `.demo-box.before::before {
  content: "★ ";
  color: #1976d2;
  font-size: 18px;
}`
    },
    {
        key: 'after',
        label: '::after',
        desc: '在元素内容后插入内容',
        code: `.demo-box.after::after {
  content: " ✿";
  color: #d32f2f;
  font-size: 18px;
}`
    },
    {
        key: 'first-letter',
        label: '::first-letter',
        desc: '选择文本的首字母',
        code: `.demo-box.first-letter::first-letter {
  color: #d32f2f;
  font-size: 2em;
  font-weight: bold;
}`
    },
    {
        key: 'first-line',
        label: '::first-line',
        desc: '选择文本的首行',
        code: `.demo-box.first-line::first-line {
  color: #1976d2;
  font-weight: bold;
  background: #e3e8ee;
}`
    },
    {
        key: 'selection',
        label: '::selection',
        desc: '选择用户选中的文本',
        code: `.demo-box.selection::selection {
  background: #90caf9;
  color: #fff;
}`
    }
]

const defaultText = 'CSS伪元素让你无需修改HTML结构，就能为内容添加特殊效果！'
const demoTexts = reactive<Record<string, string>>({})
const pseudoStates = reactive<Record<string, boolean>>({})
const demoTextOptions = [
    'CSS伪元素让你无需修改HTML结构，就能为内容添加特殊效果！',
    '这是一个演示文本，你可以看到伪元素的效果。',
    'Hello World! 伪元素可以美化你的网页。',
    '首字母会变大，首行会变色，选中文本有特殊样式。'
]

pseudoList.forEach(item => {
    demoTexts[item.key] = defaultText
    pseudoStates[item.key] = true
})

function togglePseudo(key: string) {
    pseudoStates[key] = !pseudoStates[key]
}

function changeDemoText(key: string) {
    const currentIndex = demoTextOptions.indexOf(demoTexts[key])
    const nextIndex = (currentIndex + 1) % demoTextOptions.length
    demoTexts[key] = demoTextOptions[nextIndex]
}

function resetOne(key: string) {
    demoTexts[key] = defaultText
    pseudoStates[key] = true
}

function resetDemo() {
    pseudoList.forEach(item => {
        demoTexts[item.key] = defaultText
        pseudoStates[item.key] = true
    })
}
</script>

<style scoped>
.teach-page {
    margin: 0 auto;
    font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
    max-width: 800px;
}

.header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
}

.reset-btn {
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 5px;
    padding: 7px 22px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 8px #1976d211;
    transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.reset-btn:hover {
    background: #1565c0;
    color: #fff;
    box-shadow: 0 4px 16px #1976d222;
}

.reset-btn.small {
    padding: 4px 14px;
    font-size: 13px;
    margin-top: 8px;
}

.desc {
    color: #333;
    margin-bottom: 32px;
    font-size: 17px;
    letter-spacing: 0.2px;
}

.pseudo-list {
    display: flex;
    flex-direction: column;
    gap: 32px;
    margin-bottom: 44px;
}

.pseudo-card {
    width: 100%;
    border-radius: 10px;
    border: 1px solid #e3e8ee;
    padding: 22px 18px 18px 18px;
    background: #fff;
    box-shadow: 0 1px 8px #0001;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transition: border 0.2s, box-shadow 0.2s;
}

.pseudo-card:hover {
    border: 1px solid #1976d2;
    box-shadow: 0 2px 16px #1976d222;
    background: #fafdff;
}

.pseudo-card h2 {
    font-size: 18px;
    color: #1976d2;
    margin-bottom: 8px;
    font-weight: 600;
}

.pseudo-desc {
    color: #666;
    font-size: 14px;
    font-weight: 400;
    margin-left: 8px;
}

.demo-preview {
    margin-bottom: 14px;
    width: 100%;
}

.demo-label {
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 500;
}

.interaction-area {
    margin-bottom: 14px;
    width: 100%;
}

.interaction-label {
    color: #666;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: 500;
}

.interaction-btns {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.action-btn {
    background: #f0f4f8;
    color: #1976d2;
    border: 1px solid #e3e8ee;
    border-radius: 5px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #e3f2fd;
    border-color: #1976d2;
    color: #1565c0;
}

.demo-box {
    min-height: 48px;
    padding: 12px 16px;
    border-radius: 8px;
    background: #f4f6fa;
    border: 1px solid #e3e8ee;
    font-size: 18px;
    color: #333;
    margin-bottom: 0;
    line-height: 1.8;
    box-shadow: 0 1px 4px #0001;
    user-select: text;
    width: 100%;
    box-sizing: border-box;
}



.demo-box.before::before {
    content: "★ ";
    color: #1976d2;
    font-size: 18px;
}

.demo-box.after::after {
    content: " ✿";
    color: #d32f2f;
    font-size: 18px;
}

.demo-box.first-letter::first-letter {
    color: #d32f2f;
    font-size: 2em;
    font-weight: bold;
}

.demo-box.first-line::first-line {
    color: #1976d2;
    font-weight: bold;
    background: #e3e8ee;
}

.demo-box.selection::selection {
    background: #90caf9;
    color: #fff;
}

.code-block {
    box-sizing: border-box;
    background: #23272f;
    color: #e6e6e6;
    border-radius: 6px;
    margin: 14px 0;
    padding: 14px 12px;
    font-size: 15px;
    overflow-x: auto;
    box-shadow: 0 1px 6px #0002;
    border: 1px solid #23272f;
    width: 100%;
    line-height: 1.7;
}

.code-title {
    color: #90caf9;
    font-weight: 600;
    margin-bottom: 4px;
}

.card {
    border-radius: 10px;
    background: transparent;
    box-shadow: none;
    padding: 16px 10px;
    margin-bottom: 24px;
}

.summary-card {
    border-radius: 10px;
    border: 1px solid #e3e8ee;
    background: transparent;
    box-shadow: none;
    padding: 18px 12px;
    margin-bottom: 28px;
    margin-top: 18px;
}

.summary-card h2 {
    color: #1976d2;
    font-size: 20px;
    margin-bottom: 10px;
    font-weight: 600;
}

.summary-card ul {
    font-size: 15px;
    color: #222;
    margin-bottom: 0;
    line-height: 1.8;
}

@media (max-width: 900px) {
    .teach-page {
        max-width: 100vw;
        padding: 0 4vw 32px 4vw;
    }

    .pseudo-list {
        gap: 18px;
        padding: 0;
    }

    .pseudo-card {
        padding: 12px 4vw 10px 4vw;
    }

    .card,
    .summary-card {
        padding: 12px 4vw;
    }
}

@media (max-width: 600px) {
    .teach-page {
        padding: 0 2vw 24px 2vw;
    }

    .pseudo-card,
    .card,
    .summary-card {
        padding-left: 2vw;
        padding-right: 2vw;
    }
}
</style>
