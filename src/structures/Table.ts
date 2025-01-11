/**
 * 绑定表。
 */
export default class Table {
    /**
     * 最小表列数。
     */
    static readonly minimumCol: number = 1;
    /**
     * 最小表行数。
     */
    static readonly minimumRow: number = 0;
    /**
     * 最大表列数。
     */
    static readonly maximumCol: number = 99;
    /**
     * 最大表行数。
     */
    static readonly maximumRow: number = 999;
    /**
     * 表列数。
     */
    width: number;
    /**
     * 表行数。
     */
    height: number;
    /**
     * 表列码。
     */
    codes: string[];
    /**
     * 表列名。
     */
    names: string[];
    /**
     * 表数据。
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
        if (codes.length < Table.minimumCol || codes.length > Table.maximumCol || rows.length < Table.minimumRow || rows.length > Table.maximumRow)
            throw new Error('表的行列数量超出限制。');
        this.width = codes.length;
        this.height = rows.length;
        this.codes = codes;
        this.names = names;
        this.rows = rows;
    }
    /**
     * 创建绑定表。
     * @param codes 列编码。
     * @param names 列名称。
     * @param value 表行默认值。
     */
    static create(codes: string[], names: string[], height: number, value?: any): Table {
        if (codes.length != names.length)
            throw new Error('表列编码名称数量不符。');
        if (codes.length < Table.minimumCol || codes.length > Table.maximumCol || height < Table.minimumRow || height > Table.maximumRow)
            throw new Error('表的行列数量超出限制。');
        const rows: {}[] = [];
        for (let i = 0; i < height; i++) {
            const row: {} = {};
            for (let j = 0; j < codes.length; j++) {
                (row as any)[codes[j]] = value[codes[j]];
            }
            rows.push(row);
        }
        return new Table([...codes], [...names], rows);
    }
    /**
     * 通过Json重置。
     * @param json Json字符串。
     */
    renewalByJson(json: string) {
        const matrix: Table = JSON.parse(json) as Table;
        this.width = matrix.width;
        this.height = matrix.height;
        this.codes = matrix.codes;
        this.names = matrix.names;
        this.rows = matrix.rows;
    }
    /**
     * 增加行。
     * @param value 表行默认值。
     */
    increaseRow(value: any) {
        // 验证最大行数。
        if (this.height >= Table.maximumRow) {
            throw new Error('已经达到表的最大行数。');
        }
        // 增加新的一行。
        const row = {};
        for (let j = 0; j < this.width; j++) {
            (row as any)[this.codes[j]] = value[this.codes[j]];
        }
        this.rows.push(row);
        this.height = this.height + 1;
    }
    /**
     * 增加列。
     * @param code 列编码。
     * @param name 列名称。
     * @param value 元素默认值。
     */
    increaseCol(code: string, name: string, value: any) {
        // 验证最大列数。
        if (this.width >= Table.maximumCol) {
            throw new Error('已经达到表的最大列数。');
        }
        // 增加新的一列。
        this.codes.push(code);
        this.names.push(name);
        for (let i = 0; i < this.height; i++) {
            (this.rows[i] as any)[code] = value;
        }
        this.width = this.width + 1;
    }
    /**
     * 减少行。
     */
    decreaseRow() {
        // 验证最小行数。
        if (this.height <= Table.minimumRow) {
            throw new Error('已经达到表的最小行数。');
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
        if (this.width <= Table.minimumCol) {
            throw new Error('已经达到表的最小列数。');
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
    getValue(row: number, col: string | number): any {
        if (typeof col == 'string')
            return (this.rows[row] as any)[col];
        else
            return (this.rows[row] as any)[this.codes[col]];
    }
    /**
     * 设置元素数据。
     * @param row 行序号。
     * @param col 列序号。
     * @param value 数据。
     */
    setValue(row: number, col: string | number, value: any) {
        if (typeof col == 'string')
            (this.rows[row] as any)[col] = value;
        else
            (this.rows[row] as any)[this.codes[col]] = value;
    }
}