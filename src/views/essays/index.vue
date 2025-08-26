<template>
    <div class="essays-list-page">
        <h1 class="essays-title">知识库文章列表</h1>
        <input v-model="search" class="essay-search" type="text" placeholder="搜索标题、标签或简介..." />
        <div class="essays-list">
            <div class="essay-row" v-for="a in filteredArticles" :key="a.id" @click="goToArticle(a.id)">
                <div class="essay-title">{{ a.title }}</div>
                <div class="essay-tags">
                    <span class="essay-tag" v-for="tag in a.tags" :key="tag">{{ tag }}</span>
                </div>
                <div class="essay-summary">{{ a.summary }}</div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { articles } from './articles/index'
import { useRouter } from 'vue-router'
const router = useRouter()
function goToArticle(id: string) {
    router.push(`/essays/${encodeURIComponent(id)}`)
}
const search = ref('')
const filteredArticles = computed(() => {
    const s = search.value.trim().toLowerCase()
    if (!s) return articles
    return articles.filter(a => {
        return (
            a.title.toLowerCase().includes(s) ||
            a.summary.toLowerCase().includes(s) ||
            (a.tags && a.tags.some((tag: string) => tag.toLowerCase().includes(s)))
        )
    })
})

function maxNodesFromLeaves(leafCount: number) {
    if (!Number.isInteger(leafCount) || leafCount <= 0) {
        throw new Error("leafCount must be a positive integer");
    }
    // 使用 Number 对 64-bit 安全范围内整数有效；超大可以用 BigInt
    return 2 * leafCount - 1;
}

// 测试
console.log(maxNodesFromLeaves(124)); // 247

</script>
<style scoped>
.essays-list-page {
    flex: 1;
    height: 100%;
    max-width: 900px;
    justify-content: center;
    padding: 0 16px 40px 16px;
}

.essays-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 18px;
    letter-spacing: 0.5px;
    text-align: left;
    font-family: 'Inter', 'PingFang SC', 'Segoe UI', Arial, sans-serif;
}

.essay-search {
    display: block;
    width: 100%;
    max-width: 400px;
    margin-bottom: 18px;
    padding: 7px 14px;
    font-size: 1rem;
    border: 1px solid #e3e8ee;
    border-radius: 6px;
    background: #f8fafc20;
    color: #eeeeee;
    outline: none;
    transition: border 0.18s;
}

.essay-search::placeholder {
    color: #b0b0b0;
}


.essay-search:focus {
    background: #f8fafc60;
}

.essays-list {
    display: flex;
    background: #ffffff10;
    border-radius: 10px;
    flex-direction: column;
    gap: 5px;
}

.essay-row {
    border-radius: 10px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    border: 3px solid #ffffff30;
    min-height: 48px;
    cursor: pointer;
    background-color: #ffffff20;
    transition: background 0.15s;
}

.essay-row:hover {
    background: #ffffff80;
}

.essay-title {
    flex: 0 0 300px;
    font-size: 1rem;
    color: rgb(255, 255, 255);
    font-weight: 500;
    font-family: 'Inter', 'PingFang SC', 'Segoe UI', Arial, sans-serif;
    margin-right: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.essay-tags {
    flex: 0 0 auto;
    display: flex;
    gap: 4px;
    margin-right: 12px;
}

.essay-tag {
    background: #f3f6fa;
    color: #1976d2;
    border-radius: 6px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 400;
    border: 1px solid #e3e8ee;
}

.essay-summary {
    flex: 1 1 auto;
    color: rgb(255, 255, 255);
    font-size: 0.97rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 500px) {
    .essay-title {
        flex-basis: 100px;
        font-size: 0.95rem;
    }

    .essay-summary {
        font-size: 0.92rem;
    }
}
</style>