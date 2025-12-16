import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "./router/index.ts";
import "./assets/styles/theme.css";

// axios 전역 설정
axios.defaults.withCredentials = true;
// baseURL 제거 - vite proxy 사용
axios.defaults.headers.common['Content-Type'] = 'application/json';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount("#app");
