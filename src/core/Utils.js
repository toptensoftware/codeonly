export function inplace_filter_array(arr, cb)
{
    for (let i=0; i<arr.length; i++)
    {
        if (!cb(arr[i], i))
        {
            arr.splice(i, 1);
            i--;
        }
    }
}

// Convert a camelCaseName to a dashed-name
export function camel_to_dash(name)
{
    return name.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);
}

// Check if a function is a constructor
export function is_constructor(x) 
{ 
    return x instanceof Function && !!x.prototype && !!x.prototype.constructor; 
}


/*
export function separate_array(array, selector)
{
    let extracted = [];
    for (let i=0; i<array.length; i++)
    {
        if (selector(array[i]))
        {
            extracted.push(array[i]);
            array.splice(i, 1);
            i--;
        }
    }
    return extracted;
}

// Returns an array of remaining ranges after subtracting a 
// set of sub-range
export function subtract_ranges(index, count, subtract)
{
    for (let s of subtract)
    {
        if (s.index < index || s.index + s.count > index + count)
            throw new Error(`subtracted range ${s.index} + ${s.count} is not within original range ${index} + ${count}`);
    }

    // Make sure ranges to be subtracted are sorted
    subtract.sort((a,b) => a.index - b.index);

    let pos = index;
    let subtractIndex = 0;
    let ranges = [];

    while (pos < index + count && subtractIndex < subtract.length)
    {
        let sub = subtract[subtractIndex];
        if (pos < sub.index)
        {
            ranges.push({ index: pos, count: sub.index - pos});
        }

        pos = sub.index + sub.count;
        subtractIndex++;
    }

    if (pos < index + count)
    {
        ranges.push({ index: pos, count: index + count - pos });
    }

    return ranges;
}


// Given a range from index to index + count, and
// an array of values to exclude, return a new set of ranges.
// exclude array will sorted upon return
export function split_range(index, count, exclude)
{
    exclude.sort();

    let pos = index;
    let excludeIndex = 0;
    let ranges = [];
    while (pos < index + count && excludeIndex < exclude.length)
    {
        if (pos < exclude[excludeIndex])
        {
            let to = Math.min(pos + count, exclude[excludeIndex]);
            ranges.push({ index: pos, count: to - pos});
            pos = to + 1;
            excludeIndex++;
            continue;
        }
        if (pos == exclude[excludeIndex])
        {
            pos++;
            excludeIndex++;
            continue;
        }

        pos++;
    }

    if (pos < index + count)
    {
        ranges.push({ index: pos, count: index + count - pos });
    }

    return ranges;
}

*/


// Compare if two sets are equal
export function areSetsEqual(a, b) 
{
    if (a === b) return true;
    if (a.size !== b.size) return false;
    for (const value of a) if (!b.has(value)) return false;
    return true;
}

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

export function binarySearch(sortedArray, compare_items, item) 
{
    let left = 0;
    let right = sortedArray.length - 1;

    while (left <= right) 
    {
        let mid = Math.floor((left + right) / 2);
        let foundVal = sortedArray[mid];

        let compare = compare_items(foundVal, item);

        if (compare == 0) 
            return mid;
        else if (compare < 0) 
            left = mid + 1;
        else
            right = mid - 1; 
    }

    // Not found, return where (convert back to insert position with (-retv-1)
    return -1 - left; 
}

export function compareStrings(a, b)
{
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

export function compareStringsI(a, b)
{
    a = a.toLowerCase();
    b = b.toLowerCase();

    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

let rxIdentifier = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;

export function member(name)
{
    if (name.match(rxIdentifier))
        return `.${name}`;
    else
        return `[${JSON.stringify(name)}]`;
}

export function whenLoaded(target, callback)
{
    if (target.loading)
        target.addEventListener("loaded", callback, { once :true });
    else
        callback();
}