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
        <el-button type="primary" @click="estimate">近似计算</el-button>
        <el-divider direction="vertical" />
        <el-text>小数位数：</el-text>
        <el-input-number v-model="_precision" :min="0" :max="16" />
    </el-space>
    <el-collapse v-model="_actives">
        <el-collapse-item title="题目约束" name="01">
            <el-space wrap>
                <el-text size="large"><math v-html="_formula"></math></el-text>
                <el-divider direction="vertical" />
                <el-text>函数系数：</el-text>
                <el-input v-model="_problem.factors" style="width: 72px" placeholder="从高到低逗号分隔" />
                <el-divider direction="vertical" />
                <el-text>取值区间：</el-text>
                <el-input v-model="_problem.region" style="width: 72px" placeholder="自变量初始取值域" />
                <el-divider direction="vertical" />
                <el-switch v-model="_problem.largest" active-text="极大值" inactive-text="极小值" />
                <el-divider direction="vertical" />
                <el-text>目标缩至：</el-text>
                <el-input-number v-model="_problem.target" :min="1" :max="20">
                    <template #suffix>
                        <span>%</span>
                    </template>
                </el-input-number>
            </el-space>
        </el-collapse-item>
        <el-collapse-item title="计算结果(斐波那契法)" name="02">
            <el-table :data="_iterations1.rows" border>
                <el-table-column prop="Ordinal" label="迭代" align="center" />
                <el-table-column prop="LowerBound" label="下界" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="LowerPoint" label="测试点1" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperPoint" label="测试点2" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperBound" label="上界" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="LowerValue" label="函数值1" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperValue" label="函数值2" :formatter="decimal" align="right" header-align="center" />
            </el-table>
            <el-text size="large"><math v-html="_condition"></math></el-text>
        </el-collapse-item>
        <el-collapse-item title="计算结果(黄金分割法)" name="03">
            <el-table :data="_iterations2.rows" border>
                <el-table-column prop="Ordinal" label="迭代" align="center" />
                <el-table-column prop="LowerBound" label="下界" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="LowerPoint" label="测试点1" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperPoint" label="测试点2" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperBound" label="上界" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="LowerValue" label="函数值1" :formatter="decimal" align="right" header-align="center" />
                <el-table-column prop="UpperValue" label="函数值2" :formatter="decimal" align="right" header-align="center" />
            </el-table>
        </el-collapse-item>
    </el-collapse>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, watch, type Reactive, type Ref, type VNode } from 'vue';
import type { UploadFile, UploadFiles } from 'element-plus';
import saveAs from 'file-saver';
import Table from '@/structures/Table';
/**
 * 小数精度。
 */
const _precision: Ref<number> = ref(4);
/**
 * 问题描述。
 */
const _problem: Reactive<{ factors: string, region: string, largest: boolean, target: number }> = reactive({ factors: '1,2,2', region: '0,10', largest: false, target: 8 });
/**
 * 问题数学描述。
 */
const _formula: Ref<string> = ref('<mi>f</mi><mo>(</mo><mi>x</mi><mo>)=</mo><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><mn>2</mn><mi>x</mi><mo>+</mo><mn>2</mn><mtext>，</mtext><mi>x</mi><mo>∈[</mo><mn>0</mn><mo>,</mo><mn>10</mn><mo>]</mo>');
/**
 * 活动面板。
 */
const _actives: Ref<string[]> = ref(['01']);
/**
 * 斐波那契结果。
 */
const _iterations1: Ref<Table> = ref(Table.create(['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], ['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], 0));
/**
* 黄金分割结果。
*/
const _iterations2: Ref<Table> = ref(Table.create(['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], ['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], 0));
/**
 * θ 表达式。
 */
const _condition: Ref<string> = ref('');
/**
* 加载页面。
*/
onMounted(() => {
});
/**
 * 监控问题描述。
 */
