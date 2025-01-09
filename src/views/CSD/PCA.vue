<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">例5-1</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        <el-upload :show-file-list="false" :auto-upload="false" :on-change="loadFile">
            <el-button type="primary">导入数据</el-button>
        </el-upload>
        <el-button type="primary" @click="saveFile">导出数据</el-button>
        <el-divider direction="vertical" />
        <el-button type="primary" @click="increaseRow">增加行</el-button>
        <el-button type="primary" @click="increaseCol">增加列</el-button>
        <el-button type="primary" @click="decreaseRow">减少行</el-button>
        <el-button type="primary" @click="decreaseCol">减少列</el-button>
        <el-divider direction="vertical" />
        <el-button type="primary" @click="estimate">近似计算</el-button>
        <el-divider direction="vertical" />
        <el-text>小数位数：</el-text>
        <el-input-number v-model="precision" :min="0" :max="16" />
    </el-space>
    <el-collapse v-model="actives">
        <el-collapse-item title="原始数据" name="01">
            <el-table :data="original.rows" border @cell-mouse-enter="enterEditableCell">
                <el-table-column prop="Code" label="原始数据" />
                <el-table-column v-for="code in original.codes" :prop="code" :label="code">
                    <template #default="scope">
                        <el-input v-model="scope.row[code]" @change="completeEditCell(scope)"></el-input>
                    </template>
                </el-table-column>
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="标准化数据" name="02">
            <el-table :data="standard.rows" border>
                <el-table-column prop="Code" label="标准化矩阵" />
                <el-table-column v-for="code in standard.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="关系数矩阵" name="03">
            <el-table :data="relation.rows" border>
                <el-table-column prop="Code" label="关系数矩阵" />
                <el-table-column v-for="code in relation.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="特征值和特征向量" name="04">
            <el-table :data="eigens" border>
                <el-table-column prop="Value" label="特征值" :formatter="decimal" min-width="72" />
                <el-table-column prop="Vector" label="特征向量" :formatter="decimal" min-width="288" />
                <el-table-column prop="Code" label="主成分" min-width="72" />
                <el-table-column prop="Rate" label="贡献率" :formatter="decimal" min-width="72" />
                <el-table-column prop="Total" label="累计贡献率" :formatter="decimal" min-width="72" />
            </el-table>
        </el-collapse-item>
    </el-collapse>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, type Reactive, type Ref, type VNode } from 'vue';
import type { UploadFile, UploadFiles } from 'element-plus';
import saveAs from 'file-saver';
import TableMatrix from '@/structures/TableMatrix';
import Matrix from '@/structures/Matrix';
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
const limitation: { minimumRow: number, maximumRow: number, minimumCol: number, maximumCol: number } = { minimumRow: 3, maximumRow: 50, minimumCol: 3, maximumCol: 10 };
/**
 * 原始矩阵。
 */
const original: Reactive<TableMatrix> = reactive(TableMatrix.create(['X1', 'X2', 'X3'], ['X1', 'X2', 'X3'], ['R1', 'R2', 'R3'], ['R1', 'R2', 'R3'], '1'));
/**
 * 编辑格原数据。
 */
const originals: Map<string, string> = new Map<string, string>();
/**
 * 标准化矩阵。
 */
const standard: Ref<TableMatrix> = ref(TableMatrix.create(['X1', 'X2', 'X3'], ['X1', 'X2', 'X3'], ['R1', 'R2', 'R3'], ['R1', 'R2', 'R3'], '1'));
/**
 * 关系数矩阵。
 */
const relation: Ref<TableMatrix> = ref(TableMatrix.create(['X1', 'X2', 'X3'], ['X1', 'X2', 'X3'], ['X1', 'X2', 'X3'], ['X1', 'X2', 'X3'], '1'));
/**
 * 特征值和特征向量。
 */
