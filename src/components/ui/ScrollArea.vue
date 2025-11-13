<template>
    <div :class="cn('relative overflow-y-auto scrollbar-thin pr-1', props.class)" :style="styleVars">
        <slot />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<{
    class?: string
    maxHeight?: string
}>(), {
    class: '',
    maxHeight: '24rem',
})

const styleVars = computed(() => ({
    maxHeight: props.maxHeight,
}))
</script>