watch(_problem, (newValue, oldValue) => {
    // 获取用户输入。
    const factors: number[] = [];
    for (const factor of _problem.factors.split(',')) {
        if (Number.isNaN(Number(factor))) {
            _formula.value = '<mtext>函数系数格式错误。</mtext>';
            return;
        }
        factors.push(Number(factor));
    }
    if (factors[0] == 0) {
        _formula.value = '<mtext>函数系数格式错误。</mtext>';
        return;
    }
    const largest: boolean = _problem.largest;
    const lowerLimit: number = Number(_problem.region.split(',')[0]);
    const upperLimit: number = Number(_problem.region.split(',')[1]);
    if (Number.isNaN(lowerLimit) || Number.isNaN(upperLimit) || lowerLimit >= upperLimit) {
        _formula.value = '<mtext>取值区间格式错误。</mtext>';
        return;
    }
    const target: number = _problem.target;
    // 拼写数学描述。
    const formulae: string[] = [];
    formulae.push('<mi>f</mi><mo>(</mo><mi>x</mi><mo>)=</mo>');
    for (let i = 0; i < factors.length; i++) {
        if (factors[i] > 0 && i > 0)
            formulae.push('<mo>+</mo>');
        if (factors[i] < 0)
            formulae.push('<mo>-</mo>');
        if (factors[i] != 0) {
            if (factors.length - 1 - i == 0)
                formulae.push(`<mn>${Math.abs(factors[i])}</mn>`);
            else if (factors.length - 1 - i == 1) {
                if (Math.abs(factors[i]) == 1)
                    formulae.push(`<mi>x</mi>`);
                else
                    formulae.push(`<mn>${Math.abs(factors[i])}</mn><mi>x</mi>`);
            }
            else {
                if (Math.abs(factors[i]) == 1)
                    formulae.push(`<msup><mi>x</mi><mn>${factors.length - 1 - i}</mn></msup>`);
                else
                    formulae.push(`<mn>${Math.abs(factors[i])}</mn><msup><mi>x</mi><mn>${factors.length - 1 - i}</mn></msup>`);
            }
        }
    }
    formulae.push(`<mtext>，</mtext><mi>x</mi><mo>∈[</mo><mn>${lowerLimit}</mn><mo>,</mo><mn>${upperLimit}</mn><mo>]</mo>`);
    _formula.value = formulae.join('');
});
/**
 * 导入例题。
 * @param command 指令编码。
 */
function loadData(command: string) {
    switch (command) {
        case '01': {
            const result: { factors: string, region: string, largest: boolean, target: number } = JSON.parse('{"factors":"1,-4,4","region":"0,4","largest":false,"target":8}') as { factors: string, region: string, largest: boolean, target: number };
            _problem.factors = result.factors;
            _problem.region = result.region;
            _problem.largest = result.largest;
            _problem.target = result.target;
            break;
        }
        case '02': {
            const result: { factors: string, region: string, largest: boolean, target: number } = JSON.parse('{"factors":"1,-6,2","region":"0,10","largest":false,"target":8}') as { factors: string, region: string, largest: boolean, target: number };
            _problem.factors = result.factors;
            _problem.region = result.region;
            _problem.largest = result.largest;
            _problem.target = result.target;
            break;
        }
        case '03': {
            const result: { factors: string, region: string, largest: boolean, target: number } = JSON.parse('{"factors":"1,-4,4","region":"0,4","largest":false,"target":8}') as { factors: string, region: string, largest: boolean, target: number };
            _problem.factors = result.factors;
            _problem.region = result.region;
            _problem.largest = result.largest;
            _problem.target = result.target;
            break;
        }
    }
}
/**
 * 导入数据。
 */
