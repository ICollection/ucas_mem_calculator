<template>
    <el-space wrap>
        <el-dropdown split-button type="primary" @command="loadData">
            导入例题
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item command="01">例2-1</el-dropdown-item>
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
        <el-button type="primary" @click="estimate">近似计算</el-button>
    </el-space>
    <el-collapse v-model="actives">
        <el-collapse-item title="输入数据" name="01">
            <el-table :data="adjacency.rows" border @cell-mouse-enter="enterEditableCell">
                <el-table-column prop="Code" label="邻接矩阵" />
                <el-table-column v-for="code in adjacency.codes" :prop="code" :label="code">
                    <template #default="scope">
                        <el-input v-model="scope.row[code]" @change="completeEditCell(scope)"></el-input>
                    </template>
                </el-table-column>
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="可达矩阵" name="02">
            <el-radio-group v-model="reachableCode" @change="changeReachable">
                <el-radio v-for="item in reachableList" :value="item.code">{{ item.name }}</el-radio>
            </el-radio-group>
            <el-table :data="reachable.rows" border>
                <el-table-column prop="Code" label="可达矩阵" />
                <el-table-column v-for="code in reachable.codes" :prop="code" :label="code" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="弱连通域" name="03">
            <el-table :data="weeklyDomain" border>
                <el-table-column prop="s" label="元素" />
                <el-table-column prop="a" label="A(Si)" />
                <el-table-column prop="d" label="D(Si)" />
                <el-table-column prop="m" label="A(Si)&D(Si)" />
                <el-table-column prop="t" label="共同集" />
                <el-table-column prop="domain" label="连通域" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="层次划分" name="04">
            <el-table :data="levelElement" border>
                <el-table-column prop="level" label="层级" />
                <el-table-column prop="element" label="元素" />
            </el-table>
        </el-collapse-item>
        <el-collapse-item title="强连通域" name="05">
            <el-table :data="strongDomain" border>
                <el-table-column prop="s" label="元素" />
                <el-table-column prop="a" label="A(Si)" />
                <el-table-column prop="d" label="D(Si)" />
                <el-table-column prop="m" label="A(Si)&D(Si)" />
                <el-table-column prop="t" label="共同集" />
                <el-table-column prop="domain" label="连通域" />
            </el-table>
        </el-collapse-item>
    </el-collapse>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, type Reactive, type Ref } from 'vue';
import type { UploadFile, UploadFiles } from 'element-plus';
import saveAs from 'file-saver';
import TableMatrix from '@/structures/TableMatrix';
import Matrix from '@/structures/Matrix';
/**
 * 活动面板。
 */
const actives: Ref<string[]> = ref(['01']);
/**
 * 输入限制。
 */
const limitation: { minimum: number, maximum: number } = { minimum: 3, maximum: 50 };
/**
 * 邻接矩阵。
 */
