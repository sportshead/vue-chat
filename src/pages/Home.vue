<script setup lang="ts">
import supabase from "../supabase.ts";
import { useAuthStore } from "../stores/auth.ts";
import { ref } from "vue";
import getPlaceholder from "../placeholders.ts";
import type { MdOutlinedTextField } from "@material/web/all";
import type { MessageRow } from "../database";
import Message from "../components/Message.vue";

const auth = useAuthStore();

const messages = ref<MessageRow[]>([]);
const messageField = ref<MdOutlinedTextField>();
const messageSending = ref(false);
const placeholder = ref(getPlaceholder());

supabase
    .channel("schema-db-changes")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
        },
        (payload) => {
            const id = (payload.old as any).id ?? (payload.new as any).id;
            const index = messages.value.findIndex((message) => message.id === id);
            switch (payload.eventType) {
                case "INSERT":
                    if (index === -1) {
                        messages.value.push(payload.new as any);
                    }
                    break;
                case "DELETE":
                    messages.value.splice(index, 1);
                    break;
                case "UPDATE":
                    messages.value[index] = payload.new as any;
                    break;
            }
        },
    )
    .subscribe();

supabase
    .from("messages")
    .select("*")
    .limit(50)
    .then(({ data, error }) => {
        if (error) {
            console.error(error);
            alert(`Error attempting to fetch messages: ${error.message}`);
        } else {
            messages.value.unshift(...data);
        }
    });

const handleSendMessage = () => {
    messageSending.value = true;
    supabase
        .from("messages")
        .insert({
            author: auth.userData!.id,
            message: messageField.value!.value,
            created_at: new Date().toISOString(),
        })
        .select()
        .then(({ error, data }) => {
            messageSending.value = false;
            if (error) {
                console.error(error);
                alert(`Error attempting to send message: ${error.message}`);
            } else {
                messages.value.push(...data);
                messageField.value?.reset();
            }
        });
    placeholder.value = getPlaceholder();
};
</script>

<template>
    <div>
        <Message v-for="message in messages" :key="message.id" :message="message" />
    </div>
    <form @submit="handleSendMessage">
        <md-outlined-text-field
            :disabled="!auth.loggedIn"
            :placeholder="auth.loggedIn ? placeholder : 'Login to send messages'"
            :readonly="messageSending"
            ref="messageField"
            @keydown.enter="handleSendMessage"
        ></md-outlined-text-field>
        <md-filled-icon-button type="submit">
            <md-icon>send</md-icon>
        </md-filled-icon-button>
    </form>
</template>

<style scoped>
form {
    text-align: left;
    position: fixed;
    bottom: 0.5rem;
    display: flex;
    width: calc(100vw - 20px);
    gap: 1em;
}

md-outlined-text-field {
    flex: auto;
}

md-filled-icon-button {
    margin: auto;
}

div {
    text-align: left;
}
</style>
