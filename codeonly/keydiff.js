let o1 = [1,2,3,4,5,6,7,8];
let n1 = [5,1,2,3,4,6,7,8];
//let o1 = [1,2,3,4,5,6,7,8];
//let n1 = [2,3,4,5,1,6,7,8];

diff(o1, n1, (op, index, count) => {
    console.log(op, index, count);
});

export function diff(oldKeys, newKeys, callback)
{
    let minLength = Math.min(oldKeys.length, newKeys.length);
    let maxLength = Math.max(oldKeys.length, newKeys.length);

    // Work out how many matching keys at the start
    let trimStart = 0;
    while (trimStart < minLength && 
        oldKeys[trimStart] == newKeys[trimStart])
    {
        trimStart++;
    }

    // Already exact match
    if (trimStart == maxLength)
        return;

    // Simple Append?
    if (trimStart == oldKeys.length)
    {
        callback('insert', oldKeys.length, newKeys.length - oldKeys.length);
        return;
    }

    // Work out how many matching keys at the end
    let trimEnd = 0;
    while (trimEnd < (minLength - trimStart) && 
        oldKeys[oldKeys.length - trimEnd - 1] == newKeys[newKeys.length - trimEnd - 1])
    {
        trimEnd++;
    }

    // Simple prepend
    if (trimEnd == oldKeys.length)
    {
        callback('insert', 0, newKeys.length - oldKeys.length);
        return;
    }

    // Simple insert?
    if (trimStart + trimEnd == oldKeys.length)
    {
        callback('insert', trimStart, newKeys.length - oldKeys.length);
        return;
    }

    // Simple delete?
    if (trimStart + trimEnd == newKeys.length)
    {
        callback('delete', trimStart, oldKeys.length - newKeys.length);
        return;
    }

    // Now the hard part starts

    let start = trimStart;
    let newEnd = newKeys.length - trimEnd;
    let oldEnd = oldKeys.length - trimEnd;

    // Build a map of keys in each
    let newKeyMap = keymap_create(newKeys, start, newEnd);
    let oldKeyMap = keymap_create(oldKeys, start, oldEnd);

    // Process
    let n = start;
    let o = start;
    while (n < newEnd)
    {
        // Ignore matching keys
        if (oldKeys[o] == newKeys[n])
        {
            keymap_delete(oldKeys[o]);
            keymap_delete(newKeys[n]);
            o++;
            n++;
            continue;
        }

        // If the new key doesn't exist in old array, then it's an insert
        let oldKeyIndexInNew = keymap_get(newKeyMap, oldKeys[o]);
        if (oldKeyIndexInNew === undefined)
        {
            callback('insert', n, 1);
            continue;
        }

        // If the old key doesn't exist in the new array, then it's a delete
        let newKeyIndexInOld = keymap_get(oldKeyMap, newKeys[n]);
        if (newKeyIndexInOld === undefined)
        {
            callback('delete', n, 1);
            continue;
        }

        // Both keys exist in the other array, work out which one has the more
        // consecutive matching keys
        let i=1;
        let moreNewKeys;
        while (true)
        {
            if (oldKeyIndexInNew + i < newEnd && o + i < oldEnd)
            {
                if (newKeys[oldKeyIndexInNew + i] != oldKeys[o + i])
                {
                    moreNewKeys = true;
                    break;
                }
            }
            else
            {
                moreNewKeys = true;
                break;
            }

            if (newKeyIndexInOld + i < oldEnd && n + i < newEnd)
            {
                if (oldKeys[newKeyIndexInOld + i] != newKeys[n + i])
                {
                    moreNewKeys = false;
                    break;
                }
            }
            else
            {
                moreNewKeys = false;
                break;
            }

            i++;
        }

        if (moreNewKeys)
            console.log("More new keys");
        else
            console.log("More old keys");
        process.exit(0);
    }
    
}



function keymap_create(keys, start, end)
{
    let map = new Map();
    for (let i=start; i<end; i++)
    {
        let existing = map.get(keys[i]);
        if (existing === undefined)
        {
            map.set(keys[i], i);
        }
        else if (Array.isArray(existing))
        {
            existing.push(i);
        }
        else
        {
            map.set(keys[i], [existing, i]);
        }
    }
    return map;
}

function keymap_get(map, key)
{
    let existing = map.get(key);
    if (Array.isArray(existing))
        return existing[0];
    return existing;
}

function keymap_delete(map, key)
{   
    let existing = map.get(key);
    if (Array.isArray(existing))
    {
        existing.shift();
        if (existing.length == 0)
            map.delete(key);
    }
    else
    {
        map.delete(key);
    }
}