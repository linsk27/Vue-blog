<template>
    <StarBackground v-if="imgStore.ifShowStar" />
    <div v-if="route.path === '/login'">
        <router-view></router-view>
    </div>
    <div v-else>
        <div class="container">
            <Header />
            <main>
                <transition name="fade" mode="out-in">
                    <img :key="imgStore.url ?? ''" :src="imgStore.url || defaultBg" alt="背景图片" />
                </transition>
                <router-view></router-view>
            </main>
            <Footer />
        </div>
    </div>
</template>
<script setup lang="ts">
import defaultBg from "@/assets/images/backImg.jpg"
import { useRoute } from 'vue-router';
const route = useRoute();
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import StarBackground from './components/StarBackground.vue';
import { useImgStore } from './store/backgroundImg';

const imgStore = useImgStore()

</script>

<style scoped>
.container {
    height: 100vh;
    display: flex;
    flex-direction: column;

    img {
        position: fixed;
        height: 100vh;
        top: 0;
        width: 100%;
        overflow: hidden;
        left: 0;
        object-fit: cover;
        z-index: -1;
    }
}

.fade-enter-active {
    transition: opacity 0.5s ease;
}

.fade-leave-active {
    transition: opacity 0.5s ease;
    position: absolute;
    /* 保留在原位，直到动画结束 */
}

.fade-enter-from {
    opacity: 0.5;
}

.fade-enter-to,
.fade-leave-from {
    opacity: 1;
}

.fade-leave-to {
    opacity: 1;
    /* 不让旧图淡出 */
}



main {
    flex: 1;
    display: flex;
    justify-content: center;
}
</style>
