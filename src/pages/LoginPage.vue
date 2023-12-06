<script setup lang="ts">
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/button/filled-button.js";
import "@material/web/icon/icon.js";
import "@material/web/progress/linear-progress.js";
import { type MdOutlinedTextField } from "@material/web/all";
import { ref } from "vue";
import supabase from "../supabase.ts";

const VITE_SUPABASE_EMAILS_FROM = import.meta.env.VITE_SUPABASE_EMAILS_FROM;

const sentTo = ref("");
const errorMessage = ref("");
const textField = ref<MdOutlinedTextField | null>(null);
const loading = ref(false);
const reportValidity = (e: Event) =>
    (e.target as MdOutlinedTextField).reportValidity();

const submitHandler = () => {
    const email = textField.value?.value;
    if (!email) {
        return;
    }

    loading.value = true;

    supabase.auth
        .signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/callback`,
            },
        })
        .then(({ error }) => {
            sentTo.value = email;
            loading.value = false;
            if (error) {
                console.error(error);
                errorMessage.value = error.message;
                return;
            }
        });
};
</script>

<template>
    <h1>Login to Vue Chat</h1>

    <div v-if="loading">
        <md-linear-progress indeterminate></md-linear-progress>
    </div>
    <form v-else-if="sentTo === ''" @submit="submitHandler">
        <md-outlined-text-field
            id="email"
            label="Email"
            placeholder="email@domain.com"
            type="email"
            required="required"
            inputmode="email"
            ref="textField"
            @change="reportValidity"
        >
        </md-outlined-text-field>
        <md-filled-button type="submit">
            Get magic link
            <md-icon slot="icon">mail</md-icon>
        </md-filled-button>
    </form>
    <p v-else-if="errorMessage === ''">
        A link has been sent to <code>{{ sentTo }}</code
        >. Check your inbox for mail from
        <code>{{ VITE_SUPABASE_EMAILS_FROM }}</code
        >.
    </p>
    <p v-else>An error occurred: {{ errorMessage }}</p>
</template>

<style scoped>
form {
    text-align: left;
    display: inline-flex;
}

md-outlined-text-field {
    width: 40vw;
    max-width: 350px;
}

md-filled-button {
    padding: 0 1em;
    position: relative;
    top: 8px;
}

md-linear-progress {
    width: 40vw;
    max-width: 400px;
    margin: 0 auto;
}
</style>
