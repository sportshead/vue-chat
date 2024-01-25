import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
            template: {
                compilerOptions: {
                    isCustomElement: (tag) => !!tag.match(/^md-[\w-]+$/),
                },
            },
        }),
    ],
    define: {
        __VUE_PROD_DEVTOOLS__: true,
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                callback: resolve(__dirname, "callback.html"),
            },
        },
    },
});
