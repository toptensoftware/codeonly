import { KeyIndexMap } from "./KeyIndexMap.js";

// Diff algorithm to generate edits new oldArray that will
// make it the same as newArray.
// itemsEqual should compare two items for key equality
// itemKey should generate a key for an item
// Generated ops:
//    - { op: "insert", index, count }
//    - { op: "delete", index, count }
//    - { op: "store", index, count }
//    - { op: "restore", index, storeIndex, count }
export function tinyDiff(oldArray, newArray)
{
    let minLength = Math.min(oldArray.length, newArray.length);
    let maxLength = Math.max(oldArray.length, newArray.length);

    // Work out how many matching keys at the start
    let trimStart = 0;
    while (trimStart < minLength && 
        oldArray[trimStart] == newArray[trimStart])
    {
        trimStart++;
    }

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
    while (trimEnd < (minLength - trimStart) && 
        oldArray[oldArray.length - trimEnd - 1] == newArray[newArray.length - trimEnd - 1])
    {
        trimEnd++;
    }

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

    // Rebuild all items in the range between the trimmed ends

    // Work out end of rebuid ranges
    let oldEnd = oldArray.length - trimEnd;
    let newEnd = newArray.length - trimEnd;

    // Build key maps for everything in new range
    let newMap = build_map(newArray, trimStart, newEnd);
    let oldMap = null;
    let storeMap = null;
    
    let ops = [];

    let o = trimStart;
    let n = trimStart;
    let si = 0;
    while (n < newEnd)
    {
        // Skip equal items
        if (newMap.consume(oldArray[o], n))
        {
            n++;
            continue;
        }

        // Delete missing items
        let os = o;
        while (o < oldEnd && !newMap.has(oldArray[o]))
            o++;
        if (o > os)
        {
            ops.push({ op: "delete", index: n, count: os - o});
            continue;
        }

        // We need a key map for the old array from now on
        if (oldMap == null)
            oldMap = build_map(oldArray, o, oldEnd);

        // Insert new items
        let ns = n;
        while (n < newEnd && !oldMap.has(newArray[n]) && newMap.consume(newArray[n], n))
            n++;
        if (n > ns)
        {
            ops.push({ op: "insert", index: n, count: ns - n});
            continue;
        }

        // Store all items that are in the new array, but don't
        // match the current item
        if (!storeMap)
            storeMap = new KeyIndexMap();
        while (o < endEnd && oldArray[o] != newArray[n] && newMap.consume(oldArray[o]))
        {
            storeMap.add(oldArray[o], si++);
            o++;
        }
        if (o > ns)
        {
            ops.push({ op: "store", index: n, count: os - o });
            continue;
        }

        // Restore items
        let op = { op: "restore", index: n, count: 0 };
        while (n < newEnd && oldArray[o] != newArray[n] && oldMap.has(newArray[n]))
        {
            let ome = oldMap.get(newArray[n]);
            if (op.count == 0)
            {
                op.storeIndex = ome.storeIndex;
                op.count++;
            }
            else if (ome.storeIndex != op.storeIndex + op.count)
            {
                ops.push(op);
                op = { op: "restore", index: n, storeIndex: ome.storeIndex, count: 1 };
            }
            else
            {
                op.count++;
            }

            n++;
        }
        ops.push(op);
    }



    function build_map(arr, from, to)
    {
        let map = new KeyIndexMap();
        for (let i=from; i<to; i++)
        {
            map.add(arr[i], i);
        }
        return map;
    }
}
