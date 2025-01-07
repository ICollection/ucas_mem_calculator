<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">选择旅游地</el-dropdown-item>
                    <el-dropdown-item command="02">方案层对景色</el-dropdown-item>
                    <el-dropdown-item command="03">方案层对费用</el-dropdown-item>
                    <el-dropdown-item command="04">简化计算</el-dropdown-item>
                    <el-dropdown-item command="05">作业题一</el-dropdown-item>
                    <el-dropdown-item command="06">作业题二</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-upload :show-file-list="false" :auto-upload="false" :on-change="loadFile">
            <el-button type="primary">导入数据</el-button>
        </el-upload>
        <el-button type="primary" @click="saveFile">导出数据</el-button>
        <el-divider direction="vertical" />
        <el-button type="primary" @click="increase">增加行列</el-button>
        <el-button type="primary" @click="decrease">减少行列</el-button>
        <el-divider direction="vertical" />
        <el-text>近似算法：</el-text>
        <el-select v-model="algorithm" style="width: 120px;">
            <el-option v-for="item in algorithmOptions" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
        <el-button type="primary" @click="estimate">近似计算</el-button>
        <el-divider direction="vertical" />
        <el-text>小数位数：</el-text>
        <el-input-number v-model="precision" :min="0" :max="16" />
    </el-space>
    <el-collapse v-model="actives">
        <el-collapse-item title="输入数据" name="01">
            <el-table :data="comparison.rows" border @cell-mouse-enter="enterEditableCell">
                <el-table-column prop="Code" label="比较矩阵" />
                <el-table-column v-for="code in comparison.codes" :prop="code" :label="code">
                    <template #default="scope">
                        <el-input v-if="scope.$index < scope.cellIndex - 1" v-model="scope.row[code]" @change="completeEditCell(scope)"></el-input>
                        <span v-else>{{ format(scope.row[code]) }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="计算结果" name="02">
            <el-table v-if="algorithm == '01'" :data="sumNormal.rows" border>
                <el-table-column prop="Code" label="归一化矩阵" />
                <el-table-column v-for="code in sumNormal.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
            <br v-if="algorithm == '01'" />
            <el-table v-if="algorithm == '01'" :data="[sumResult]" border>
                <el-table-column prop="w" label="权重向量(w)" :formatter="decimal" />
                <el-table-column prop="lambda" label="最大特征根(λ)" :formatter="decimal" />
                <el-table-column prop="ci" label="一致性指标(CI)" :formatter="decimal" />
                <el-table-column prop="ri" label="随机一致性(RI)" :formatter="decimal" />
                <el-table-column prop="cr" label="一致性比率(CR)" :formatter="decimal" />
                <el-table-column prop="consistency" label="一致性结果" />
            </el-table>
            <el-table v-if="algorithm == '02'" :data="[rootResult]" border>
                <el-table-column prop="ws" label="均值向量(w*)" :formatter="decimal" />
                <el-table-column prop="w" label="权重向量(w)" :formatter="decimal" />
                <el-table-column prop="s" label="列和向量(s)" :formatter="decimal" />
                <el-table-column prop="lambda" label="最大特征根(λ)" :formatter="decimal" />
                <el-table-column prop="ci" label="一致性指标(CI)" :formatter="decimal" />
                <el-table-column prop="ri" label="随机一致性(RI)" :formatter="decimal" />
                <el-table-column prop="cr" label="一致性比率(CR)" :formatter="decimal" />
                <el-table-column prop="consistency" label="一致性结果" />
            </el-table>
            <el-text v-if="algorithm == '03'">尚未实现幂法计算。</el-text>
        </el-collapse-item>
        <el-collapse-item title="随机一致性表" name="03">
            <el-table :data="[consistency]" border>
                <el-table-column prop="n" label="n" />
                <el-table-column v-for="code in ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16']" :prop="code" :label="code" />
            </el-table>
        </el-collapse-item>
    </el-collapse>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, type Reactive, type Ref, type VNode } from 'vue';
import { type UploadFile, type UploadFiles } from 'element-plus';
import { saveAs } from 'file-saver';
import Matrix from '@/structures/Matrix';
import TableMatrix from '@/structures/TableMatrix';
import Rational from '@/structures/Rational';
/**
 * 近似算法。
 */
const algorithm: Ref<string> = ref('01');
/**
 * 候选算法。
 */
const algorithmOptions: { code: string, name: string }[] = [{ code: '01', name: '和法' }, { code: '02', name: '根法' }, { code: '03', name: '幂法' }];
/**
 * 小数精度。
 */
