<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
<template>
  <el-container style="height: 100vh; width: 100vw;">
    <el-header>
      <el-menu mode="horizontal" router default-active="/QAMM/BAP">
        <el-sub-menu index="1">
          <template #title>定量分析</template>
          <el-menu-item index="/QAMM/BAP">效益分配问题</el-menu-item>
          <el-menu-item index="/QAMM/AHP">层次分析法</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="2">
          <template #title>复杂系统决策</template>
          <el-menu-item index="/CSD/ISM">解释结构模型</el-menu-item>
          <el-menu-item index="/CSD/FCA">模糊聚类分析</el-menu-item>
          <el-menu-item index="/CSD/AHP">层次分析法</el-menu-item>
          <el-menu-item index="/CSD/PCA">主成分分析法</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="3">
          <template #title>工程经济学</template>
        </el-sub-menu>
        <el-sub-menu index="4">
          <template #title>计划与控制</template>
        </el-sub-menu>
      </el-menu>
    </el-header>
    <el-main>
      <RouterView />
    </el-main>
  </el-container>
</template>
<style>
div#app {
  padding: 0;
}

input[aria-hidden=true] {
  display: none !important;
}
</style>