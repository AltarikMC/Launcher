<script setup>

const props = defineProps({
    'canClose': {
        default: true,
        type: Boolean
    }
})

const emit = defineEmits(['close'])

</script>
<template>
    <div style="display: 'block'" class="absolute top-7 w-full h-[calc(100%-var(--spacing)*7)] bg-neutral-900/60 z-10">
        <div @click="emit('close')"  class="absolute top-7 left-2 text-white cursor-pointer"><i class="material-icons">close</i></div>
        <slot />
    </div>
</template>