const eigens: Ref<{ Value: number, Vector: number[], Code: string, Rate: number, Total: number }[]> = ref([]);
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
            original.renewalByJson('{"width":8,"height":14,"codes":["X1","X2","X3","X4","X5","X6","X7","X8"],"names":["X1","X2","X3","X4","X5","X6","X7","X8"],"rows":[{"Code":"R1","Name":"R1","X1":"40.4","X2":"24.7","X3":"7.2","X4":"6.1","X5":"8.3","X6":"8.7","X7":"2.442","X8":"20.0"},{"Code":"R2","Name":"R2","X1":"25.0","X2":"12.7","X3":"11.2","X4":"11.0","X5":"12.9","X6":"20.2","X7":"3.542","X8":"9.1"},{"Code":"R3","Name":"R3","X1":"13.2","X2":"3.3","X3":"3.9","X4":"4.3","X5":"4.4","X6":"5.5","X7":"0.578","X8":"3.6"},{"Code":"R4","Name":"R4","X1":"22.3","X2":"6.7","X3":"5.6","X4":"3.7","X5":"6.0","X6":"7.4","X7":"0.716","X8":"7.3"},{"Code":"R5","Name":"R5","X1":"34.3","X2":"11.8","X3":"7.1","X4":"7.1","X5":"8.0","X6":"8.9","X7":"1.726","X8":"27.5"},{"Code":"R6","Name":"R6","X1":"35.6","X2":"12.5","X3":"16.4","X4":"16.7","X5":"22.8","X6":"29.3","X7":"3.017","X8":"26.6"},{"Code":"R7","Name":"R7","X1":"22.0","X2":"7.8","X3":"9.9","X4":"10.2","X5":"12.6","X6":"17.6","X7":"0.847","X8":"10.6"},{"Code":"R8","Name":"R8","X1":"48.4","X2":"13.4","X3":"10.9","X4":"9.9","X5":"10.9","X6":"13.9","X7":"1.772","X8":"17.8"},{"Code":"R9","Name":"R9","X1":"40.6","X2":"17.1","X3":"19.8","X4":"19.0","X5":"29.7","X6":"39.6","X7":"2.449","X8":"35.8"},{"Code":"R10","Name":"R10","X1":"24.8","X2":"8.0","X3":"9.8","X4":"8.9","X5":"11.9","X6":"16.2","X7":"0.789","X8":"13.7"},{"Code":"R11","Name":"R11","X1":"12.5","X2":"9.7","X3":"4.2","X4":"4.2","X5":"4.6","X6":"6.5","X7":"0.874","X8":"3.9"},{"Code":"R12","Name":"R12","X1":"1.8","X2":"0.6","X3":"0.7","X4":"0.7","X5":"0.8","X6":"1.1","X7":"0.056","X8":"1.0"},{"Code":"R13","Name":"R13","X1":"32.3","X2":"13.9","X3":"9.4","X4":"8.3","X5":"9.8","X6":"13.3","X7":"2.126","X8":"17.1"},{"Code":"R14","Name":"R14","X1":"38.5","X2":"9.1","X3":"11.3","X4":"9.5","X5":"12.23","X6":"16.4","X7":"1.327","X8":"11.6"}]}');
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
            original.renewalByJson(event.target?.result as string);
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
    const blob = new Blob([JSON.stringify(original)], { type: 'txt/plain;charset-utf8' });
    saveAs(blob, '主成分分析法.json');
}
/**
 * 增加矩阵行。
 */
function increaseRow(): void {
    // 验证最大行。
    if (original.height >= limitation.maximumRow) {
        return;
    }
    // 增加新的行。
    original.increaseRow(`R${original.height + 1}`, `R${original.height + 1}`, '1');
}
/**
 * 增加矩阵列。
 */
function increaseCol(): void {
    // 验证最大列。
    if (original.width >= limitation.maximumCol) {
        return;
    }
    // 增加新的列。
    original.increaseCol(`X${original.width + 1}`, `X${original.width + 1}`, '1');
}
/**
 * 减少矩阵行。
 */
function decreaseRow() {
    // 验证最小行。
    if (original.height <= limitation.minimumRow) {
        return;
    }
    // 减少最后行。
    original.decreaseRow();
}
/**
 * 减少矩阵列。
 */
function decreaseCol() {
    // 验证最小列。
    if (original.width <= limitation.minimumCol) {
        return;
    }
    // 减少最后列。
    original.decreaseCol();
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
    else if (Array.isArray(cellValue) == true)
        return '(' + cellValue.map((value: any) => { return typeof value == 'number' ? (value as number).toFixed(precision.value) : `${value}` }).join(',') + ')';
    return cellValue;
}
/**
 * 开始近似计算。
 */
