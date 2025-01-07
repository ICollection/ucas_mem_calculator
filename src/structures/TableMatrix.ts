import Matrix from "./Matrix";
import Rational from "./Rational";
/**
 * 绑定表矩阵。
 */
export default class TableMatrix {
    /**
     * 最小行列数。
     */
    static readonly minimum: number = 1;
    /**
     * 最大行列数。
     */
    static readonly maximum: number = 99;
    /**
     * 矩阵列数。
     */
    width: number;
    /**
     * 矩阵行数。
     */
    height: number;
    /**
     * 矩阵列码。
     */
    codes: string[];
    /**
     * 矩阵列名。
     */
    names: string[];
    /**
     * 矩阵数据。
     */
    rows: Object[];
    /**
     * 初始化矩阵。
     * @param codes 列编码。
     * @param names 列名称。
     * @param rows 矩阵行。
     */
    constructor(codes: string[], names: string[], rows: Object[]) {
        if (codes.length != names.length)
            throw new Error('列编码和名称数量不符。');
        if (codes.length < TableMatrix.minimum || codes.length > TableMatrix.maximum || rows.length < TableMatrix.minimum || rows.length > TableMatrix.maximum)
            throw new Error('矩阵行列数量超出限制。');
        this.width = codes.length;
        this.height = rows.length;
        this.codes = codes;
        this.names = names;
        this.rows = rows;
    }
    /**
     * 创建绑定表矩阵。
     * @param colCodes 列编码。
     * @param colNames 列名称。
     * @param rowCodes 行编码。
     * @param rowNames 行名称。
     * @param value 元素默认值。
     */
    static create(colCodes: string[], colNames: string[], rowCodes: string[], rowNames: string[], value: string): TableMatrix {
        if (colCodes.length != colNames.length || rowCodes.length != rowNames.length)
            throw new Error('行列编码名称数量不符。');
        if (colCodes.length < TableMatrix.minimum || colCodes.length > TableMatrix.maximum || rowCodes.length < TableMatrix.minimum || rowCodes.length > TableMatrix.maximum)
            throw new Error('矩阵行列数量超出限制。');
        const rows = [];
        for (let i = 0; i < rowCodes.length; i++) {
            const row = { Code: rowCodes[i], Name: rowNames[i] };
            for (let j = 0; j < colCodes.length; j++) {
                (row as any)[colCodes[j]] = value;
            }
            rows.push(row);
        }
        return new TableMatrix([...colCodes], [...colNames], rows);
    }
    /**
     * 从矩阵转化。
     * @param colCodes 列编码。
     * @param colNames 列名称。
     * @param rowCodes 行编码。
     * @param rowNames 行名称。
     * @param matrix 矩阵。
     * @returns 绑定表矩阵。
     */
    static fromMatrix(colCodes: string[], colNames: string[], rowCodes: string[], rowNames: string[], matrix: Matrix): TableMatrix {
        if (colCodes.length != colNames.length || rowCodes.length != rowNames.length || colCodes.length != matrix.height || rowCodes.length != matrix.width)
            throw new Error('行列编码名称数量不符。');
        if (colCodes.length < TableMatrix.minimum || colCodes.length > TableMatrix.maximum || rowCodes.length < TableMatrix.minimum || rowCodes.length > TableMatrix.maximum)
            throw new Error('矩阵行列数量超出限制。');
        const result = TableMatrix.create(colCodes, colNames, rowCodes, rowNames, '0');
        for (let i = 0; i < matrix.height; i++) {
            for (let j = 0; j < matrix.width; j++) {
                result.setValue(i, j, matrix.data[i][j].toString());
            }
        }
        return result;
    }
    /**
     * 通过Json重置。
     * @param json Json字符串。
     */
    renewalByJson(json: string) {
        const matrix: TableMatrix = JSON.parse(json) as TableMatrix;
        this.width = matrix.width;
        this.height = matrix.height;
        this.codes = matrix.codes;
        this.names = matrix.names;
        this.rows = matrix.rows;
    }
    /**
     * 增加行。
     * @param rowCode 行编码。
     * @param rowName 行名称。
     * @param value 默认值。
     */
    increaseRow(rowCode: string, rowName: string, value: string) {
        // 验证最大行数。
        if (this.height >= TableMatrix.maximum) {
            throw new Error('已经达到矩阵最大行数。');
        }
        // 增加新的一行。
        const row = { Code: rowCode, Name: rowName };
        for (let j = 0; j < this.width; j++) {
            (row as any)[this.codes[j]] = value;
        }
        this.rows.push(row);
        this.height = this.height + 1;
    }
    /**
     * 增加列。
     * @param colCode 列编码。
     * @param colName 列名称。
     * @param value 默认值。
     */
    increaseCol(colCode: string, colName: string, value: string) {
        // 验证最大列数。
        if (this.width >= TableMatrix.maximum) {
            throw new Error('已经达到矩阵最大列数。');
        }
        // 增加新的一列。
        this.codes.push(colCode);
        this.names.push(colName);
        for (let i = 0; i < this.height; i++) {
            (this.rows[i] as any)[colCode] = value;
        }
        this.width = this.width + 1;
    }
    /**
     * 减少行。
     */
    decreaseRow() {
        // 验证最小行数。
        if (this.height <= TableMatrix.minimum) {
            throw new Error('已经达到矩阵最小行数。');
        }
        // 减少最后一行。
        this.rows.pop();
        this.height = this.height - 1;
    }
    /**
     * 减少列。
     */
    decreaseCol() {
        // 验证最小列数。
        if (this.width <= TableMatrix.minimum) {
            throw new Error('已经达到矩阵最小列数。');
        }
        // 减少最后一列。
        this.codes.pop();
        this.names.pop();
        this.width = this.width - 1;
    }
    /**
     * 获取元素数据。
     * @param row 行序号。
     * @param col 列序号。
     * @returns 数据。
     */
    getValue(row: number, col: number): string {
        return (this.rows[row] as any)[this.codes[col]];
    }
    /**
     * 设置元素数据。
     * @param row 行序号。
     * @param col 列序号。
     * @param value 数据。
     */
    setValue(row: number, col: number, value: string) {
        (this.rows[row] as any)[this.codes[col]] = value;
    }
    /**
     * 获取行编码。
     * @param row 行序号。
     * @returns 行编码。
     */
    getRowCode(row: number): string {
        return (this.rows[row] as any).Code;
    }
    /**
    * 获取行名称。
    * @param row 行序号。
    * @returns 行名称。
    */
    getRowName(row: number): string {
        return (this.rows[row] as any).Name;
    }
    /**
     * 获取所有行编码。
     * @returns 行编码。
     */
    getRowCodes(): string[] {
        const codes = [];
        for (let i = 0; i < this.height; i++) {
            codes.push(this.getRowCode(i));
        }
        return codes;
    }
    /**
     * 获取所有行名称。
     * @returns 行名称。
     */
    getRowNames(): string[] {
        const names = [];
        for (let i = 0; i < this.height; i++) {
            names.push(this.getRowName(i));
        }
        return names;
    }
    /**
     * 转换为矩阵。
     * @returns 矩阵。
     */
    toMatrix(convert: (text: string) => number): Matrix {
        const result: Matrix = Matrix.create(this.height, this.width, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result.data[i][j] = convert(this.getValue(i, j));
            }
        }
        return result;
    }
}