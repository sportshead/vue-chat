<script setup lang="ts">
import { ref } from "vue";
import "@material/web/button/filled-button.js";

defineProps<{ msg?: string }>();

const count = ref(0);
</script>

<template>
    <h1>{{ msg || "Hello World" }}</h1>

    <div class="card">
        <md-filled-button @click="count++"
            >count is {{ count }}</md-filled-button
        >
        <p>
            Edit
            <code>components/HelloWorld.vue</code> to test no
        </p>
    </div>

    <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
            >create-vue</a
        >, the official Vue + Vite starter
    </p>
    <p>
        Install
        <a href="https://github.com/vuejs/language-tools" target="_blank"
            >Volar</a
        >
        in your IDE for a better DX
    </p>
    <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>
