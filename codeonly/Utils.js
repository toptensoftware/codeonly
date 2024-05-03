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
