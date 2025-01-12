<template>
</template>
<script lang="ts" setup>
import router from '@/router';
import { onMounted } from 'vue';

/**
 * 加载页面。
 */
onMounted(() => {
    router.push('/QAMM/BAP')
});
</script>