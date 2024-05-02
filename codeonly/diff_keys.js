import { diff } from "./diff.js"
import { extract_array, split_range } from "./Utils.js"
import { KeyIndexMap } from "./KeyIndexMap.js"


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
    // insertMap is a map of keys to indices in the new keys collection
    // deleteMap is a map of keys to indices in the old keys collection
    let insertMap = new KeyIndexMap();
    let deleteMap = new KeyIndexMap();
    let adjust = 0;
    for (let op of edits)
    {
        if (op.op == 'insert')
        {
            for (let i=0; i<op.count; i++)
            {
                insertMap.add(newKeys[op.index + i], op.index + i);
            }
            adjust += op.count;
        }
        else if (op.op == 'delete')
        {
            for (let i=0; i<op.count; i++)
            {
                deleteMap.add(oldKeys[op.index + i - adjust], op.index + i - adjust);
            }
            adjust -= op.count;
        }
    }

    // Now enumerate the edits and any ops generate move/store/restore ops
    adjust = 0;
    let new_edits = [];

    function coalesc_move(index, fromIndex)
    {
        if (new_edits.length > 0)
        {
            // Get the previous op
            let prev = new_edits[new_edits.length-1];

            // continue previous op?
            if (prev.op == "move" && prev.index + 1 == index && prev.fromIndex == fromIndex)
            {
                prev.count++;
                return;
            }
        }

        new_edits.push({
            op: "move",
            index, 
            count: 1,
            fromIndex,
        });
    }

    function coalesc_store(index, storeIndex)
    {
        if (new_edits.length > 0)
        {
            // Get the previous op
            let prev = new_edits[new_edits.length-1];

            // continue previous op?
            if (prev.op == "store" && prev.index == index && prev.storeIndex + 1 == storeIndex)
            {
                prev.count++;
                return;
            }
        }

        new_edits.push({
            op: "store",
            index, 
            count: 1,
            storeIndex,
        });
    }

    function coalesc_restore(index, storeIndex)
    {
        if (new_edits.length > 0)
        {
            // Get the previous op
            let prev = new_edits[new_edits.length-1];

            // continue previous op?
            if (prev.op == "restore" && prev.index + 1 == index && prev.storeIndex + 1 == storeIndex)
            {
                prev.count++;
                return;
            }
        }

        new_edits.push({
            op: "restore",
            index, 
            count: 1,
            storeIndex,
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
                        adjust += i;
                        i = 0;
                    }

                    coalesc_restore(op.index, storeIndex);
                    storedKeys.delete(key);
                    op.index++;
                    op.count--;
                    i--;
                    adjust++;
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
                            adjust += i;
                            i = 0;
                        }
                        
                        // Generate a move operation
                        coalesc_move(op.index, delFrom - adjust);
                        movedIndicies.push(delFrom);

                        // Key used, can't use it again
                        deleteMap.delete(key);
                        op.index++;
                        op.count--;
                        adjust++;
                        i--;
                        continue;
                    }
                }
            }

            if (op.count)
                new_edits.push(op);
            adjust += op.count;
        }
        else if (op.op == 'delete')
        {
            // If any of the items in the range have already been moved then we need to remove them
            // from this delete op
            let moved_indicies_in_this_range = extract_array(movedIndicies, x => x >= op.index - adjust && x < op.index + op.count - adjust)
            if (moved_indicies_in_this_range.length > 0)
            {
                let split_ops = split_range(op.index-adjust, op.count, moved_indicies_in_this_range);
                split_ops.forEach(x => {
                    x.index += adjust;
                    x.op = "delete";
                });
                edits.splice(opIndex, 1, ...split_ops);
                opIndex--;
                adjust -= moved_indicies_in_this_range.length;
                continue;
            }


            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = oldKeys[op.index + i - adjust];

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
                        adjust -= i;
                        i = 0;
                    }

                    coalesc_store(op.index, storeIndex);
                    storedKeys.set(key, storeIndex);
                    storeIndex++;

                    insertMap.delete(key);
                    op.count--;
                    i--;
                    adjust--;
                    continue;
                }
            }

            if (op.count)
                new_edits.push(op);
            adjust -= op.count;
        }
        else
        {
            new_edits.push(op);
        }
    }

    return new_edits;
    
}