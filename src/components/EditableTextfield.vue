<script setup lang="ts">
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/icon/icon.js";
import "@material/web/iconbutton/filled-icon-button.js";
import "@material/web/iconbutton/filled-tonal-icon-button.js";
import { ref } from "vue";
import type {
    MdFilledIconButton,
    MdOutlinedTextField,
} from "@material/web/all";

const emit = defineEmits<{
    (e: "submit", value: string): void;
}>();

const props = defineProps<{
    initial: string;
    label: string;
    icon?: string;
    inputStyle?: string;
}>();

const textField = ref<MdOutlinedTextField>();
const value = ref(props.initial);
const readonly = ref<boolean>(true);

const handleClick = () => {
    readonly.value = !readonly.value;
    if (readonly.value) {
        handleSubmit();
    }
};

const handleSubmit = () => {
    value.value = textField.value!.value;
    emit("submit", value.value);
};

const handleChange = () => {
    value.value = textField.value!.value;
    textField.value!.reportValidity();
};

const handleCancel = () => {
    readonly.value = true;
    value.value = props.initial;
};
</script>

<template>
    <form @submit.prevent="handleSubmit">
        <md-outlined-text-field
            :style="inputStyle"
            :label="label"
            :value="value"
            :readonly="readonly"
            v-bind="$attrs"
            ref="textField"
            @change="handleChange"
            @keydown.enter="handleSubmit"
        >
            <md-icon slot="leading-icon" v-if="icon">{{ icon }}}</md-icon>
        </md-outlined-text-field>
        <md-filled-icon-button
            toggle
            :selected="!readonly"
            @click="handleClick"
            type="button"
        >
            <md-icon>edit</md-icon>
            <md-icon slot="selected">check</md-icon>
        </md-filled-icon-button>
        <md-filled-tonal-icon-button
            v-if="!readonly"
            @click="handleCancel"
            type="button"
        >
            <md-icon>close</md-icon>
        </md-filled-tonal-icon-button>
        <input type="submit" style="display: none" />
    </form>
</template>

<style scoped>
form {
    text-align: left;
    display: inline-flex;
    gap: 1em;
    position: relative;
}

md-filled-icon-button {
    --_unselected-container-color: #36343a;
    position: relative;
    top: 8px;
}

md-filled-tonal-icon-button {
    position: absolute;
    top: 8px;
    right: calc(
        (var(--md-filled-icon-button-container-width, 40px) + 1em) * -1
    );
}
</style>
