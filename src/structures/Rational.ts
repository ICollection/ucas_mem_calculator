/**
 * 有理数。
 */
export default class Rational {
    /**
     * 验证数据格式正确。
     * @param text 数据文本。
     * @returns 是否正确。
     */
    static validate(text: string): boolean {
        // 验证不能空白。
        if (text.trim().length == 0)
            return false;
        // 非科学计数法。
        if (text.indexOf('e') >= 0)
            return false;
        // 按照分数验证。
        if (text.indexOf('/') >= 0) {
            // 不能有小数点。
            if (text.indexOf('.') >= 0)
                return false;
            // 必须是两部分。
            const parts: string[] = text.split('/');
            if (parts.length != 2)
                return false;
            // 都要是正整数。
            const a = Number(parts[0]);
            const b = Number(parts[1]);
            if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0 || Number.isInteger(a) == false || Number.isInteger(b) == false)
                return false;
            // (0.1,10)区间。
            if (a / b <= 0.1 || a / b >= 10)
                return false;
        }
        else {
            // (0.1,10)区间。
            const value = Number(text);
            if (isNaN(value) || value <= 0.1 || value >= 10)
                return false;
        }
        return true;
    }
    /**
     * 数据文本转为数值。
     * @param text 数据文本。
     * @returns 数据数值。
     */
    static numerical(text: string): number {
        // 验证数据格式。
        if (Rational.validate(text) == false)
            throw new Error('文本数据格式错误。');
        // 按照分数计算。
        if (text.indexOf('/') >= 0) {
            const parts: string[] = text.split('/');
            return Number(parts[0]) / Number(parts[1]);
        }
        else {
            return Number(text);
        }
    }
    /**
     * 求数据文本的倒数。
     * @param text 数据文本。
     * @returns 数据倒数。
     */
    static reciprocal(text: string): string {
        // 验证数据格式。
        if (Rational.validate(text) == false)
            throw new Error('文本数据格式错误。');
        // 按照分数计算。
        if (text.indexOf('/') >= 0) {
            const parts: string[] = text.split('/');
            const a = Number(parts[0]);
            const b = Number(parts[1]);
            if (a == 1)
                return `${b}`;
            else
                return `${b}/${a}`;
        }
        else {
            const value = Number(text);
            if (Number.isInteger(value) == true && value != 1)
                return `1/${value}`;
            else
                return `${1 / value}`;
        }
    }
}