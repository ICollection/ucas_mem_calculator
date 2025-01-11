<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">三人经商</el-dropdown-item>
                    <el-dropdown-item command="02">污水处理</el-dropdown-item>
                    <el-dropdown-item command="03">四人经商</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-upload :show-file-list="false" :auto-upload="false" :on-change="loadFile">
            <el-button type="primary">导入数据</el-button>
        </el-upload>
        <el-button type="primary" @click="saveFile">导出数据</el-button>
        <el-divider direction="vertical" />
        <el-text>合作人数：</el-text>
        <el-input-number v-model="amount" :min="2" :max="9" @change="changeAmount" />
        <el-divider direction="vertical" />
        <el-button type="primary" @click="calculate">Shapley</el-button>
        <el-divider direction="vertical" />
        <el-text>小数位数：</el-text>
        <el-input-number v-model="precision" :min="0" :max="16" />
    </el-space>
    <el-collapse v-model="actives">
        <el-collapse-item title="合作收益" name="01">
            <el-table :data="benefit.rows" border @cell-mouse-enter="enterEditableCell">
                <el-table-column prop="Code" label="合作者" :formatter="special" />
                <el-table-column prop="Value" label="收益值">
                    <template #default="scope">
                        <el-input v-model="scope.row['Value']" @change="completeEditCell(scope)"></el-input>
                    </template>
                </el-table-column>
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="收益分配" name="02">
            <el-table :data="allocate.rows" border>
                <el-table-column prop="Measure" label="v(s)-v(s\i)" />
                <el-table-column prop="Weight" label="w(|s|)" />
                <el-table-column prop="Expression" label="表达式" />
                <el-table-column prop="Value" label="收益值" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
    </el-collapse>
</template>
<script lang="ts" setup>
import { onMounted, ref, type Ref, type VNode } from 'vue';
import type { UploadFile, UploadFiles } from 'element-plus';
import saveAs from 'file-saver';
import Table from '@/structures/Table';
/**
 * 合作人数。
 */
const amount: Ref<number> = ref(3);
/**
 * 小数精度。
 */
const precision: Ref<number> = ref(4);
/**
 * 活动面板。
 */
const actives: Ref<string[]> = ref(['01']);
/**
 * 收益数据。
 */
const benefit: Ref<Table> = ref(Table.create(['Code', 'Value'], ['Code', 'Value'], 0));
/**
 * 编辑格原数据。
 */
const originals: Map<string, string> = new Map<string, string>();
/**
 * 分配数据。
 */
const allocate: Ref<Table> = ref(Table.create(['Measure', 'Weight', 'Expression', 'Value'], ['Measure', 'Weight', 'Expression', 'Value'], 0));
/**
 * 加载页面。
 */
