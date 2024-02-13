<script setup lang="ts">
import "@material/web/button/filled-button.js";
import { useAuthStore } from "../stores/auth.ts";
import EditableTextfield from "../components/EditableTextfield.vue";
import { ref } from "vue";

const VITE_SUPABASE_EMAILS_FROM = import.meta.env.VITE_SUPABASE_EMAILS_FROM;

const auth = useAuthStore();

const usernameLoading = ref<boolean>(false);
const usernameSuccess = ref<boolean>(false);
const usernameError = ref<string>("");

const emailLoading = ref<boolean>(false);
const emailSuccess = ref<boolean>(false);
const emailError = ref<string>("");

const handleUsernameSubmit = async (username: string) => {
    console.log(username);
    usernameLoading.value = true;
    usernameSuccess.value = false;
    const { error } = await auth.updateUsername(username);
    if (error) {
        console.error(error);
        usernameError.value = `Error: ${error.message}`;
    } else {
        usernameSuccess.value = true;
    }
    usernameLoading.value = false;
};

const handleEmailSubmit = async (email: string) => {
    console.log(email);
    emailLoading.value = true;
    emailSuccess.value = false;
    const { error } = await auth.updateEmail(email);
    if (error) {
        console.error(error);
        emailError.value = `Error: ${error.message}`;
    } else {
        emailSuccess.value = true;
    }
    emailLoading.value = false;
};

const prettyDate = (date: string) =>
    new Date(date).toLocaleString(navigator.languages, {
        timeZoneName: "short",
    });
</script>

<template>
    <h1>Profile</h1>
    <div v-if="emailLoading">
        <md-linear-progress indeterminate />
    </div>
    <div v-else-if="emailSuccess">
        <p>
            Confirmation links have been sent to
            <code>{{ auth.userData!.email }}</code> and
            <code>{{ auth.userData!.new_email }}</code> at
            <code>{{ prettyDate(auth.userData!.email_change_sent_at!) }}</code
            >. Check your inbox for mail from <code>{{ VITE_SUPABASE_EMAILS_FROM }}</code
            >.
        </p>
    </div>
    <EditableTextfield
        v-else
        :initial="auth.userData!.email!"
        icon="mail"
        label="Email"
        @submit="handleEmailSubmit"
        input-style="width: 40vw; min-width: 250px"
        type="email"
        inputmode="email"
        required="required"
        :error="!!emailError"
        :error-text="emailError"
    />
    <br /><br />
    <div v-if="usernameLoading">
        <md-linear-progress indeterminate />
    </div>
    <EditableTextfield
        v-else
        :initial="auth.username"
        icon="person"
        label="Username"
        @submit="handleUsernameSubmit"
        input-style="width: 40vw; min-width: 250px"
        placeholder="Leave blank for 🎲"
        :supporting-text="usernameSuccess ? `Updated username to ${auth.username}` : ``"
        :error="!!usernameError"
        :error-text="usernameError"
    />
    <br /><br />
    <md-filled-button @click="auth.logout">
        <md-icon slot="icon">logout</md-icon>
        Logout
    </md-filled-button>
</template>

<style scoped>
div {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: calc(
        var(--md-outlined-field-top-space, 16px) + var(--md-outlined-field-bottom-space, 16px) +
            var(
                --md-outlined-field-content-line-height,
                var(--md-sys-typescale-body-large-line-height, 1.5rem)
            )
    );
}

div > p {
    width: 45vw;
}

md-linear-progress {
    width: 45vw;
    min-width: 275px;
    margin: 0 auto;
}
</style>
