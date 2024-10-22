export function diff_tiny(oldArray, newArray)
{
    let minLength = Math.min(oldArray.length, newArray.length);
    let maxLength = Math.max(oldArray.length, newArray.length);

    // Work out how many matching keys at the start
    let trimStart = 0;
    while (trimStart < minLength && oldArray[trimStart] == newArray[trimStart])
        trimStart++;

    // Already exact match
    if (trimStart == maxLength)
        return [];

    // Simple Append?
    if (trimStart == oldArray.length)
    {
        return [{ 
            op: "insert", 
            index: oldArray.length,
            count: newArray.length - oldArray.length
        }];
    }

    // Work out how many matching keys at the end
    let trimEnd = 0;
    while (trimEnd < (minLength - trimStart) && oldArray[oldArray.length - trimEnd - 1] == newArray[newArray.length - trimEnd - 1])
        trimEnd++;

    // Simple prepend
    if (trimEnd == oldArray.length)
    {
        return [{ 
            op: "insert", 
            index: 0,
            count: newArray.length - oldArray.length
        }];
    }

    // Simple insert?
    if (trimStart + trimEnd == oldArray.length)
    {
        return [{ 
            op: "insert", 
            index: trimStart,
            count: newArray.length - oldArray.length
        }];
    }

    // Simple delete?
    if (trimStart + trimEnd == newArray.length)
    {
        return [{ 
            op: "delete", 
            index: trimStart,
            count: oldArray.length - newArray.length
        }];
    }

    // Work out end of range of each array
    let endOld = oldArray.length - trimEnd;
    let endNew = newArray.length - trimEnd;
    
    // Build a map of new items
    let newMap = build_map(newArray, trimStart, endNew);
    let oldMap = null;

    let ops = [];

    let n = trimStart;
    let o = trimStart;
    while (n < endNew)
    {
        // Skip equal items
        while (n < endNew && oldArray[o] == newArray[n])
        {
            newMap.delete(newArray[n], n);
            n++;
            o++;
        }

        // Remember start position in each array
        let ns = n;
        let os = o;

        // Delete items that aren't in the new array
        while (o < endOld && !newMap.has(oldArray[o]))
            o++;
        if (o > os)
        {
            ops.push({ op: "delete", index: ns, count: o - os });
            continue;
        }

        // Build a map of items in the old array
        if (!oldMap)
            oldMap = build_map(oldArray, n, endOld);

        // Insert items that aren't in the old array
        while (n < endNew && !oldMap.has(newArray[n]))
        {
            newMap.delete(newArray[n], n);
            n++;
        }
        if (n > ns)
        {
            ops.push({ op: "insert", index: ns, count: n - ns });
            continue;
        }

        // Rebuild needed
        break;
    }

    // Finished?
    if (n == endNew)
        return ops;

    // Rebuild phase 1 - remove all items in the range to be rebuilt, either
    // deleting or storing them.
    let si = 0;
    let storeMap = new MultiValueMap();
    while (o < endOld)
    {
        // Delete all items that aren't in the new map
        let os = o;
        while (o < endOld && !newMap.has(oldArray[o]))
            o++;
        if (o > os)
        {
            ops.push({ op: "delete", index: n, count: o - os });
            continue;
        }

        // Store all items are are in the new map
        while (o < endOld && newMap.consume(oldArray[o]) !== undefined)
        {
            storeMap.add(oldArray[o], si++);    // remember store index for this key
            o++;
        }
        if (o > os)
            ops.push({ op: "store", index: n, count: o - os });
    }

    // Rebuild phase 2 - add all items from the new array, either by
    // getting an item with the same key from the store, or by creating
    // a new item
    while (n < endNew)
    {
        // Insert new items that aren't in the store
        let ns = n;
        while (n < endNew && !storeMap.has(newArray[n]))
            n++;
        if (n > ns)
        {
            ops.push({ op: "insert", index: ns, count: n - ns });
            continue;
        }

        // Restore items that are in the store
        let op = { op: "restore", index: n, count: 0 };
        ops.push(op);
        while (n < endNew)
        {
            let si = storeMap.consume(newArray[n]);
            if (si === undefined)
                break;
            if (op.count == 0)
            {
                op.storeIndex = si;
                op.count = 1;
            }
            else if (op.storeIndex + op.count == si)
            {
                op.count++;
            }
            else
            {
                op = { op: "restore", index: n, storeIndex: si, count: 1 }
                ops.push(op);
            }
            n++;
        }
    }

    return ops;

    function build_map(array, start, end)
    {
        let map = new MultiValueMap();
        for (let i=start; i<end; i++)
        {
            map.add(array[i], i);
        }
        return map;
    }
}


class MultiValueMap
{
    constructor()
    {
    }

    #map = new Map();

    // Add a value to a key
    add(key, value)
    {
        let values = this.#map.get(key);
        if (values)
        {
            values.push(value);
        }
        else
        {
            this.#map.set(key, [ value ]);
        }
    }

    delete(key, value)
    {
        let values = this.#map.get(key);
        if (values)
        {
            let index = values.indexOf(value);
            if (index >= 0)
            {
                values.splice(index, 1);
                return;
            }
        }
        throw new Error("key/value pair not found");
    }

    consume(key)
    {
        let values = this.#map.get(key);
        if (!values || values.length == 0)
            return undefined;

        return values.shift();
    }

    // Check if have a key
    has(key)
    {
        return this.#map.has(key);
    }

}