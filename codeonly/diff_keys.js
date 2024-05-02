import { diff } from "./diff.js"
import { extract_array, split_range } from "./Utils.js"

// Returns an array of edits [ { op, index, count } ]
// where op = "insert", "delete", "keep", "store", "restore", or "move"
//  - insert - insert count keys from newKeys[index] to oldkeys[index]
//  - delete - delete count keys from oldKeys[index]
//  - keep - keep count keys from oldKeys[index]
//  - store - remove count keys from oldKeys[index] and place in store[altIndex]
//  - restore - restore count previously stored keys from store[altIndex] to oldKeys[index]. index also matches newKeys
//  - move - move count keys from oldKeys[altIndex] to oldKeys[index].  index also matches newKeys
export function diff_keys(oldKeys, newKeys)
{
    // Build a list of raw edits
    let edits = diff(oldKeys, newKeys);

    // If there are only inserts or only deletes
    // then there can be no move operations so just 
    // return the raw edits
    let inserts = 0;
    let deletes = 0;
    for (let o of edits)
    {
        if (o.op == 'insert')
            inserts++;
        else if (o.op == 'delete')
            deletes++;
        if (inserts && deletes)
            break;
    }
    if (!inserts || !deletes)
        return edits;

    // Make a map of all keys being inserted and all keys being deleted
    let insertMap = new Map();
    let deleteMap = new Map();
    let oldIndexAdjust = 0;
    for (let op of edits)
    {
        if (op.op == 'insert')
        {
            for (let i=0; i<op.count; i++)
            {
                insertMap.set(newKeys[op.index + i], op.index + i);
            }
            oldIndexAdjust += op.count;
        }
        else if (op.op == 'delete')
        {
            for (let i=0; i<op.count; i++)
            {
                deleteMap.set(oldKeys[op.index + i - oldIndexAdjust], op.index + i - oldIndexAdjust);
            }
            oldIndexAdjust -= op.count;
        }
    }

    // Now enumerate the edits and any ops generate move/store/restore ops
    oldIndexAdjust = 0;
    let new_edits = [];

    function coalesc(op, index, altIndex, altIndexName)
    {
        if (new_edits.length > 0)
        {
            // Get the previous op
            let prev = new_edits[new_edits.length-1];

            // continue previous op?
            if (prev.op == op && prev.index + 1 == index && prev[altIndexName] != altIndex)
            {
                prev.count += count;
                return;
            }
        }

        new_edits.push({
            op,
            index, 
            count: 1,
            [altIndexName]: altIndex
        });
    }

    let storeIndex = 0;
    let storedKeys = new Map();
    let movedIndicies = [];
    for (let opIndex = 0; opIndex < edits.length; opIndex++)
    {
        let op = edits[opIndex];
        if (op.op == 'insert')
        {
            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = newKeys[op.index + i];

                let storeIndex = storedKeys.get(key);
                if (storeIndex !== undefined)
                {
                    // Store an op for preceding keys (if any)
                    if (i > 0)
                    {
                        new_edits.push({
                            op: "insert",
                            index: op.index,
                            count: i,
                        });
                        op.index += i;
                        op.count -= i;
                        oldIndexAdjust += i;
                        i = 0;
                    }

                    coalesc("restore", op.index, storeIndex, "storeIndex");
                    storedKeys.delete(key);
                    op.index++;
                    op.count--;
                    i--;
                    oldIndexAdjust++;
                    continue;
                }
                else
                {
                    // Will we be deleting this key later?
                    let delFrom = deleteMap.get(key);
                    if (delFrom)
                    {
                        // Yes, this becomes a move operation

                        // Store an op for preceding keys (if any)
                        if (i > 0)
                        {
                            new_edits.push({
                                op: "insert",
                                index: op.index,
                                count: i,
                            });
                            op.index += i;
                            op.count -= i;
                            oldIndexAdjust += i;
                            i = 0;
                        }
                        
                        // Generate a move operation
                        coalesc("move", op.index, delFrom - oldIndexAdjust, "fromIndex");
                        movedIndicies.push(delFrom);

                        // Key used, can't use it again
                        deleteMap.delete(key);
                        op.index++;
                        op.count--;
                        oldIndexAdjust++;
                        i--;
                        continue;
                    }
                }
            }

            if (op.count)
                new_edits.push(op);
            oldIndexAdjust += op.count;
        }
        else if (op.op == 'delete')
        {
            // If any of the items in the range have already been moved then we need to remove them
            // from this delete op
            let moved_indicies_in_this_range = extract_array(movedIndicies, x => x >= op.index - oldIndexAdjust && x < op.index + op.count - oldIndexAdjust)
            if (moved_indicies_in_this_range.length > 0)
            {
                let split_ops = split_range(op.index-oldIndexAdjust, op.count, moved_indicies_in_this_range);
                split_ops.forEach(x => {
                    x.index += oldIndexAdjust;
                    x.op = "delete";
                });
                edits.splice(opIndex, 1, ...split_ops);
                opIndex--;
                continue;
            }


            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = oldKeys[op.index + i - oldIndexAdjust];

                // If we're going to be inserting it later then generate a store operation
                let insFrom = insertMap.get(key);
                if (insFrom)
                {
                    if (i > 0)
                    {
                        new_edits.push({
                            op: "delete",
                            index: op.index,
                            count: i,
                        });
                        op.count -= i;
                        oldIndexAdjust -= i;
                        i = 0;
                    }

                    coalesc("store", op.index, storeIndex, "storeIndex");
                    storedKeys.set(key, storeIndex);
                    storeIndex++;

                    insertMap.delete(key);
                    op.count--;
                    i--;
                    oldIndexAdjust--;
                    continue;
                }
            }

            if (op.count)
                new_edits.push(op);
            oldIndexAdjust -= op.count;
        }
        else
        {
            new_edits.push(op);
        }
    }

    return new_edits;
    
}