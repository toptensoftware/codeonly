import { KeyIndexMap } from "./KeyIndexMap.js"

export function diff(oldKeys, newKeys)
{
    let minLength = Math.min(oldArray.length, newArray.length);
    let maxLength = Math.max(oldArray.length, newArray.length);

    // Work out how many matching keys at the start
    let trimStart = 0;
    while (trimStart < minLength && oldArray[trimStart] == newArray[trimStart])
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
        (oldArray[oldArray.length - trimEnd - 1] == newArray[newArray.length - trimEnd - 1]))
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

    // Work out end positions
    let newEnd = newArray.length - trimEnd;
    let oldEnd = oldArray.length - trimEnd;

    // Generate map of all remaining old keys
    let deleteMap = new KeyIndexMap();
    for (let i=trimStart; i < oldEnd; i++)
    {
        deleteMap.add(oldKeys[i], i);
    }
    // Generate map of all remaining new keys
    for (let i=trimStart; i < newEnd; i++)
    {
        insertMap.add(newKeys[i], i);
    }

    // Generate operations to store/delete all keys
    

    throw new Error("not impl");    
}

