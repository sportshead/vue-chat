import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import {
    createRouter,
    createWebHashHistory,
    type RouteRecordRaw,
} from "vue-router";
import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import Profile from "./pages/Profile.vue";
import { createPinia } from "pinia";

const routes: Readonly<RouteRecordRaw[]> = [
    { path: "/", component: Home },
    { path: "/login", component: Login },
    { path: "/profile", component: Profile },
];
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