const adjacency: Reactive<TableMatrix> = reactive(TableMatrix.create(['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], '0'));
/**
 * 编辑格原数据。
 */
const originals: Map<string, string> = new Map<string, string>();
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
const reachable: Ref<TableMatrix> = ref(TableMatrix.create(['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], ['S1', 'S2', 'S3'], '0'));
/**
 * 显示弱连通域。
 */
const weeklyDomain: Ref<{ s: string, a: string, d: string, m: string, t: string, domain: string }[]> = ref([]);
/**
 * 显示层级划分。
 */
const levelElement: Ref<{ level: string, element: string }[]> = ref([]);
/**
 * 显示强连通域。
 */
const strongDomain: Ref<{ s: string, a: string, d: string, m: string, t: string, domain: string }[]> = ref([]);
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
            adjacency.renewalByJson('{"width":7,"height":7,"codes":["S1","S2","S3","S4","S5","S6","S7"],"names":["S1","S2","S3","S4","S5","S6","S7"],"rows":[{"Code":"S1","Name":"S1","S1":"0","S2":"0","S3":"0","S4":"0","S5":"0","S6":"0","S7":"0"},{"Code":"S2","Name":"S2","S1":"1","S2":"0","S3":"0","S4":"0","S5":"0","S6":"0","S7":"0"},{"Code":"S3","Name":"S3","S1":"0","S2":"0","S3":"0","S4":"1","S5":"0","S6":"0","S7":"0"},{"Code":"S4","Name":"S4","S1":"0","S2":"0","S3":"0","S4":"0","S5":"1","S6":"1","S7":"0"},{"Code":"S5","Name":"S5","S1":"0","S2":"0","S3":"0","S4":"0","S5":"0","S6":"0","S7":"0"},{"Code":"S6","Name":"S6","S1":"0","S2":"0","S3":"0","S4":"1","S5":"0","S6":"0","S7":"0"},{"Code":"S7","Name":"S7","S1":"0","S2":"1","S3":"0","S4":"0","S5":"0","S6":"0","S7":"0"}]}');
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
            adjacency.renewalByJson(event.target?.result as string);
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
    const blob = new Blob([JSON.stringify(adjacency)], { type: 'txt/plain;charset-utf8' });
    saveAs(blob, '解释结构模型.json');
}
/**
 * 增加矩阵行列。
 */
function increase(): void {
    // 验证最大行列。
    if (adjacency.width >= limitation.maximum || adjacency.height >= limitation.maximum) {
        return;
    }
    // 增加新的行列。
    adjacency.increaseCol(`S${adjacency.width + 1}`, `S${adjacency.width + 1}`, '0');
    adjacency.increaseRow(`S${adjacency.height + 1}`, `S${adjacency.height + 1}`, '0');
}
/**
 * 减少矩阵行列。
 */
function decrease() {
    // 验证最小行列。
    if (adjacency.width <= limitation.minimum || adjacency.height <= limitation.minimum) {
        return;
    }
    // 减少最后行列。
    adjacency.decreaseCol();
    adjacency.decreaseRow();
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
    if (text != '0' && text != '1' && text != '') {
        scope.row[scope.column.property] = originals.get(`${scope.row.Code},${scope.column.property}`);
        return;
    }
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
    // 计算可达矩阵。
    const length: number = adjacency.height;
    const A: Matrix = adjacency.toMatrix(Number);
    const G: Matrix = A.booleanJoin(Matrix.createIdentity(length));
    const Gs: Matrix[] = [G];
    for (let i = 1; i < length - 1; i++) {
        Gs.push(Gs[i - 1].booleanMultiply(G));
    }
    let R: Matrix = Matrix.createIdentity(length);
    for (let i = 0; i < length - 1; i++) {
        R = R.booleanJoin(Gs[i]);
    }
    const SR: Matrix = R.booleanMeet(R.transpose());
    // 绑定可达矩阵。
    reachableList.value.length = 0;
    for (let i = 0; i < length - 1; i++) {
        reachableList.value.push({ code: `G${i + 1}`, name: `${i + 1}阶可达矩阵`, value: TableMatrix.fromMatrix(adjacency.codes, adjacency.names, adjacency.getRowCodes(), adjacency.getRowNames(), Gs[i]) });
    }
    reachableList.value.push({ code: 'R', name: '整体可达矩阵', value: reachable.value = TableMatrix.fromMatrix(adjacency.codes, adjacency.names, adjacency.getRowCodes(), adjacency.getRowNames(), R) });
    reachableList.value.push({ code: 'SR', name: '整体强可达矩阵', value: TableMatrix.fromMatrix(adjacency.codes, adjacency.names, adjacency.getRowCodes(), adjacency.getRowNames(), SR) });
    reachableCode.value = 'R';
    // 计算弱连通域。
    weeklyDomain.value = estimateDomain(R, adjacency.codes);
    // 计算层级划分。
    const levels: { level: string, element: string }[] = [];
    let level = 1;
    let r = R;
    const excludes: number[] = [];
    while (excludes.length < R.height) {
        let setT = estimateCommon(r, excludes);
        levels.push({ level: `L${level++}`, element: `${setT.map<string>((value: number) => { return adjacency.codes[value]; }).join(',')}` });
        excludes.push(...setT);
    }
    levelElement.value = levels;

    // 计算强连通域。
    strongDomain.value = estimateDomain(SR, adjacency.codes);
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
/**
 * 计算连通域。
 * @param reachable 可达矩阵。
 * @param codes 元素编码。
 * @returns 连通域显示。
 */
function estimateDomain(reachable: Matrix, codes: string[]): { s: string, a: string, d: string, m: string, t: string, domain: string }[] {
    const size = reachable.height;
    const setT: number[] = [];
    const setA: number[][] = [];
    const setD: number[][] = [];
    const setM: number[][] = [];
    // 计算共同集。
    for (let i = 0; i < size; i++) {
        setA.push([]);
        setD.push([]);
        setM.push([]);
        for (let j = 0; j < size; j++) {
            if (reachable.data[i][j] != 0)
                setA[i].push(j);
            if (reachable.data[j][i] != 0)
                setD[i].push(j);
            if (reachable.data[i][j] != 0 && reachable.data[j][i] != 0)
                setM[i].push(j);
        }
        if (setD[i].every(item => { return setM[i].includes(item); }) && setM[i].every(item => { return setD[i].includes(item); }))
            setT.push(i);
    }
    // 构造显示表。
    const result: { s: string, a: string, d: string, m: string, t: string, domain: string }[] = [];
    for (let i = 0; i < size; i++) {
        result.push({ s: codes[i], a: setA[i].map(item => codes[item]).join(','), d: setD[i].map(item => codes[item]).join(','), m: setM[i].map(item => codes[item]).join(','), t: setT.includes(i) ? '√' : '', domain: setT.includes(i) ? setA[i].map(item => codes[item]).join(',') : '' });
    }
    return result;
}
/**
 * 计算共同集合。
 * @param reachable 可达矩阵。
 * @returns 共同集合。
 */
function estimateCommon(reachable: Matrix, excludes: number[]): number[] {
    const size = reachable.height;
    const setT: number[] = [];
    const setA: number[][] = [];
    const setD: number[][] = [];
    const setM: number[][] = [];
    // 计算共同集。
    for (let i = 0; i < size; i++) {
        setA.push([]);
        setD.push([]);
        setM.push([]);
        if (excludes.includes(i) == true)
            continue;
        for (let j = 0; j < size; j++) {
            if (excludes.includes(j) == true)
                continue;
            if (reachable.data[i][j] != 0)
                setA[i].push(j);
            if (reachable.data[j][i] != 0)
                setD[i].push(j);
            if (reachable.data[i][j] != 0 && reachable.data[j][i] != 0)
                setM[i].push(j);
        }
        if (setD[i].every(item => { return setM[i].includes(item); }) && setM[i].every(item => { return setD[i].includes(item); }))
            setT.push(i);
    }
    return setT;
}
</script>