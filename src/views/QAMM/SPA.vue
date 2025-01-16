<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">例题</el-dropdown-item>
                    <el-dropdown-item command="02">作业一</el-dropdown-item>
                    <el-dropdown-item command="03">作业二</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-upload :show-file-list="false" :auto-upload="false" :on-change="loadFile">
            <el-button type="primary">导入数据</el-button>
        </el-upload>
        <el-button type="primary" @click="saveFile">导出数据</el-button>
        <el-divider direction="vertical" />
        <el-text>变量数量：</el-text>
        <el-input-number v-model="_variable" :min="3" :max="10" />
        <el-divider direction="vertical" />
        <el-button type="primary" @click="estimate">开始计算</el-button>
        <el-divider direction="vertical" />
    </el-space>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, type Reactive, type Ref, type VNode } from 'vue';
import type { UploadFile, UploadFiles } from 'element-plus';
import saveAs from 'file-saver';
import Table from '@/structures/Table';
/**
 * 变量数量。
 */
const _variable: Ref<number> = ref(3);
/**
* 加载页面。
*/
onMounted(() => {
});
/**
 * 导入例题。
 * @param command 指令编码。
 */
function loadData(command: string) {
}
/**
 * 导入数据。
 */
function loadFile(uploadFile: UploadFile, uploadFiles: UploadFiles): void {
}
/**
 * 导出数据。
 */
function saveFile(): void {
}
/**
 * 近似计算。
 */
function estimate() {
}
</script>