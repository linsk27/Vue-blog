/*
 * @Author: linsk27 14062626+linsk27@user.noreply.gitee.com
 * @Date: 2025-07-23 14:36:39
 * @LastEditors: linsk27 14062626+linsk27@user.noreply.gitee.com
 * @LastEditTime: 2025-07-23 15:10:54
 * @FilePath: \performance\src\routers\modules\essays.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { RouteRecordRaw } from 'vue-router'

const essaysRouters: Array<RouteRecordRaw> = [
    {
        path: '/essays',
        component: () => import('@/views/essays/index.vue'),
        meta: { title: '随笔' }
    },
    {
        path: '/essays/:id',
        component: () => import('@/views/essays/ArticlePage.vue'), // 文章详情
        props: true,
      },
]
export default essaysRouters