function loadFile(uploadFile: UploadFile, uploadFiles: UploadFiles): void {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
        try {
            const result: { factors: string, region: string, largest: boolean, target: number } = JSON.parse(event.target?.result as string) as { factors: string, region: string, largest: boolean, target: number };
            _problem.factors = result.factors;
            _problem.region = result.region;
            _problem.largest = result.largest;
            _problem.target = result.target;

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
    const blob = new Blob([JSON.stringify(_problem)], { type: 'txt/plain;charset-utf8' });
    saveAs(blob, '优选法.json');
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
        return (cellValue as number).toFixed(_precision.value);
    return cellValue;
}
/**
 * 近似计算。
 */
function estimate() {
    // 获取用户输入。
    const factors: number[] = [];
    for (const factor of _problem.factors.split(',')) {
        if (Number.isNaN(Number(factor))) {
            ElMessage.error('函数系数格式错误。');
            return;
        }
        factors.push(Number(factor));
    }
    const largest: boolean = _problem.largest;
    const lowerLimit: number = Number(_problem.region.split(',')[0]);
    const upperLimit: number = Number(_problem.region.split(',')[1]);
    if (Number.isNaN(lowerLimit) || Number.isNaN(upperLimit) || lowerLimit >= upperLimit) {
        ElMessage.error('取值区间格式错误。');
        return;
    }
    const target: number = _problem.target;
    // 斐波那契迭代。
    {
        const fibonaccis: number[] = getFibonaccis(target);
        let ordinal = 0;
        let lowerBound = lowerLimit;
        let upperBound = upperLimit;
        const iterations: Table = Table.create(['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], ['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], 0);
        for (let i = fibonaccis.length - 1; i > 1; i--) {
            ordinal = ordinal + 1;
            const theta = i > 2 ? 0 : (upperLimit - lowerLimit) * (target / 100 - 1 / fibonaccis[fibonaccis.length - 1]) / 2;
            const lowerPoint = lowerBound + (upperBound - lowerBound) * fibonaccis[i - 2] / fibonaccis[i];
            const upperPoint = lowerBound + (upperBound - lowerBound) * fibonaccis[i - 1] / fibonaccis[i] + theta;
            const lowerValue = getFunctionValue(factors, lowerPoint);
            const upperValue = getFunctionValue(factors, upperPoint);
            iterations.increaseRow({ Ordinal: ordinal, LowerBound: lowerBound, LowerPoint: lowerPoint, UpperPoint: upperPoint, UpperBound: upperBound, LowerValue: lowerValue, UpperValue: upperValue });
            if ((largest == true && upperValue >= lowerValue) || (largest == false && upperValue <= lowerValue))
                lowerBound = lowerPoint;
            else
                upperBound = upperPoint;
        }
        iterations.increaseRow({ Ordinal: 'Final', LowerBound: lowerBound, LowerPoint: null, UpperPoint: null, UpperBound: upperBound, LowerValue: null, UpperValue: null });
        _iterations1.value = iterations;
        // 显示 0 取值。
        const condition: string[] = [];
        condition.push('<mtext>其中：</mtext><mn>0</mn><mo>&lt;</mo><mi>θ</mi><mo>&lt;(</mo>');
        condition.push(`<mn>${upperLimit}</mn><mo>-</mo><mn>${lowerLimit}</mn><mo>)×(</mo><mn>${target}</mn><mo>%-</mo><mfrac><mrow><mn>1</mn></mrow><mrow><mn>${fibonaccis[fibonaccis.length - 1]}</mn></mrow></mfrac><mo>)≈</mo>`);
        condition.push(`<mn>${((upperLimit - lowerLimit) * (target / 100 - 1 / fibonaccis[fibonaccis.length - 1])).toFixed(_precision.value)}</mn>`);
        condition.push('<mtext>，选择</mtext><mi>θ</mi><mo>=</mo>');
        condition.push(`<mn>${((upperLimit - lowerLimit) * (target / 100 - 1 / fibonaccis[fibonaccis.length - 1]) / 2).toFixed(_precision.value)}</mn>`);
        _condition.value = condition.join('');
    }
    // 黄金分割迭代。
    {
        const section: number = 0.618;
        let ordinal = 0;
        let lowerBound = lowerLimit;
        let upperBound = upperLimit;
        const iterations: Table = Table.create(['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], ['Ordinal', 'LowerBound', 'LowerPoint', 'UpperPoint', 'UpperBound', 'LowerValue', 'UpperValue'], 0);
        while ((upperBound - lowerBound) / (upperLimit - lowerLimit) * 100 > target) {
            ordinal = ordinal + 1;
            const lowerPoint = lowerBound + (upperBound - lowerBound) * (1 - section);
            const upperPoint = lowerBound + (upperBound - lowerBound) * section;
            const lowerValue = getFunctionValue(factors, lowerPoint);
            const upperValue = getFunctionValue(factors, upperPoint);
            iterations.increaseRow({ Ordinal: ordinal, LowerBound: lowerBound, LowerPoint: lowerPoint, UpperPoint: upperPoint, UpperBound: upperBound, LowerValue: lowerValue, UpperValue: upperValue });
            if ((largest == true && upperValue >= lowerValue) || (largest == false && upperValue <= lowerValue))
                lowerBound = lowerPoint;
            else
                upperBound = upperPoint;
        }
        iterations.increaseRow({ Ordinal: 'Final', LowerBound: lowerBound, LowerPoint: null, UpperPoint: null, UpperBound: upperBound, LowerValue: null, UpperValue: null });
        _iterations2.value = iterations;
    }
    // 显示折叠面板。
    if (_actives.value.indexOf('02') < 0) {
        _actives.value.push('02')
    }
    if (_actives.value.indexOf('03') < 0) {
        _actives.value.push('03')
    }
}
/**
 * 获取斐波那契数列。
 * @param target 目标缩至。
 * @returns 斐波那契数列。
 */
function getFibonaccis(target: number): number[] {
    const result: number[] = [1, 1];
    let last1 = 1;
    let last2 = 1;
    let current = last1 + last2;
    result.push(current);
    while (current * target < 100) {
        last2 = last1;
        last1 = current;
        current = last1 + last2;
        result.push(current);
    }
    return result;
}
/**
 * 计算函数的值。
 * @param factors 函数系数。
 * @param variable 自变量值。
 */
function getFunctionValue(factors: number[], variable: number): number {
    let result = 0;
    for (let i = 0; i < factors.length; i++) {
        result = result + Math.pow(variable, factors.length - i - 1) * factors[i];
    }
    return result;
}
</script>