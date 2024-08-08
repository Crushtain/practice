function stringify(value) {
    //сначала идут самые простые сравнения
    if (value === null) {
        return "null";
    }
    if (value === undefined) {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value.toString();
    }
    if (typeof   value === 'string') {
        return '"' + value + '"'; //тут можно не приводить value к string чтобы съэкономить время
    }
    if (typeof value === 'function') {
        return null;
    }
    if (typeof value === 'number') {
        if (!isFinite(value)) {
            return "null";
        }
        return value.toString();
    }
    if (Array.isArray(value)) {
        //по условию в массиве undefined возвращает null
        let result = value.map(item => stringify(item) ?? "null");
        return '[' + result.join(',') + ']';
    }
    if  (typeof value === 'object') {
        let result = [];
        for (let key in value) {
            //оказалось ненужным, но, вероятно, может понадобитсья, если захочется сделать красивый  вариант JSON с отступами
            /*if (!Object.hasOwn(value, key)) {
                return "{}"
            }*/
            let val = stringify(value[key]);
            //проверка условия для key = b
            if (val !== undefined) {
                result.push('"' + key + '":' + val);
            }
        }
        return '{' + result.join(',\r\n')  + '}';
    }
    return undefined;
}

console.log(stringify(42)); // 42
console.log(stringify('string')); // "string"
console.log(stringify(null)); // null
console.log(stringify(true)); // true
console.log(stringify(Infinity)); // null
console.log(stringify(undefined)); // undefined
console.log(stringify({ a: [1, 'hi', undefined, Symbol(), {}], b: undefined })); // {"a":[1,"hi",null,null,{}]}
