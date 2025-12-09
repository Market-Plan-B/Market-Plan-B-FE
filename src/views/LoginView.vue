<template>
    <div class="login-container">
        <!-- 배경: 산과 달이 있는 야경 -->
        <div class="background-scene">
            <!-- 별들 -->
            <div class="stars">
                <div v-for="i in 50" :key="i" class="star" :style="getStarStyle(i)"></div>
            </div>

            <!-- 달 -->
            <div class="moon"></div>

            <!-- 산들 -->
            <div class="mountains">
                <div class="mountain mountain-1"></div>
                <div class="mountain mountain-2"></div>
                <div class="mountain mountain-3"></div>
            </div>
        </div>

        <!-- 로그인 폼 -->
        <div class="login-form-container">
            <div class="login-form">
                <h1 class="login-title">Login1</h1>

                <!-- 이메일 입력 -->
                <div class="input-group">
                    <input type="email" placeholder="email" v-model="email" class="login-input" />
                    <User class="input-icon" />
                </div>

                <!-- 비밀번호 입력 -->
                <div class="input-group">
                    <input type="password" placeholder="Password" v-model="password" class="login-input"
                        @keyup.enter="handleLogin" />
                    <Lock class="input-icon" />
                </div>

                <!-- 옵션 -->
                <div class="form-options">
                    <label class="remember-me">
                        <input type="checkbox" v-model="rememberMe" class="checkbox" />
                        <span>로그인 상태 유지</span>
                    </label>
                </div>

                <!-- 에러 메시지 -->
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <!-- 로그인 버튼 -->
                <button @click="handleLogin" class="login-button" :disabled="!email || !password || loading">
                    <span v-if="loading">로그인 중...</span>
                    <span v-else>Log in</span>
                </button>

            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock } from 'lucide-vue-next';
import { authService } from '@/api/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const loading = ref(false);
const errorMessage = ref('');

const getStarStyle = (index: number): Record<string, string> => {
    const size = Math.random() * 2 + 1;
    const left = Math.random() * 100;
    const top = Math.random() * 50;
    const delay = Math.random() * 2;
    return {
        width: `${size}px`,
        height: `${size}px`,
        left: `${left}%`,
        top: `${top}%`,
        animationDelay: `${delay}s`
    };
};

const handleLogin = async () => {
    if (!email.value || !password.value) {
        errorMessage.value = '이메일과 비밀번호를 입력해주세요.';
        return;
    }

    loading.value = true;
    errorMessage.value = '';

    try {
        // 로그인 API 호출
        const { useAuthStore } = await import('@/stores/auth.js');
        const authStore = useAuthStore();
        const response = await authService.signIn(email.value, password.value);

        // Remember me 처리
        if (rememberMe.value) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('email', email.value);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
        }

        // JWT 토큰에서 사용자 정보 추출
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        const isAdminUser = payload.auth?.includes('ROLE_ADMIN') || false;

        const userData = {
            id: payload.id || 0,
            username: payload.name || payload.username || payload.sub || '',
            email: payload.sub,
            authorities: payload.auth?.split(',').map((role: string) => ({ authority: role.trim() })) || [],
            role: isAdminUser ? 'admin' : 'user'
        };

        // 토큰과 사용자 정보 저장
        authStore.setTokens({ ...response, user: userData });

        // 역할에 따라 리다이렉트
        if (isAdminUser) {
            router.push('/crawling-sources');
        } else {
            router.push('/dashboard');
        }

        loading.value = false;

        loading.value = false;

    } catch (error: any) {
        loading.value = false;
        errorMessage.value = error.response?.data?.message ||
            error.response?.data?.detail ||
            '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.';
        console.error('Login error:', error);
    }
};

</script>

<style scoped>
.login-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%);
}

/* 배경 씬 */
.background-scene {
    position: absolute;
    inset: 0;
    z-index: 0;
}

/* 별들 */
.stars {
    position: absolute;
    inset: 0;
}

.star {
    position: absolute;
    background: white;
    border-radius: 50%;
    animation: twinkle 3s infinite;
}

@keyframes twinkle {

    0%,
    100% {
        opacity: 0.3;
    }

    50% {
        opacity: 1;
    }
}

/* 달 */
.moon {
    position: absolute;
    top: 15%;
    right: 15%;
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #475569 0%, #64748b 100%);
    border-radius: 50%;
    box-shadow:
        0 0 40px rgba(148, 163, 184, 0.3),
        inset -20px -20px 0 rgba(15, 23, 42, 0.3);
}

.moon::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 30px;
    width: 25px;
    height: 25px;
    background: rgba(15, 23, 42, 0.4);
    border-radius: 50%;
}

.moon::after {
    content: '';
    position: absolute;
    top: 45px;
    left: 50px;
    width: 15px;
    height: 15px;
    background: rgba(15, 23, 42, 0.3);
    border-radius: 50%;
}

/* 산들 */
.mountains {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
}

.mountain {
    position: absolute;
    bottom: 0;
    background: linear-gradient(to top, #1e293b 0%, #334155 100%);
    clip-path: polygon(0 100%, 100% 100%, 50% 0);
}

.mountain-1 {
    left: -5%;
    width: 40%;
    height: 100%;
    background: linear-gradient(to top, #0f172a 0%, #1e293b 100%);
}

.mountain-2 {
    left: 25%;
    width: 50%;
    height: 80%;
    background: linear-gradient(to top, #1e293b 0%, #334155 100%);
}

.mountain-3 {
    right: -5%;
    width: 35%;
    height: 70%;
    background: linear-gradient(to top, #334155 0%, #475569 100%);
}

/* 로그인 폼 컨테이너 */
.login-form-container {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
}

.login-form {
    background: rgba(51, 65, 85, 0.85);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 3rem 2.5rem;
    width: 100%;
    max-width: 420px;
    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(148, 163, 184, 0.1);
}

.login-title {
    color: white;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    text-align: center;
    letter-spacing: -0.5px;
}

/* 입력 그룹 */
.input-group {
    position: relative;
    margin-bottom: 1.5rem;
}

.login-input {
    width: 100%;
    padding: 1rem 3rem 1rem 1rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.login-input::placeholder {
    color: rgba(148, 163, 184, 0.6);
}

.login-input:focus {
    outline: none;
    border-color: rgba(148, 163, 184, 0.5);
    background: rgba(30, 41, 59, 0.9);
    box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.1);
}

.input-icon {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: rgba(148, 163, 184, 0.6);
    pointer-events: none;
}

/* 폼 옵션 */
.form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    font-size: 0.9rem;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    cursor: pointer;
}

.checkbox {
    width: 18px;
    height: 18px;
    accent-color: #64748b;
    cursor: pointer;
}

.forgot-password {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s ease;
    cursor: pointer;
}

.forgot-password:hover {
    opacity: 0.7;
}

.error-message {
    color: #ef4444;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: center;
    padding: 0.5rem;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 8px;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* 로그인 버튼 */
.login-button {
    width: 100%;
    padding: 1rem;
    background: white;
    color: #1e293b;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1.5rem;
}

.login-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.login-button:active:not(:disabled) {
    transform: translateY(0);
}

.login-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* 반응형 */
@media (max-width: 640px) {
    .login-form {
        padding: 2rem 1.5rem;
    }

    .login-title {
        font-size: 1.75rem;
    }

    .moon {
        width: 80px;
        height: 80px;
        top: 10%;
        right: 10%;
    }
}
</style>