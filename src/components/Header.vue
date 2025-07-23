<template>
    <nav class="enterprise-navbar">
        <div class="container">
            <!-- 左侧Logo和公司名称 -->
            <div class="brand">
                <img class="logo" src="@/assets/images/speedHeadLogo.png" alt="Company Logo" />
                <span class="company-name">Vue Enterprise</span>
            </div>

            <!-- 主导航菜单 -->
            <ul class="nav-menu">
                <li><router-link to="/">首页</router-link></li>
                <li><router-link to="/performance">性能</router-link></li>
                <li><router-link to="/essays">随笔</router-link></li>
            </ul>

            <!-- 右侧用户区域 -->
            <div class="user-area">
                <el-dropdown trigger="hover" @command="handleCommand">
                    <div class="user-profile">
                        <el-avatar :size="36" :src="userAvatar" />
                        <span class="username">{{ userName }}</span>
                        <el-icon><arrow-down /></el-icon>
                    </div>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                            <el-dropdown-item command="settings">账号设置</el-dropdown-item>
                            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useElMessage } from '@/hooks/useMessage'
import { useGlobalStore } from '@/store'

const { message } = useElMessage()
const router = useRouter()
const globalStore = useGlobalStore()

// 用户信息 (实际应用中应从store获取)
const userName = globalStore.userInfo?.username || '未登录'
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const handleCommand = (command: string) => {
    switch (command) {
        case 'profile':
            router.push('/profile')
            break
        case 'settings':
            router.push('/settings')
            break
        case 'logout':
            // 这里处理登出逻辑
            logOut()
            console.log('执行登出操作')
            break
    }
}
const logOut = () => {
    globalStore.clearLoginInfo() // 清除登录信息
    message.success('退出登录成功')
    router.push('/login') // 跳转到登录页面
}
</script>

<style scoped lang="scss">
.enterprise-navbar {
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid #e6e6e6;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
    position: relative;
    z-index: 1000;

    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        display: flex;
        align-items: center;
        height: 64px;
        justify-content: space-between;
    }
}

.brand {
    display: flex;
    align-items: center;
    cursor: pointer;

    .logo {
        width: 32px;
        height: 32px;
        margin-right: 12px;
    }

    .company-name {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        letter-spacing: 0.5px;
    }
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    flex: 1;
    justify-content: center;
    gap: 32px;

    li {
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;

        a {
            color: #666;
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            padding: 8px 0;
            transition: all 0.3s ease;
            position: relative;

            &:hover {
                color: #1890ff;
            }

            &.router-link-active {
                color: #1890ff;

                &::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: #1890ff;
                    border-radius: 1px;
                }
            }
        }
    }
}


.user-area {
    display: flex;
    align-items: center;

    .user-profile {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.3s;


        .username {
            margin: 0 8px 0 12px;
            font-size: 14px;
            color: #333;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .el-icon {
            color: #999;
            font-size: 12px;
        }
    }
}

.user-profile:focus {
    outline: none !important;
    border: none !important;
}
</style>