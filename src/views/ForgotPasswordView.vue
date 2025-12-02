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

        <!-- 비밀번호 찾기 폼 -->
        <div class="login-form-container">
            <div class="login-form">
                <h1 class="login-title">Forgot Password</h1>
                <p class="subtitle">이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>

                <!-- 이메일 입력 -->
                <div class="input-group">
                    <input type="email" placeholder="email" v-model="email" class="login-input" required />
                    <Mail class="input-icon" />
                </div>

                <!-- 전송 버튼 -->
                <button @click="handleResetPassword" class="login-button" :disabled="!email || loading">
                    <span v-if="loading">전송 중...</span>
                    <span v-else>재설정 링크 전송</span>
                </button>

                <!-- 성공 메시지 -->
                <div v-if="emailSent" class="success-message">
                    <CheckCircle class="success-icon" />
                    <p>비밀번호 재설정 링크가 이메일로 전송되었습니다!</p>
                </div>

                <!-- 로그인 링크 -->
                <div class="register-link">
                    <a href="#" @click.prevent="goToLogin" class="register-text">← Login으로 돌아가기</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, CheckCircle } from 'lucide-vue-next';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const emailSent = ref(false);

const getStarStyle = (index) => {
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

const handleResetPassword = async () => {
    if (!email.value) return;

    loading.value = true;
    try {
        // 비밀번호 재설정 API 호출
        // const response = await authAPI.forgotPassword(email.value);
        console.log('Reset password for:', email.value);

        // 성공 시 메시지 표시
        setTimeout(() => {
            loading.value = false;
            emailSent.value = true;
        }, 1500);
    } catch (error) {
        loading.value = false;
        alert('이메일 전송에 실패했습니다. 다시 시도해주세요.');
        console.error('Reset password error:', error);
    }
};

const goToLogin = () => {
    router.push('/login');
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
    margin-bottom: 1rem;
    text-align: center;
    letter-spacing: -0.5px;
}

.subtitle {
    color: rgba(148, 163, 184, 0.8);
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 2rem;
    line-height: 1.5;
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

/* 성공 메시지 */
.success-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.success-icon {
    width: 48px;
    height: 48px;
    color: #22c55e;
}

.success-message p {
    color: #22c55e;
    text-align: center;
    font-size: 0.9rem;
    margin: 0;
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

/* 회원가입 링크 */
.register-link {
    text-align: center;
    color: white;
    font-size: 0.9rem;
}

.register-text {
    color: white;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.3s ease;
}

.register-text:hover {
    opacity: 0.8;
    text-decoration: underline;
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
