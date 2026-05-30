<script setup>

const model = defineModel()

const props = defineProps(['id', 'step', 'min', 'max'])

</script>
<template>
<div class="flex items-center gap-1">
    <input :id="props.id" type="number" :min="props.min" :max="props.max" :step="props.step" v-model="model" class="h-8 w-24 rounded-sm border-gray-200 sm:text-sm">
</div>
</template>