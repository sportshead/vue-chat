import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { User, UserResponse } from "@supabase/supabase-js";
import { useRouter } from "vue-router";
import supabase from "../supabase.ts";

export const useAuthStore = defineStore("auth", () => {
    const router = useRouter();

    const loggedIn = ref(false);
    const username = ref("");

    const userData = ref<User>();

    const generateUsername = (username?: string): Promise<string> =>
        Promise.resolve(
            username ||
                import("../auth/randomUsername.ts").then((pkg) =>
                    pkg.default(),
                ),
        );

    const updateUsername = (username?: string): Promise<UserResponse> =>
        generateUsername(username)
            .then((username) =>
                supabase.auth.updateUser({
                    data: {
                        username: username,
                    },
                }),
            )
            .then(
                (res) => (
                    console.log(
                        "updated username",
                        res.data?.user?.user_metadata.username,
                    ),
                    res
                ),
            );

    const updateEmail = (email?: string): Promise<UserResponse> =>
        supabase.auth.updateUser({ email });

    const logout = () => supabase.auth.signOut();

    supabase.auth.onAuthStateChange((event, session) => {
        switch (event) {
            // @ts-expect-error intentional case fallthrough
            case "SIGNED_IN":
                router.push("/profile");
            // @ts-expect-error intentional case fallthrough
            case "INITIAL_SESSION":
                loggedIn.value = true;
            // @ts-expect-error intentional case fallthrough
            case "USER_UPDATED":
                userData.value = session?.user;
                if (session?.user?.user_metadata.username) {
                    username.value = session?.user.user_metadata.username;
                } else if (session?.user) {
                    updateUsername(session?.user.email?.split("@")?.[0]);
                }
                if (userData.value) {
                    break;
                }
            case "SIGNED_OUT":
                loggedIn.value = false;
                router.push("/");
                break;
        }
    });
    window.addEventListener("storage", (e) => {
        if (e.key === "auth_callback_session" && e.newValue) {
            localStorage.removeItem(e.key);
            console.log("got storage", e, e.newValue);
            supabase.auth.setSession(JSON.parse(e.newValue));
            window.focus();
        }
    });

    return {
        loggedIn,
        username,
        userData,
        updateUsername,
        generateUsername,
        updateEmail,
        logout,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