function estimate() {
    const originalMatrix: Matrix = original.toMatrix(Number);
    // 计算标准化矩阵。
    const standardMatrix: Matrix = originalMatrix.normalizeByCol();
    standard.value = TableMatrix.fromMatrix(original.codes, original.names, original.getRowCodes(), original.getRowNames(), standardMatrix);
    // 计算每列均值。
    const xBar: number[] = [];
    for (let i = 0; i < standardMatrix.width; i++) {
        let summary: number = 0;
        for (let j = 0; j < standardMatrix.height; j++) {
            summary = summary + standardMatrix.data[j][i];
        }
        xBar.push(summary / standardMatrix.height);
    }
    // 计算标准差和。
    const deviations: number[][] = [];
    for (let i = 0; i < standardMatrix.width; i++) {
        const deviation: number[] = [];
        for (let j = 0; j < standardMatrix.width; j++) {
            let summary: number = 0;
            for (let k = 0; k < standardMatrix.height; k++) {
                summary = summary + (standardMatrix.data[k][i] - xBar[i]) * (standardMatrix.data[k][j] - xBar[j]);
            }

            deviation.push(summary);
        }
        deviations.push(deviation);
    }
    // 计算关系数矩阵。
    const relationValues: number[][] = [];
    for (let i = 0; i < standardMatrix.width; i++) {
        const relationValue: number[] = [];
        for (let j = 0; j < standardMatrix.width; j++) {
            relationValue.push(deviations[i][j] / Math.sqrt(deviations[i][i] * deviations[j][j]));
        }
        relationValues.push(relationValue);
    }
    const relationMatrix: Matrix = new Matrix(standardMatrix.width, standardMatrix.width, relationValues);
    relation.value = TableMatrix.fromMatrix(original.codes, original.names, original.codes, original.names, relationMatrix);
    // 雅可比(Jacobi)旋转法求全部特征值。
    {
        let size = relationMatrix.width;
        let target: Matrix = relationMatrix;
        let product: Matrix = Matrix.createIdentity(size);
        // 迭代每个非对角元素迭代4次。
        for (let i = 0; i < size * (size - 1) * 4; i++) {
            // 找出非对角元素绝对值最大的点。
            let maxY = 0, maxX = 1;
            let max = 0;
            for (let y = 0; y < size - 1; y++) {
                for (let x = y + 1; x < size; x++) {
                    if (Math.abs(target.data[y][x]) > max) {
                        max = Math.abs(target.data[y][x]);
                        maxY = y;
                        maxX = x;
                    }
                }
            }
            if (target.data[maxY][maxX] == 0)
                break;
            // 计算旋转角度。
            const theta = target.data[maxY][maxY] == target.data[maxX][maxX] ? (target.data[maxY][maxX] > 0 ? Math.PI / 4 : -Math.PI / 4) : Math.atan(target.data[maxY][maxX] / (target.data[maxY][maxY] - target.data[maxX][maxX])) / 2;
            // 构造旋转矩阵。
            const rotation: Matrix = Matrix.create(size, size, 0);
            for (let j = 0; j < size; j++) {
                rotation.data[j][j] = 1;
            }
            rotation.data[maxY][maxY] = Math.cos(theta);
            rotation.data[maxY][maxX] = -Math.sin(theta);
            rotation.data[maxX][maxX] = Math.cos(theta);
            rotation.data[maxX][maxY] = Math.sin(theta);
            // 计算对角矩阵。
            target = rotation.transpose().multiply(target).multiply(rotation);
            product = product.multiply(rotation);
        }
        // 显示特征值和特征向量。
        const eigenList: { Value: number, Vector: number[], Code: string, Rate: number, Total: number }[] = [];
        let summary: number = 0;
        for (let j = 0; j < size; j++) {
            const vector: number[] = [];
            for (let k = 0; k < size; k++) {
                vector.push(product.data[k][j]);
            }
            summary = summary + target.data[j][j];
            eigenList.push({ Value: target.data[j][j], Vector: vector, Code: 'Z', Rate: 0, Total: 0 });
        }
        // 排序确定主成分。
        eigenList.sort((a: { Value: number, Vector: number[], Code: string, Rate: number, Total: number }, b: { Value: number, Vector: number[], Code: string, Rate: number, Total: number }) => { return b.Value - a.Value; });
        let total = 0;
        for (let j = 0; j < size; j++) {
            eigenList[j].Code = `Z${j + 1}`;
            eigenList[j].Rate = eigenList[j].Value / summary;
            total = total + eigenList[j].Rate;
            eigenList[j].Total = total;
        }
        eigens.value = eigenList;
    }
    // 显示折叠面板。
    if (actives.value.indexOf('02') < 0) {
        actives.value.push('02')
    }
    if (actives.value.indexOf('03') < 0) {
        actives.value.push('03')
    }
    if (actives.value.indexOf('04') < 0) {
        actives.value.push('04')
    }
}
</script>