onMounted(() => {
    benefit.value.increaseRow({ Code: ['X1', 'X2', 'X3'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X1', 'X2'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X1', 'X3'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X2', 'X3'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X1'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X2'], Value: 0 });
    benefit.value.increaseRow({ Code: ['X3'], Value: 0 });
});
/**
 * 导入例题。
 * @param command 指令编码。
 */
function loadData(command: string) {
    switch (command) {
        case '01':
            amount.value = 3;
            benefit.value.renewalByJson('{"width":2,"height":7,"codes":["Code","Value"],"names":["Code","Value"],"rows":[{"Code":["X1","X2","X3"],"Value":"11"},{"Code":["X1","X2"],"Value":"7"},{"Code":["X1","X3"],"Value":"5"},{"Code":["X2","X3"],"Value":"4"},{"Code":["X1"],"Value":"1"},{"Code":["X2"],"Value":"1"},{"Code":["X3"],"Value":"1"}]}');
            break;
        case '02':
            amount.value = 3;
            benefit.value.renewalByJson('{"width":2,"height":7,"codes":["Code","Value"],"names":["Code","Value"],"rows":[{"Code":["X1","X2","X3"],"Value":"556"},{"Code":["X1","X2"],"Value":"350"},{"Code":["X1","X3"],"Value":"460"},{"Code":["X2","X3"],"Value":"365"},{"Code":["X1"],"Value":"230"},{"Code":["X2"],"Value":"160"},{"Code":["X3"],"Value":"230"}]}');
            break;
        case '03':
            amount.value = 4;
            benefit.value.renewalByJson('{"width":2,"height":15,"codes":["Code","Value"],"names":["Code","Value"],"rows":[{"Code":["X1","X2","X3","X4"],"Value":"1000"},{"Code":["X1","X2","X3"],"Value":"500"},{"Code":["X1","X2","X4"],"Value":"560"},{"Code":["X1","X3","X4"],"Value":"600"},{"Code":["X2","X3","X4"],"Value":"520"},{"Code":["X1","X2"],"Value":"260"},{"Code":["X1","X3"],"Value":"240"},{"Code":["X1","X4"],"Value":"200"},{"Code":["X2","X3"],"Value":"220"},{"Code":["X2","X4"],"Value":"210"},{"Code":["X3","X4"],"Value":"240"},{"Code":["X1"],"Value":"50"},{"Code":["X2"],"Value":"60"},{"Code":["X3"],"Value":"50"},{"Code":["X4"],"Value":"60"}]}');
            break;
    }
}
/**
 * 导入数据。
 */
function loadFile(uploadFile: UploadFile, uploadFiles: UploadFiles): void {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
            const result: { amount: number, benefit: Table } = JSON.parse(event.target?.result as string) as { amount: number, benefit: Table };
            amount.value = result.amount;
            benefit.value = result.benefit;
        }
        catch (exception) {
            ElMessage.error(`导入文件失败，详细错误信息：${exception}`);
        }
    };
    reader.readAsText(uploadFile.raw as Blob);
}
/**
 * 导出数据。
 */
function saveFile(): void {
    const blob = new Blob([JSON.stringify({ amount: amount.value, benefit: benefit.value })], { type: 'txt/plain;charset-utf8' });
    saveAs(blob, '效益分配问题.json');
}
/**
 * 更改合作人数。
 * @param newValue 新的人数。
 * @param oldValue 旧的人数。
 */
function changeAmount(newValue: number | undefined, oldValue: number | undefined): void {
    if (newValue == undefined)
        return;
    const options: string[] = [];
    for (let i = 0; i < amount.value; i++) {
        options.push(`X${i + 1}`);
    }
    const benefitValue: Table = Table.create(['Code', 'Value'], ['Code', 'Value'], 1, { Code: [...options], Value: 0 });
    for (let i = amount.value - 1; i > 0; i--) {
        for (const combination of getCombination(options, i)) {
            benefitValue.increaseRow({ Code: combination, Value: 0 });
        }
    }
    benefit.value = benefitValue;
}
/**
 * 进入编辑单元格。
 * @param row 当前行。
 * @param column 当前列。
 * @param cell 当前单元格。
 * @param event 进入事件。
 */
function enterEditableCell(row: any, column: any, cell: HTMLTableCellElement, event: Event) {
    originals.set(`${row.Code},${column.property}`, row[column.property]);
}
/**
 * 完成编辑单元格。
 * @param row 当前行。
 * @param column 当前列。
 */
function completeEditCell(scope: any) {
    // 验证输入格式。
    const text = scope.row[scope.column.property];
    if (Number.isFinite(+text) == false) {
        scope.row[scope.column.property] = originals.get(`${scope.row.Code},${scope.column.property}`);
        return;
    }
}
/**
 * 特殊格式化器。
 * @param row 当前行。
 * @param column 当前列。
 * @param cellValue 当前格。
 * @param index 列索引。
 * @returns 格式化值。
 */
function special(row: any, column: any, cellValue: any, index: number): VNode | string {
    if (Array.isArray(cellValue) == true)
        return cellValue.join(',');
    return cellValue;
}
/**
 * 小数格式化器。
 * @param row 当前行。
 * @param column 当前列。
 * @param cellValue 当前格。
 * @param index 列索引。
 * @returns 格式化值。
 */
function decimal(row: any, column: any, cellValue: any, index: number): VNode | string {
    if (typeof cellValue == 'number')
        return (cellValue as number).toFixed(precision.value);
    return cellValue;
}
/**
 * 开始计算。
 */
function calculate(): void {
    const options: string[] = [];
    for (let i = 0; i < amount.value; i++) {
        options.push(`X${i + 1}`);
    }
    const allocateValue: Table = Table.create(['Measure', 'Weight', 'Expression', 'Value'], ['Measure', 'Weight', 'Expression', 'Value'], 0);
    for (const option of options) {
        let summary = 0;
        for (const row of benefit.value.rows.filter((value: Object) => { return ((value as any).Code as string[]).includes(option); })) {
            const target = benefit.value.rows.find((value: Object) => { return ((value as any).Code as string[]).length + 1 == ((row as any).Code as string[]).length && ((row as any).Code as string[]).every((code: string) => { return code == option || ((value as any).Code as string[]).includes(code); }); });
            const weight: number = amount.value * getCombinationNumber(amount.value - 1, ((row as any).Code as string[]).length - 1);
            if (target == null) {
                const measure: string = `v(${((row as any).Code as string[]).join(',')})-v(∅)`;
                const expression: string = `(${(row as any).Value}-${0})/${weight}`;
                const value: number = Number((row as any).Value) / weight;
                summary = summary + value;
                allocateValue.increaseRow({ Measure: measure, Weight: `1/${weight}`, Expression: expression, Value: value });
            }
            else {
                const measure: string = `v(${((row as any).Code as string[]).join(',')})-v(${((target as any).Code as string[]).join(',')})`;
                const expression: string = `(${(row as any).Value}-${(target as any).Value})/${weight}`;
                const value: number = (Number((row as any).Value) - Number((target as any).Value)) / weight;
                summary = summary + value;
                allocateValue.increaseRow({ Measure: measure, Weight: `1/${weight}`, Expression: expression, Value: value });
            }
        }
        allocateValue.increaseRow({ Measure: option, Weight: '', Expression: '', Value: summary });
    }
    allocate.value = allocateValue;
    // 显示折叠面板。
    if (actives.value.indexOf('02') < 0) {
        actives.value.push('02')
    }
}
/**
 * 获取元素组合。
 * @param options 候选元素。
 * @param count 选择数量。
 * @returns 元素组合。
 */
function getCombination(options: string[], count: number): string[][] {
    const result: string[][] = [];
    // 如果候选数量和选择数量相等。
    if (options.length == count) {
        result.push([...options]);
        return result;
    }
    // 如果只选择一个。
    if (count == 1) {
        for (const option of options) {
            result.push([option]);
        }
        return result;
    }
    // 选择第一个元素，从剩余元素中选count-1个。
    {
        for (const part of getCombination(options.slice(1), count - 1)) {
            result.push([options[0], ...part]);
        }
    }
    // 不选择第一个元素，从剩余元素中选count个。
    {
        for (const part of getCombination(options.slice(1), count)) {
            result.push([...part]);
        }
    }
    return result;
}
function getCombinationNumber(total: number, count: number): number {
    if (count == 0)
        return 1;
    else
        return factorial(total) / factorial(total - count) / factorial(count);
}
function factorial(total: number): number {
    if (total <= 1)
        return 1;
    else
        return total * factorial(total - 1);
}
</script>