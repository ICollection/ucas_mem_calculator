<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">例2-2</el-dropdown-item>
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
        <el-text>聚类水平：</el-text>
        <el-input-number v-model="lambda" :precision="2" :step="0.01" :min="0" :max="1" />
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
        <el-collapse-item title="规范数据" name="02">
            <el-table :data="standard.rows" border>
                <el-table-column prop="Code" label="规范数据" />
                <el-table-column v-for="code in standard.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="邻接矩阵" name="03">
            <el-table :data="adjacency.rows" border>
                <el-table-column prop="Code" label="邻接矩阵" />
                <el-table-column v-for="code in adjacency.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="可达矩阵" name="04">
            <el-radio-group v-model="reachableCode" @change="changeReachable">
                <el-radio v-for="item in reachableList" :value="item.code">{{ item.name }}</el-radio>
            </el-radio-group>
            <el-table :data="reachable.rows" border>
                <el-table-column prop="Code" label="可达矩阵" />
                <el-table-column v-for="code in reachable.codes" :prop="code" :label="code" :formatter="decimal" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="聚类结果" name="05">
            <el-table :data="cluster.rows" border>
                <el-table-column prop="Code" label="聚类结果" />
                <el-table-column v-for="code in cluster.codes" :prop="code" :label="code" />
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
 * 聚类水平。
 */
const lambda: Ref<number> = ref(0.85);
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
const original: Reactive<TableMatrix> = reactive(TableMatrix.create(['T1', 'T2', 'T3'], ['T1', 'T2', 'T3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], '1'));
/**
 * 编辑格原数据。
 */
const originals: Map<string, string> = new Map<string, string>();
/**
 * 规范矩阵。
 */
const standard: Ref<TableMatrix> = ref(TableMatrix.create(['T1', 'T2', 'T3'], ['T1', 'T2', 'T3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], '1'));
/**
 * 邻接矩阵。
 */
const adjacency: Ref<TableMatrix> = ref(TableMatrix.create(['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], '0'));
/**
 * 可达矩阵编码。
 */
const reachableCode: Ref<string> = ref('R');
/**
 * 可达矩阵列表。
 */
const reachableList: Ref<{ code: string, name: string, value: TableMatrix }[]> = ref([]);
/**
 * 显示可达矩阵。
 */
const reachable: Ref<TableMatrix> = ref(TableMatrix.create(['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], '0'));
/**
 * 聚类结果。
 */
const cluster: Ref<TableMatrix> = ref(TableMatrix.create(['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], ['O1', 'O2', 'O3'], '0'));
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
            original.renewalByJson('{"width":3,"height":6,"codes":["T1","T2","T3"],"names":["T1","T2","T3"],"rows":[{"Code":"O1","Name":"O1","T1":"57","T2":"26","T3":"19"},{"Code":"O2","Name":"O2","T1":"87","T2":"40","T3":"54"},{"Code":"O3","Name":"O3","T1":"64","T2":"34","T3":"40"},{"Code":"O4","Name":"O4","T1":"100","T2":"50","T3":"52"},{"Code":"O5","Name":"O5","T1":"29","T2":"12","T3":"20"},{"Code":"O6","Name":"O6","T1":"40","T2":"20","T3":"25"}]}');
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
    saveAs(blob, '模糊聚类分析.json');
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
    original.increaseRow(`O${original.height + 1}`, `O${original.height + 1}`, '1');
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
    original.increaseCol(`T${original.width + 1}`, `T${original.width + 1}`, '1');
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
 * 选择可达矩阵。
 * @param value 可达矩阵编码。
 */
function changeReachable(value: string | number | boolean | undefined) {
    const matrix: TableMatrix | undefined = reachableList.value.find((item) => { return item.code == reachableCode.value; })?.value;
    if (matrix != undefined) {
        reachable.value = matrix;
    }
}
/**
 * 开始近似计算。
 */
function estimate() {
    const originalMatrix: Matrix = original.toMatrix(Number);
    // 计算规范矩阵。
    const standardMatrix: Matrix = originalMatrix.standardizeByCol();
    standard.value = TableMatrix.fromMatrix(original.codes, original.names, original.getRowCodes(), original.getRowNames(), standardMatrix);
    // 计算邻接矩阵。
    const adjacencyMatrix: Matrix = Matrix.create(standardMatrix.height, standardMatrix.height, 0);
    for (let i = 0; i < standardMatrix.height; i++) {
        for (let j = 0; j < standardMatrix.height; j++) {
            if (i == j) {
                adjacencyMatrix.data[i][j] = 0;
            }
            else {
                let summary1: number = 0, summary2: number = 0, summary3: number = 0;
                for (let k = 0; k < standardMatrix.width; k++) {
                    summary1 = summary1 + standardMatrix.data[i][k] * standardMatrix.data[j][k];
                    summary2 = summary2 + standardMatrix.data[i][k] * standardMatrix.data[i][k];
                    summary3 = summary3 + standardMatrix.data[j][k] * standardMatrix.data[j][k];
                }
                adjacencyMatrix.data[i][j] = summary1 / Math.sqrt(summary2 * summary3);
            }
        }
    }
    adjacency.value = TableMatrix.fromMatrix(original.getRowCodes(), original.getRowNames(), original.getRowCodes(), original.getRowNames(), adjacencyMatrix);
    // 绑定可达矩阵。
    const length = adjacencyMatrix.width;
    const G: Matrix = adjacencyMatrix.booleanJoin(Matrix.createIdentity(length));
    const Gs: Matrix[] = [G];
    for (let i = 1; i < length - 1; i++) {
        Gs.push(Gs[i - 1].booleanMultiply(G));
    }
    let R: Matrix = Matrix.createIdentity(length);
    for (let i = 0; i < length - 1; i++) {
        R = R.booleanJoin(Gs[i]);
    }
    reachableList.value.length = 0;
    for (let i = 0; i < length - 1; i++) {
        reachableList.value.push({ code: `G${i + 1}`, name: `${i + 1}阶可达矩阵`, value: TableMatrix.fromMatrix(adjacency.value.codes, adjacency.value.names, adjacency.value.getRowCodes(), adjacency.value.getRowNames(), Gs[i]) });
    }
    reachableList.value.push({ code: 'R', name: '整体可达矩阵', value: reachable.value = TableMatrix.fromMatrix(adjacency.value.codes, adjacency.value.names, adjacency.value.getRowCodes(), adjacency.value.getRowNames(), R) });
    reachableCode.value = 'R';
    // 计算聚类结果。
    const clusterMatrix: Matrix = Matrix.createIdentity(length);
    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            clusterMatrix.data[i][j] = R.data[i][j] >= lambda.value ? 1 : 0;
        }
    }
    cluster.value = TableMatrix.fromMatrix(adjacency.value.codes, adjacency.value.names, adjacency.value.getRowCodes(), adjacency.value.getRowNames(), clusterMatrix);
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
    if (actives.value.indexOf('05') < 0) {
        actives.value.push('05')
    }
}
</script>