<template>
    <footer class="official-footer">
        <div class="footer-content">
            <!-- 图片占位区域 -->
            <div class="footer-image-placeholder">
                <slot name="image">
                    <!-- 这里可以放置默认图片或留空 -->
                </slot>
            </div>

            <!-- 文字内容区域 -->
            <div class="footer-text">
                <p class="copyright">© 2025 Linda's blog. All rights reserved.</p>
                <div class="links">
                    <a href="https://lindablog.xyz" class="link-item">lindablog.xyz</a>
                    <a href="#" class="link-item">contact me 1809578063@qq.com</a>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
// 这里可以添加需要的逻辑
</script>

<style scoped>
.official-footer {
    /* background-color: #f8f8f8; */
    padding: 1.5rem 0;
    border-top: 1px solid #e7e7e78b;
    font-family: system-ui, -apple-system, sans-serif;
}

.footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 0 1rem;
}

.footer-image-placeholder {
    height: 40px;
    /* 可根据需要调整 */
    display: flex;
    align-items: center;
    justify-content: center;
}

.footer-text {
    text-align: center;
    color: #fff;
}

.copyright {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
}

.links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
}

.link-item {
    color: #fff;
    text-decoration: none;
    font-size: 0.85rem;
}

.link-item:hover {
    text-decoration: underline;
    color: #000;
}

/* 响应式设计 */
@media (min-width: 768px) {
    .footer-content {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    .footer-text {
        text-align: left;
    }

    .links {
        justify-content: flex-start;
    }
}
</style>