const precision: Ref<number> = ref(4);
/**
 * 活动面板。
 */
const actives: Ref<string[]> = ref(['01']);
/**
 * 输入限制。
 */
const limitation: { minimum: number, maximum: number } = { minimum: 3, maximum: 16 };
/**
 * 比较矩阵。
 */
const comparison: Reactive<TableMatrix> = reactive(TableMatrix.create(['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], '1'));
/**
 * 编辑格原数据。
 */
const originals: Map<string, string> = new Map<string, string>();
/**
 * 和法归一矩阵。
 */
const sumNormal: Ref<TableMatrix> = ref(TableMatrix.create(['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], '1'));
/**
 * 和法计算结果。
 */
const sumResult: Ref<{ w: Matrix, lambda: number, ci: number, ri: number, cr: number, consistency: boolean }> = ref({ w: Matrix.create(1, 1, 0), lambda: 0, ci: 0, ri: 0, cr: 0, consistency: false });
/**
 * 根法计算结果。
 */
const rootResult: Ref<{ ws: Matrix, w: Matrix, s: Matrix, lambda: number, ci: number, ri: number, cr: number, consistency: boolean }> = ref({ ws: Matrix.create(1, 1, 0), w: Matrix.create(1, 1, 0), s: Matrix.create(1, 1, 0), lambda: 0, ci: 0, ri: 0, cr: 0, consistency: false });
/**
 * 萨蒂RI值。
 */
const consistency = { n: 'RI', 3: 0.52, 4: 0.89, 5: 1.12, 6: 1.26, 7: 1.36, 8: 1.41, 9: 1.46, 10: 1.49, 11: 1.52, 12: 1.54, 13: 1.56, 14: 1.58, 15: 1.59, 16: 1.5943 };
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
    switch (command) {
        case '01':
            comparison.renewalByJson('{"width":5,"height":5,"codes":["S1","S2","S3","S4","S5"],"names":["S1","S2","S3","S4","S5"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"1/2","S3":"4","S4":"3","S5":"3"},{"Code":"S2","Name":"S2","S1":"2","S2":"1","S3":"7","S4":"5","S5":"5"},{"Code":"S3","Name":"S3","S1":"1/4","S2":"1/7","S3":"1","S4":"1/2","S5":"1/3"},{"Code":"S4","Name":"S4","S1":"1/3","S2":"1/5","S3":"2","S4":"1","S5":"1"},{"Code":"S5","Name":"S5","S1":"1/3","S2":"1/5","S3":"3","S4":"1","S5":"1"}]}');
            break;
        case '02':
            comparison.renewalByJson('{"width":3,"height":3,"codes":["S1","S2","S3"],"names":["S1","S2","S3"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"2","S3":"5"},{"Code":"S2","Name":"S2","S1":"1/2","S2":"1","S3":"2"},{"Code":"S3","Name":"S3","S1":"1/5","S2":"1/2","S3":"1"}]}');
            break;
        case '03':
            comparison.renewalByJson('{"width":3,"height":3,"codes":["S1","S2","S3"],"names":["S1","S2","S3"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"1/3","S3":"1/8"},{"Code":"S2","Name":"S2","S1":"3","S2":"1","S3":"1/3"},{"Code":"S3","Name":"S3","S1":"8","S2":"3","S3":"1"}]}');
            break;
        case '04':
            comparison.renewalByJson('{"width":3,"height":3,"codes":["S1","S2","S3"],"names":["S1","S2","S3"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"2","S3":"6"},{"Code":"S2","Name":"S2","S1":"1/2","S2":"1","S3":"4"},{"Code":"S3","Name":"S3","S1":"1/6","S2":"1/4","S3":"1"}]}');
            break;
        case '05':
            comparison.renewalByJson('{"width":3,"height":3,"codes":["S1","S2","S3"],"names":["S1","S2","S3"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"2","S3":"5"},{"Code":"S2","Name":"S2","S1":"1/2","S2":"1","S3":"2"},{"Code":"S3","Name":"S3","S1":"1/5","S2":"1/2","S3":"1"}]}');
            break;
        case '06':
            comparison.renewalByJson('{"width":5,"height":5,"codes":["S1","S2","S3","S4","S5"],"names":["S1","S2","S3","S4","S5"],"rows":[{"Code":"S1","Name":"S1","S1":"1","S2":"3","S3":"4","S4":"5","S5":"1"},{"Code":"S2","Name":"S2","S1":"1/3","S2":"1","S3":"2","S4":"4","S5":"1/4"},{"Code":"S3","Name":"S3","S1":"1/4","S2":"1/2","S3":"1","S4":"3","S5":"1/7"},{"Code":"S4","Name":"S4","S1":"1/5","S2":"1/4","S3":"1/3","S4":"1","S5":"1/5"},{"Code":"S5","Name":"S5","S1":"1","S2":"4","S3":"7","S4":"5","S5":"1"}]}');
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
            comparison.renewalByJson(event.target?.result as string);
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
    const blob = new Blob([JSON.stringify(comparison)], { type: 'txt/plain;charset-utf8' });
    saveAs(blob, '层次分析法.json');
}
/**
 * 增加矩阵行列。
 */
function increase(): void {
    // 验证最大行列。
    if (comparison.width >= limitation.maximum || comparison.height >= limitation.maximum) {
        return;
    }
    // 增加新的行列。
    comparison.increaseCol(`S${comparison.width + 1}`, `S${comparison.width + 1}`, '1');
    comparison.increaseRow(`S${comparison.height + 1}`, `S${comparison.height + 1}`, '1');
}
/**
 * 减少矩阵行列。
 */
function decrease() {
    // 验证最小行列。
    if (comparison.width <= limitation.minimum || comparison.height <= limitation.minimum) {
        return;
    }
    // 减少最后行列。
    comparison.decreaseCol();
    comparison.decreaseRow();
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
    if (Rational.validate(text) == false) {
        scope.row[scope.column.property] = originals.get(`${scope.row.Code},${scope.column.property}`);
        return;
    }
    // 自动计算倒数。
    comparison.setValue(scope.cellIndex - 1, scope.$index, Rational.reciprocal(text));
}
/**
 * 格式化矩阵元素。
 * @param text 矩阵元素。
 */
function format(text: string | number): string {
    if (typeof (text) == 'string') {
        // 分数直接返回。
        if (text.indexOf('/') >= 0)
            return text;
        // 小数选短的返回。
        const a = `${Number(text)}`;
        const b = Number(text).toFixed(precision.value);
        return a.length > b.length ? b : a;
    }
    else {
        const a = `${text}`;
        const b = text.toFixed(precision.value);
        return a.length > b.length ? b : a;
    }
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
    else if (typeof cellValue == 'string')
        return Number.parseFloat(cellValue as string).toFixed(precision.value);
    else if (cellValue instanceof Matrix && cellValue.width == 1)
        return `(${cellValue.data.map(value => { return value[0].toFixed(precision.value); }).join(',')})T`;
    else if (cellValue instanceof Matrix && cellValue.height == 1)
        return `(${cellValue.data[0].map(value => { return value.toFixed(precision.value); }).join(',')})`;
    return cellValue;
}
/**
 * 近似计算。
 */
function estimate() {
    // 层次分析计算。
    const A: Matrix = comparison.toMatrix(Rational.numerical);
    if (algorithm.value == '01') {
        // 采用和法计算。
        const normal: Matrix = A.normalizeByCol();

        const w: Matrix = normal.averageByRow();
        const Aw: Matrix = A.multiply(w);
        let lambda = 0;
        for (let i = 0; i < w.height; i++) {
            lambda = lambda + Aw.data[i][0] / w.data[i][0] / w.height;
        }
        const ci = (lambda - A.height) / (A.height - 1);
        const ri = (consistency as any)[A.height.toString()];
        const cr = ci / ri;
        // 和法展示结果。
        sumNormal.value = TableMatrix.fromMatrix(comparison.codes, comparison.names, comparison.getRowCodes(), comparison.getRowNames(), normal);
        sumResult.value = { w: w, lambda: lambda, ci: ci, ri: ri, cr: cr, consistency: cr < 0.1 };
    }
    else if (algorithm.value == '02') {
        // 采用根法计算。
        const ws: Matrix = A.geomeanByRow();
        const w: Matrix = ws.normalizeByCol();
        const s: Matrix = A.summaryByCol();
        let lambda = s.multiply(w).data[0][0];
        const ci = (lambda - A.height) / (A.height - 1);
        const ri = (consistency as any)[A.height.toString()];
        const cr = ci / ri;
        // 根法展示结果。
        rootResult.value = { ws: ws, w: w, s: s, lambda: lambda, ci: ci, ri: ri, cr: cr, consistency: cr < 0.1 };
    }
    // 显示折叠面板。
    if (actives.value.indexOf('02') < 0) {
        actives.value.push('02')
    }
    if (actives.value.indexOf('03') < 0) {
        actives.value.push('03')
    }
}
</script>