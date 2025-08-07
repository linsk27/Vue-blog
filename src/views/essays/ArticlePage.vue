<script setup lang="ts">
import { useRoute } from 'vue-router'
import { articles } from './articles/index'
import { ref, onMounted } from 'vue'

const route = useRoute()
const article = articles.find(a => a.id === route.params.id)
const ArticleComp = ref()
onMounted(async () => {
  if (article) {
    ArticleComp.value = (await article.component()).default
  }
})
</script>

<template>
  <div class="article-page">
    <div class="article-header">
      <button class="back-btn" @click="$router.back()">← 返回列表</button>
      <div v-if="article">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-tags">
          <span class="article-tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
        </div>
        <p class="article-summary">{{ article.summary }}</p>
      </div>
    </div>
    <div class="article-content-card">
      <component v-if="ArticleComp" :is="ArticleComp" />
      <div v-else class="not-found">文章不存在</div>
    </div>
  </div>
</template>

<style scoped>
.article-page {
  max-width: 900px;
  margin: 48px auto 0 auto;
  padding: 0 16px 40px 16px;
}
.article-header {
  margin-bottom: 32px;
  border-bottom: 1.5px solid #e3e8ee;
  padding-bottom: 18px;
}
.back-btn {
  background: #e3f2fd;
  color: #1976d2;
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
  background: #1976d2;
  color: #fff;
}
.article-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1976d2;
  margin-bottom: 10px;
}
.article-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.article-tag {
  background: #e3f2fd;
  color: #1976d2;
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
}
.article-content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #1976d211;
  border: 1.5px solid #e3e8ee;
  padding: 15px;
  min-height: 300px;
  margin-top: 18px;
}
.not-found {
  color: #d32f2f;
  font-size: 1.2rem;
  text-align: center;
  padding: 40px 0;
}
@media (max-width: 700px) {
  .article-content-card {
    padding: 16px 8px 12px 8px;
  }
  .article-title {
    font-size: 1.3rem;
  }
}
</style>