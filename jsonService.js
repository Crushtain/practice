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
        return `"${value}"`;
    }
    if (typeof value === 'function') {
        return null;
    }
    if (value instanceof Date) {
        return `"${value.toISOString()}"`;
    }
    if (typeof value === 'number') {
        if (!isFinite(value)) {
            return "null";
        }
        return value.toString();
    }
    if (Array.isArray(value)) {    // по условию в массиве undefined возвращает null
        let result = value.map(function(item) {
            let jsonItem = stringify(item);
            if (jsonItem === null || jsonItem === undefined) {
                return "null";
            } else {
                return jsonItem;
            }
        });
        return `[${result.join(',')}]`;
    }
    if  (typeof value === 'object') {
        let result = [];
        for (let key in value) {
            //проверка есть ли undefined или единственное значение 'function' в key
            if (value[key] !== undefined && typeof value[key] !== 'function') {
                let val = stringify(value[key]);
                //проверка условия для key = b
                if (val !== undefined) {

                    result.push(`"${key}":${val}`)
                    }
                }
            }
        return `{${result.join(',')}}`
    }
    return undefined;
}
// date-check
const obj =  { date: new Date('2023-01-01T00:00:00Z') };
console.log(stringify(obj))
console.log(JSON.stringify(obj))
// other check
console.log(stringify(42)); // 42
console.log(stringify('string')); // "string"
console.log(stringify(null)); // null
console.log(stringify(true)); // true
console.log(stringify(Infinity)); // null
console.log(stringify(undefined)); // undefined
console.log(stringify({ a: [1, 'hi', undefined, Date('2023-01-01T00:00:00Z'), {}], b: undefined })); // {"a":[1,"hi",null,null,{}]}
console.log(JSON.stringify({ a: [1, 'hi', undefined, Date('2023-01-01T00:00:00Z'), {}], b: undefined }));



