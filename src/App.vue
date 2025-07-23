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
                <router-view></router-view>
            </main>
            <Footer />
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    min-height: 100vh;
    flex-direction: column;
}

main {
    flex: 1;
}
</style>
