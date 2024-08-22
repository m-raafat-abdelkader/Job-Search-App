/**
 * The function is intended to filter out undefined or empty string properties from an object.
 * @param {Object} object - The object containing properties to filter.
 * @returns {Object} - A new object containing only defined and non-empty properties.
*/
export default function $Set(object){
    const fields = {};
    for (const key in object) {
    if(object[key] !== undefined && object[key] !== "" ){
            Object.assign(fields, { [key]: object[key] });
        }
    };  
    return fields;
}