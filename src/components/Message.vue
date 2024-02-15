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
import { MdOutlinedTextField, type MdDialog } from "@material/web/all";
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

const deleteDialog = ref<MdDialog>();
const deleteDialogId = computed(() => `delete-${props.message.id}`);

const handleDelete = () => {
    if (deleteDialog.value?.returnValue === "delete") {
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

const editDialog = ref<MdDialog>();
const editDialogId = computed(() => `edit-${props.message.id}`);

const editValue = ref(props.message.message);
const editTextField = ref<MdOutlinedTextField>();

const handleEdit = () => {
    if (editDialog.value?.returnValue === "edit") {
        supabase
            .from("messages")
            .update({ message: editValue.value })
            .eq("id", props.message.id)
            .select()
            .then(({ error, data }) => {
                if (error) {
                    console.error(error);
                    alert(`Error attempting to edit message: ${error.message}`);
                } else {
                    console.log(data);
                }
            });
    } else {
        editValue.value = props.message.message;
    }
};

const handleEditChange = () => {
    editValue.value = editTextField.value!.value;
};
</script>

<template>
    <div class="message-wrapper" :title="prettyDate">
        <div v-if="messageAuthor" class="message-toolbar">
            <md-filled-tonal-icon-button @click="() => editDialog?.show()">
                <md-icon>edit</md-icon>
            </md-filled-tonal-icon-button>
            <md-filled-tonal-icon-button @click="() => deleteDialog?.show()">
                <md-icon>delete</md-icon>
            </md-filled-tonal-icon-button>
        </div>
        <div class="message-header">
            <span class="time">{{ prettyTime }}</span>
            <span class="username">{{ username }}</span>
        </div>
        <span class="message">{{ props.message.message }}</span>
    </div>
    <md-dialog ref="deleteDialog" @closed="handleDelete">
        <div slot="headline">Delete Message</div>
        <md-icon slot="icon">delete</md-icon>
        <form :id="deleteDialogId" slot="content" method="dialog">
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
            <md-text-button :form="deleteDialogId" value="cancel">Cancel</md-text-button>
            <md-filled-button :form="deleteDialogId" value="delete" autofocus
                >Delete</md-filled-button
            >
        </div>
    </md-dialog>
    <md-dialog
        ref="editDialog"
        @closed="handleEdit"
        @cancel.prevent="() => editDialog?.close('cancel')"
    >
        <div slot="headline">Edit Message</div>
        <md-icon slot="icon">edit</md-icon>
        <form :id="editDialogId" slot="content" method="dialog">
            <md-outlined-text-field
                :value="editValue"
                ref="editTextField"
                @change="handleEditChange"
                @keydown.enter="() => editDialog?.close('edit')"
            ></md-outlined-text-field>
        </form>
        <div slot="actions">
            <md-text-button :form="editDialogId" value="cancel">Cancel</md-text-button>
            <md-filled-button :form="editDialogId" value="edit" autofocus>Edit</md-filled-button>
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

div.message-toolbar > md-filled-tonal-icon-button {
    padding: 2px;
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
