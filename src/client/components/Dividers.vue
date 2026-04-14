<script setup>
const props = defineProps(['title'])

</script>
<template>
    <span class="flex items-center">
        <span class="h-px flex-1 bg-neutral-800" />

        <span class="shrink-0 px-4 text-gray-900">{{ props.title }}</span>

        <span class="h-px flex-1 bg-neutral-800" />
    </span>
</template>