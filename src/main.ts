import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import {
    createRouter,
    createWebHashHistory,
    type RouteRecordRaw,
} from "vue-router";
import HelloWorld from "./pages/HelloWorld.vue";
import LoginPage from "./pages/LoginPage.vue";
import ProfilePage from "./pages/ProfilePage.vue";
import { createPinia } from "pinia";

const routes: Readonly<RouteRecordRaw[]> = [
    { path: "/", component: HelloWorld },
    { path: "/login", component: LoginPage },
    { path: "/profile", component: ProfilePage },
];
const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const pinia = createPinia();

createApp(App).use(router).use(pinia).mount("#app");
