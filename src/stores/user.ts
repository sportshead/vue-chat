import { acceptHMRUpdate, defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { ref } from "vue";
import supabase from "../supabase.ts";
import {
    FunctionsFetchError,
    FunctionsHttpError,
    FunctionsRelayError,
} from "@supabase/supabase-js";

// 15 mins
const CACHE_TTL = 15 * 60 * 1000;
export const useUserStore = defineStore("user", () => {
    const cache = useLocalStorage(
        "vue-chat-usercache",
        ref(new Map<string, [number, string]>()),
    );

    const usernamePromises: Map<string, Promise<string>> = new Map();

    const _getUsername = async (userId: string): Promise<string> => {
        const { data, error } = await supabase.functions.invoke(
            "metadata-server",
            {
                body: { user: userId },
            },
        );
        if (error) {
            if (error instanceof FunctionsHttpError) {
                const errorMessage = await error.context.json();
                console.log("Function returned an error", errorMessage);
            } else if (error instanceof FunctionsRelayError) {
                console.log("Relay error:", error.message);
            } else if (error instanceof FunctionsFetchError) {
                console.log("Fetch error:", error.message);
            } else {
                console.log("Function error:", error);
            }
        }

        cache.value.set(userId, [
            new Date().getTime() + CACHE_TTL,
            data.username,
        ]);
        return data.username;
    };

    const getUsername = async (userId: string): Promise<string> => {
        const [expires, username] = cache.value.get(userId) ?? [0, ""];
        if (new Date().getTime() < expires) {
            return username;
        }

        let p = usernamePromises.get(userId);
        if (p) {
            return p;
        }
        p = _getUsername(userId);
        usernamePromises.set(userId, p);

        const u = await p;

        usernamePromises.delete(userId);
        return u;
    };
    return { cache, getUsername };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
