<script setup lang="ts">
import "@material/web/button/filled-button.js";
import "@material/web/button/text-button.js";
import "@material/web/dialog/dialog.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/filled-tonal-icon-button.js";
import type { MessageRow } from "../database";
import { computed, ref } from "vue";
import { useUserStore } from "../stores/user.ts";
import { useAuthStore } from "../stores/auth";
import type { MdDialog } from "@material/web/all";
import supabase from "../supabase";
import { useDateFormat } from "@vueuse/core";

const props = defineProps<{
    message: MessageRow;
}>();
const userStore = useUserStore();
const authStore = useAuthStore();

const username = ref<string>("unknown user");

const prettyDate = useDateFormat(props.message.created_at, "YYYY-MM-DD HH:mm:ss");
const prettyTime = useDateFormat(props.message.created_at, "HH:mm");

userStore.getUsername(props.message.author).then((u) => {
    if (u) {
        username.value = u;
    }
});

const messageAuthor = computed(() => props.message.author === authStore.userData?.id);

const dialog = ref<MdDialog>();
const dialogId = computed(() => `dialog-${props.message.id}`);

const handleClose = () => {
    if (dialog.value?.returnValue === "delete") {
        supabase
            .from("messages")
            .delete()
            .eq("id", props.message.id)
            .then(({ error }) => {
                if (error) {
                    console.error(error);
                    alert(`Error attempting to delete message: ${error.message}`);
                }
            });
    }
};
</script>

<template>
    <div class="message-wrapper" :title="prettyDate">
        <div v-if="messageAuthor" class="message-toolbar">
            <md-filled-tonal-icon-button @click="() => dialog?.show()">
                <md-icon>delete</md-icon>
            </md-filled-tonal-icon-button>
        </div>
        <div class="message-header">
            <span class="time">{{ prettyTime }}</span>
            <span class="username">{{ username }}</span>
        </div>
        <span class="message">{{ props.message.message }}</span>
    </div>
    <md-dialog ref="dialog" @closed="handleClose">
        <div slot="headline">Delete Message</div>
        <md-icon slot="icon">delete</md-icon>
        <form :id="dialogId" slot="content" method="dialog" ref="dialogForm">
            <div>Are you sure you want to delete this message?</div>
            <div class="dialog-message-wrapper" :title="prettyDate">
                <div class="message-header">
                    <span class="time">{{ prettyTime }}</span>
                    <span class="username">{{ username }}</span>
                </div>
                <span class="message">{{ props.message.message }}</span>
            </div>
        </form>
        <div slot="actions">
            <md-text-button :form="dialogId" value="cancel">Cancel</md-text-button>
            <md-filled-button :form="dialogId" value="delete" autofocus>Delete</md-filled-button>
        </div>
    </md-dialog>
</template>

<style scoped>
div.message-wrapper:hover {
    background: var(--md-sys-color-surface-variant);
    margin-left: -8px;
    margin-right: -8px;
}

div.message-header {
    display: inline;
    user-select: none;
}

span {
    margin: 0 2px;
}

span.time {
    color: var(--md-sys-color-outline);
    font-size: 0.7em;
    vertical-align: middle;
}

span.username {
    font-weight: 500;
}

span.message {
    font-weight: 350;
}

div.message-toolbar {
    position: absolute;
    --md-filled-tonal-icon-button-container-shape: 8px;
    --md-filled-tonal-icon-button-container-width: 32px;
    --md-filled-tonal-icon-button-container-height: 32px;
    --md-filled-tonal-icon-button-icon-size: 18px;

    right: 1vw;
    display: none;

    z-index: 2;
}

div.message-wrapper:hover > div.message-toolbar {
    display: block;
}

md-dialog {
    --md-dialog-container-color: var(--md-sys-color-surface);
}

md-dialog div.dialog-message-wrapper {
    margin-top: 0.8em;
    padding: 4px;
    border: 1px solid var(--md-sys-color-outline);
    border-radius: 4px;
}
</style>
