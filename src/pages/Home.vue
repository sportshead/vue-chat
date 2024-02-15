<script setup lang="ts">
import supabase from "../supabase.ts";
import { useAuthStore } from "../stores/auth.ts";
import { computed, ref } from "vue";
import getPlaceholder from "../placeholders.ts";
import type { MdOutlinedTextField } from "@material/web/all";
import type { MessageRow } from "../database";
import Message from "../components/Message.vue";
import { formatDate } from "@vueuse/core";

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
    .order("created_at", { ascending: false })
    .limit(50)
    .then(({ data, error }) => {
        if (error) {
            console.error(error);
            alert(`Error attempting to fetch messages: ${error.message}`);
        } else {
            messages.value.unshift(
                ...data.sort(
                    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
                ),
            );
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

                // wait for new element to be added to body
                setTimeout(
                    () =>
                        // https://stackoverflow.com/a/58109049
                        window.scrollTo({
                            left: 0,
                            top: document.body.scrollHeight,
                            behavior: "smooth",
                        }),
                    10,
                );
            }
        });
    placeholder.value = getPlaceholder();
};

interface Day {
    date: string;
    messages: MessageRow[];
}
const messageDays = computed(() => {
    const days: Day[] = [];

    for (const message of messages.value) {
        const date = formatDate(new Date(message.created_at), "YYYY-MM-DD");
        if (days.length) {
            const lastDay = days[days.length - 1];
            if (lastDay.date === date) {
                lastDay.messages.push(message);
                continue;
            }
        }

        days.push({
            date,
            messages: [message],
        });
    }

    return days;
});
</script>

<template>
    <div class="message-container">
        <template v-for="day in messageDays">
            <h4 class="date">{{ day.date }}</h4>
            <Message v-for="message in day.messages" :key="message.id" :message="message" />
        </template>
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
div.message-container {
    margin-bottom: 80px;
}

form {
    text-align: left;
    position: fixed;
    bottom: 0;
    left: 0;

    padding: 0.75rem 15px;
    display: flex;
    width: calc(100vw - 30px);
    gap: 1em;
    background-color: var(--md-sys-color-background);
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

h4.date {
    font-style: italic;
    text-align: center;
    margin: 1em;
    padding: 0 0.25em;
    background-color: var(--md-sys-color-background);
    display: inline-block;
}

h4.date::after {
    border-top: 1px solid var(--md-sys-color-outline);
    height: 1px;
    width: 100vw;
    display: block;
    position: absolute;
    left: 0;
    content: "";
    z-index: -1;
    transform: translateY(-10px);
}
</style>
