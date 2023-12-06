<script setup lang="ts">
import { useAuthStore } from "./stores/auth.ts";

const auth = useAuthStore();
</script>

<template>
    <nav>
        <h1>
            <router-link to="/">Vue Chat</router-link>
        </h1>
        <h3>
            <router-link to="/profile" v-if="auth.loggedIn">{{
                auth.username
            }}</router-link>
            <router-link to="/login" v-else>Login</router-link>
        </h3>
    </nav>
    <router-view></router-view>
</template>

<style scoped>
nav {
    padding: 0 1em;
    display: flex;
}

nav h1 {
    text-align: left;
    flex: auto;
}

nav h3 {
    margin: auto;
}
</style>
