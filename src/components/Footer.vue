<template>
    <footer class="official-footer">

        <div class="footer-content">
            <!-- 图片占位区域 -->
            <div class="footer-image-placeholder">
                <slot name="image">
                    <IconPicture class="icon-picture" theme="outline" size="22" fill="#fff"
                        @click="changeBackground()" />
                    <IconStar class="icon-picture" theme="outline" size="22" fill="#fff" @click="changeStar()" />
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
import { ref } from 'vue'
import { NewPicture as IconPicture, Star as IconStar } from '@icon-park/vue-next'
import { useImgStore } from '@/store/backgroundImg'
const imgStore = useImgStore()
const index = ref(0)
// 此处后期使用api接口获取数据
const imgUrlData = ref([
    "https://s2.loli.net/2025/08/27/XkKHlSEcUIvafWd.jpg",
    "https://s2.loli.net/2025/08/27/ygncYMIGHK1NAaT.jpg",
])
console.log('[ imgStore.url ] >', imgStore.url)
if (imgStore.url) {
    index.value = imgUrlData.value.findIndex(item => item === imgStore.url) + 1
}
console.log('[ index.value ] >', index.value)
const changeBackground = () => {
    console.log('[ index.value ] >', index.value)
    if (index.value >= imgUrlData.value.length) index.value = 0
    // 白屏优化
    const img = new Image()
    img.src = imgUrlData.value[index.value]
    img.onload = () => {
        imgStore.changeUrl(img.src)
    }

    index.value++
}
const changeStar = () => {
    imgStore.toggleStar()
}
</script>

<style scoped>
.official-footer {
    padding: 1.5rem 0;
    box-shadow: 0 -2px 12px 10px rgba(0, 0, 0, 0.1);
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
    gap: 2rem;
    align-items: center;
    justify-content: center;
}

.icon-picture {
    cursor: pointer;
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