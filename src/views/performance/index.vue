<template>
    <div class="perf-index">
        <h2 class="title">性能优化示例</h2>
        <div class="controls">
            <input v-model="search" placeholder="搜索示例..." class="search-input" />
        </div>

        <ul class="feature-list">
            <li v-for="route in filteredRoutes" :key="route.path" class="feature-item">
                <router-link :to="getRoutePath(route.path)" class="feature-link">
                    <span class="label">{{ route.meta!.title }}</span>
                </router-link>
            </li>
        </ul>

        <section class="detail-view">
            <router-view />
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const router = useRouter()
const routes = (router.getRoutes().find(r => r.path === '/performance')!.children || []) as RouteRecordRaw[]

const search = ref('')
const filteredRoutes = computed(() => routes.filter((r: any) => r.meta?.title?.toLowerCase().includes(search.value.toLowerCase())))

function getRoutePath(sub: string) {
    return `/performance/${sub}`
}
</script>

<style scoped>
.perf-index {
    padding: 1.5rem;
    width: 900px;
    /* margin: 0 auto; */
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #fff;
}

.feature-link {
    color: #fff;
}
</style>
