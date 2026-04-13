<script setup>

const props = defineProps(['text', 'callback', 'disabled'])

</script>
<template>
    <button class="inline-block rounded-sm border px-4 py-1 text-sm font-medium bg-neutral-50 hover:shadow-lg hover:bg-neutral-200" @click="props.callback" :disabled="props.disabled">{{ props.text }}</button>
</template>