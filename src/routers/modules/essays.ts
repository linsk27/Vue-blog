import { RouteRecordRaw } from 'vue-router'

const essaysRouters: Array<RouteRecordRaw> = [
    {
        path: '/essays',
        component: () => import('@/views/essays/index.vue'),
        meta: { title: '随笔' }
    }
]
export default essaysRouters
