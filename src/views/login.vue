<template>
    <div class="auth-container">
        <div class="auth-card">
            <h2>{{ isLoginMode ? "登录" : "注册" }}</h2>

            <form @submit.prevent="handleSubmit" autocomplete="off">
                <!-- 用户名/用户名 -->
                <div class="form-group">
                    <label for="username">用户名</label>
                    <input type="username" id="username" v-model="formData.username" placeholder="请输入用户名" required />
                </div>

                <!-- 密码 -->
                <div class="form-group">
                    <label for="password">密码</label>
                    <input type="password" id="password" v-model="formData.password" placeholder="请输入密码" required
                        minlength="6" />
                </div>

                <!-- 注册时额外显示确认密码 -->
                <div class="form-group" v-if="!isLoginMode">
                    <label for="confirmPassword">确认密码</label>
                    <input type="password" id="confirmPassword" v-model="formData.confirmPassword" placeholder="请再次输入密码"
                        required minlength="6" />
                </div>

                <!-- 提交按钮 -->
                <button type="submit" class="submit-btn">
                    {{ isLoginMode ? "登录" : "注册" }}
                </button>
            </form>

            <!-- 切换登录/注册 -->
            <p class="toggle-mode" @click="toggleMode">
                {{ isLoginMode ? "没有账号？去注册" : "已有账号？去登录" }}
            </p>
            <div class="guest" @click="guestLogin">游客登录</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useElMessage } from "@/hooks/useMessage";
import authApi from "@/api/modules/auth";
import { useGlobalStore } from "@/store";
import { IUserInfo } from "@/api/modules/auth/interface";
import { useRouter } from "vue-router";
const router = useRouter()
const { message } = useElMessage();
// 登录/注册模式切换
const isLoginMode = ref(true);
const global = useGlobalStore();
// 表单数据
const formData = ref({
    username: "",
    password: "",
    confirmPassword: "",
});

// 切换模式
const toggleMode = () => {
    isLoginMode.value = !isLoginMode.value;
    formData.value = { username: "", password: "", confirmPassword: "" }; // 清空表单
};
const login = async () => {
    try {
        const data: IUserInfo = await authApi.login({
            username: formData.value.username,
            password: formData.value.password,
        });
        if (data) {
            global.setLoginInfo(data.token, data);
            message.success("登录成功！");
            router.push("/"); // 登录成功后跳转到首页
        }
    } catch (error) {
        message.error('登陆: ' + error)
    }
};
const register = async () => {
    try {
        if (formData.value.password !== formData.value.confirmPassword) {
            message.warning("两次输入的密码不一致，请检查后重试！");
            return;
        }
        const data = await authApi.register({
            username: formData.value.username,
            password: formData.value.password,
        }) as { success: boolean };
        if (data.success) {
            toggleMode()
            message.success("注册成功，请重新登录");
        }
    } catch (error) {
        message.error('注册: ' + error)

    }
};

// 提交表单
const handleSubmit = async () => {
    try {
        if (isLoginMode.value) {
            await login();
        } else {
            await register();
        }
    } catch (error) {
        message.error('提交表单失败: ' + error)
    }
};
const guestLogin = () => {
    router.push('/')
    message.success("游客登录成功，欢迎使用！");
}
</script>

<style scoped>
/* 全局居中 */
.auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
}

/* 卡片样式 */
.auth-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

/* 标题 */
h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    color: #333;
}

/* 表单组 */
.form-group {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

/* 提交按钮 */
.submit-btn {
    width: 100%;
    padding: 0.75rem;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
}

.submit-btn:hover {
    background: #3aa876;
}

/* 切换模式文字 */
.toggle-mode {
    text-align: center;
    margin-top: 1rem;
    color: #666;
    cursor: pointer;
}

.toggle-mode:hover {
    color: #42b983;
    text-decoration: underline;
}

.guest {
    cursor: pointer;
    text-align: right;
}

.guest:hover {
    color: #0162ea;
    font-weight: bold;
}
</style>