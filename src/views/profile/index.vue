<template>
    <div class="personal-center">
        <h1>个人中心</h1>
        <!-- 直接使用 SVG 图标 -->
        <Operation />
        <p>欢迎来到个人中心！</p>
    </div>
</template>
<script setup lang="ts">

</script>
<style scoped>
.personal-center {
    margin: 0 auto;
    font-family: 'Inter', 'Segoe UI', 'PingFang SC', 'Hiragino Sans', Arial, sans-serif;
    max-width: 800px;
}

.personal-center h1 {
    font-size: 24px;
    color: #1976d2;
    margin-bottom: 12px;
}

.personal-center p {
    color: #333;
    font-size: 16px;
    line-height: 1.5;
}
</style>