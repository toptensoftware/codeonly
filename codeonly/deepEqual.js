export function deepEqual(a, b)
{
    // Same object, primitives
    if (a === b)
        return true;

    // Handled undefined and null
    if (a === undefined && b === undefined)
        return true;
    if (a === undefined || b === undefined)
        return false;
    if (a === null && b === null)
        return true;
    if (a === null || b === null)
        return false;

    // Must both be objects
    if (typeof(a) !== 'object' || typeof(b) != 'object')
        return false;
    
    // Get props of both
    let a_props = Object.getOwnPropertyNames(a);
    let b_props = Object.getOwnPropertyNames(b);

    // Must have the same number of properties
    if (a_props.length != b_props.length)
        return false;
    
    // Compare all property values
    for(let p of a_props) 
    {
        if (!Object.hasOwn(b, p))
            return false;

        if (!deepEqual(a[p], b[p]))
            return false;
    }
    
    return true
}