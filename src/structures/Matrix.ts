/**
 * 矩阵。
 */
export default class Matrix {
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
     * 矩阵数据。
     */
    data: number[][];
    /**
     * 初始化矩阵。
     * @param height 矩阵行数。
     * @param width 矩阵列数。
     * @param data 矩阵数据。
     */
    constructor(height: number, width: number, data: number[][]) {
        if (height < Matrix.minimum || height > Matrix.maximum || width < Matrix.minimum || width > Matrix.maximum)
            throw new Error('矩阵行列数量超过限制。');
        if (data.length != height)
            throw new Error('矩阵数据和行数不相等。');
        for (let i = 0; i < height; i++) {
            if (data[i].length != width)
                throw new Error('矩阵数据和列数不相等。');
        }
        this.width = width;
        this.height = height;
        this.data = data;
    }
    /**
     * 创建矩阵。
     * @param height 矩阵行数。
     * @param width 矩阵列数。
     * @param value 元素数值。
     * @returns 矩阵。
     */
    static create(height: number, width: number, value: number): Matrix {
        if (height < Matrix.minimum || height > Matrix.maximum || width < Matrix.minimum || width > Matrix.maximum)
            throw new Error('矩阵行列数量超过限制。');
        const data: number[][] = [];
        for (let i = 0; i < height; i++) {
            data.push(new Array(width).fill(value));
        }
        return new Matrix(height, width, data);
        // return new Matrix(height, width, new Array(height).fill([...new Array(width).fill(value)]));
    }
    /**
     * 矩阵转置。
     * @returns 转置矩阵。
     */
    transpose(): Matrix {
        const result: Matrix = Matrix.create(this.width, this.height, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result.data[j][i] = this.data[i][j];
            }
        }
        return result;
    }
    /**
     * 矩阵相加。
     * @param matrix 加矩阵。
     * @returns 和矩阵。
     */
    plus(matrix: Matrix): Matrix {
        if (this.height != matrix.height || this.width != matrix.width)
            throw new Error('两个矩阵的行列数不等。');
        const result: Matrix = Matrix.create(this.height, this.width, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result.data[i][j] = this.data[i][j] + matrix.data[i][j];
            }
        }
        return result;
    }
    /**
     * 矩阵相减。
     * @param matrix 减矩阵。
     * @returns 差矩阵。
     */
    minus(matrix: Matrix): Matrix {
        if (this.height != matrix.height || this.width != matrix.width)
            throw new Error('两个矩阵的行列数不等。');
        const result: Matrix = Matrix.create(this.height, this.width, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                result.data[i][j] = this.data[i][j] - matrix.data[i][j];
            }
        }
        return result;
    }
    /**
     * 矩阵相乘。
     * @param matrix 乘矩阵。
     * @returns 积矩阵。
     */
    multiply(matrix: Matrix): Matrix {
        if (this.width != matrix.height)
            throw new Error('阵一列与阵二行不相等。');
        const result: Matrix = Matrix.create(this.height, matrix.width, 0);
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < matrix.width; j++) {
                let summary = 0;
                for (let k = 0; k < this.width; k++) {
                    summary = summary + this.data[i][k] * matrix.data[k][j];
                }
                result.data[i][j] = summary;
            }
        }
        return result;
    }
    /**
     * 按列归一化。
     * @returns 归一化矩阵。
     */
    normalizeByCol(): Matrix {
        const result: Matrix = Matrix.create(this.height, this.width, 0);
        for (let j = 0; j < this.width; j++) {
            let summary = 0;
            for (let i = 0; i < this.height; i++) {
                summary = summary + this.data[i][j];
            }
            for (let i = 0; i < this.height; i++) {
                result.data[i][j] = this.data[i][j] / summary;
            }
        }
        return result;
    }
    /**
     * 按列归一化。
     * @returns 归一化矩阵。
     */
    normalizeByRow(): Matrix {
        const result: Matrix = Matrix.create(this.height, this.width, 0);
        for (let i = 0; i < this.height; i++) {
            let summary = 0;
            for (let j = 0; j < this.width; j++) {
                summary = summary + this.data[i][j];
            }
            for (let j = 0; j < this.width; j++) {
                result.data[i][j] = this.data[i][j] / summary;
            }
        }
        return result;
    }
    /**
     * 按列求和。
     * @returns 和行向量。
     */
    summaryByCol(): Matrix {
        const result: Matrix = Matrix.create(1, this.width, 0);
        for (let j = 0; j < this.width; j++) {
            let summary = 0;
            for (let i = 0; i < this.height; i++) {
                summary = summary + this.data[i][j];
            }
            result.data[0][j] = summary;
        }
        return result;
    }
    /**
     * 按行求和。
     * @returns 和列向量。
     */
    summaryByRow(): Matrix {
        const result: Matrix = Matrix.create(this.height, 1, 0);
        for (let i = 0; i < this.height; i++) {
            let summary = 0;
            for (let j = 0; j < this.width; j++) {
                summary = summary + this.data[i][j];
            }
            result.data[i][0] = summary;
        }
        return result;
    }
    /**
     * 按列求算数平均值。
     * @returns 平均值行向量。
     */
    averageByCol(): Matrix {
        const result: Matrix = Matrix.create(1, this.width, 0);
        for (let j = 0; j < this.width; j++) {
            let summary = 0;
            for (let i = 0; i < this.height; i++) {
                summary = summary + this.data[i][j];
            }
            result.data[0][j] = summary / this.height;
        }
        return result;
    }
    /**
     * 按行求算数平均值。
     * @returns 平均值列向量。
     */
    averageByRow(): Matrix {
        const result: Matrix = Matrix.create(this.height, 1, 0);
        for (let i = 0; i < this.height; i++) {
            let summary = 0;
            for (let j = 0; j < this.width; j++) {
                summary = summary + this.data[i][j];
            }
            result.data[i][0] = summary / this.width;
        }
        return result;
    }
    /**
     * 按列求几何平均值。
     * @returns 平均值行向量。
     */
    geomeanByCol(): Matrix {
        const result: Matrix = Matrix.create(1, this.width, 0);
        for (let j = 0; j < this.width; j++) {
            let product = 1;
            for (let i = 0; i < this.height; i++) {
                product = product * this.data[i][j];
            }
            result.data[0][j] = Math.pow(product, 1 / this.height);
        }
        return result;
    }
    /**
     * 按行求几何平均值。
     * @returns 平均值列向量。
     */
    geomeanByRow(): Matrix {
        const result: Matrix = Matrix.create(this.height, 1, 0);
        for (let i = 0; i < this.height; i++) {
            let product = 1;
            for (let j = 0; j < this.width; j++) {
                product = product * this.data[i][j];
            }
            result.data[i][0] = Math.pow(product, 1 / this.width);
        }
        return result;
    }
}