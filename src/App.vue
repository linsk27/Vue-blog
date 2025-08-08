<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>

<template>
    <div v-if="route.path === '/login'">
        <router-view></router-view>
    </div>
    <div v-else>
        <div class="container">
            <Header />
            <main>
                <img src="@/assets/images/backImg.jpg" alt="">
                <router-view></router-view>
            </main>
            <Footer />
        </div>
    </div>
</template>

<style scoped>
.container {
    /* background-image: url('@/assets/images/backImg.jpg'); */

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

    /* background-repeat: no-repeat;
    background-position: center center; */
}

main {
    flex: 1;
    display: flex;
    justify-content: center;
}
</style>
