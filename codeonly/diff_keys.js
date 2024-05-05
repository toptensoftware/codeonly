import { diff } from "./diff.js"
import { inplace_filter_array } from "./Utils.js"
import { KeyIndexMap } from "./KeyIndexMap.js"


// Returns an array of edits [ { op, index, count } ]
// where op = "insert", "delete", move"
//  - insert - insert .count keys from newKeys[.index] to oldkeys[.index]
//  - delete - delete .count keys from oldKeys[.index]
//  - move - move .count keys from oldKeys[.from] to oldKeys[.to].  
//             index also matches newKeys.  For move-right ops, the to
//             index is already adjusted for the from keys being removed
export function diff_keys(oldKeys, newKeys)
{
    // Build a list of raw edits
    let edits = diff(oldKeys, newKeys);

    edits = edits.filter(x => x.op != 'keep');

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
    //  - insertMap is a map of keys to indices in the newKeys collection
    //  - deleteMap is a map of keys to indices in the oldKeys collection
    // This step also converts all operation indicies to pre-edit indicies
    // - ie: the indicies in the old array before edits are applied
    let insertMap = new KeyIndexMap();
    let deleteMap = new KeyIndexMap();
    let adjust = 0;
    for (let op of edits)
    {
        if (op.op == 'insert')
        {
            op.originalIndex = op.index;
            op.index += adjust;
            adjust -= op.count;
            for (let i=0; i<op.count; i++)
            {
                insertMap.add(newKeys[op.originalIndex + i], {
                    offset: i,
                    count: op.count,
                    index: op.index,
                    originalIndex: op.originalIndex + i,
                });
            }
        }
        else if (op.op == 'delete')
        {
            op.originalIndex = op.index;
            op.index += adjust;
            adjust += op.count;
            for (let i=0; i<op.count; i++)
            {
                deleteMap.add(oldKeys[op.index + i], {
                    offset: i,
                    count: op.count,
                    index: op.index + i,
                });
            }
        }
    }

    /*
    console.log("---- insert map ----");
    console.log(insertMap);
    console.log("---- delete map ----");
    console.log(deleteMap);
    console.log("---- raw edits ----");
    edits.forEach(x => console.log(x));
    console.log("-------------------");
    */
    
    // Now enumerate the edits and any ops generate move/store/restore ops
    let new_edits = [];
    let pending_left_moves = [];
    let pending_right_moves = [];
    for (let opIndex = 0; opIndex < edits.length; opIndex++)
    {
        let op = edits[opIndex];
        if (op.op == 'insert')
        {
            // Find the first pending right move in this range
            let pending_index = -1;
            let pending = pending_right_moves.reduce((prev, x, index) => {
                if (x.originalIndex >= op.originalIndex && x.originalIndex < op.originalIndex + op.count && 
                    (prev == null || x.originalIndex < prev.originalIndex))
                {
                    pending_index = index;
                    return x;
                }
                else
                    return prev;
            }, null);

            if (pending)
            {
                if (pending.originalIndex > op.originalIndex)
                {
                    // Split this op
                    let count = pending.originalIndex - op.originalIndex;

                    // Create a new op starting where the pending move is 
                    let newOp = {
                        op: "insert",
                        index: op.index,
                        originalIndex: op.originalIndex + count,
                        count: op.count - count,
                    }
                    edits.splice(opIndex + 1, 0, newOp);

                    // Update this op
                    op.count -= newOp.count;
                    opIndex--;
                    continue;
                }

                // Update this op
                op.count -= pending.count;
                op.originalIndex += pending.count;

                // Insert sentinal
                new_edits.push({
                    op: "move-right-sentinal",
                    ref: pending.ref,
                });

                // Remove the pending left move
                pending_right_moves.splice(pending_index, 1);

                // Start again in case there's another pending op
                opIndex--;
                continue;
            }

            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = newKeys[op.originalIndex + i];

                // If we're going to be deleting it later then convert to a move operation
                let delFrom = deleteMap.get(key);
                if (delFrom)
                {
                    // Store an op for preceding part of this edit
                    if (i > 0)
                    {
                        new_edits.push({
                            op: "insert",
                            index: op.index,
                            originalIndex: op.originalIndex,
                            count: i,
                        });
                        op.originalIndex += i;
                        op.count -= i;
                        i = 0;
                    }

                    // Consume all consecutive matching items
                    let count = 0;
                    while (count < op.count &&
                            delFrom.offset + count < delFrom.count &&
                            newKeys[op.originalIndex + count] == oldKeys[delFrom.index + count])
                    {
                        let itemkey = newKeys[op.originalIndex + count];
                        deleteMap.delete(itemkey, x => x.index == delFrom.index + count);
                        insertMap.delete(itemkey, x => x.originalIndex == op.originalIndex + count);
                        count++;
                    }

                    // Sanity check
                    if (count == 0)
                        throw new Error("internal error, key mismatch")

                    // Generate a move-left
                    let move_op = {
                        op: "move-left",
                        from: delFrom.index,
                        to: op.index,
                        count,
                    };

                    // Store it
                    new_edits.push(move_op);
                    pending_left_moves.push({
                        index: delFrom.index,
                        count: count,
                        ref: move_op,
                    });

                    // Truncate this op
                    op.originalIndex += count;
                    op.count -= count;
                    i--;
                    continue;
                }
            }

            if (op.count)
            {
                new_edits.push(op);
            }
        }
        else if (op.op == 'delete')
        {
            // Find the first pending left move in this range
            let pending_index = -1;
            let pending = pending_left_moves.reduce((prev, x, index) => {
                if (x.index >= op.index && x.index < op.index + op.count && (prev == null || x.index < prev.index))
                {
                    pending_index = index;
                    return x;
                }
                else
                    return prev;
            }, null);

            if (pending)
            {
                if (pending.index > op.index)
                {
                    // Insert delete op
                    let count = pending.index - op.index;

                    let newOp = {
                        op: "delete",
                        index: op.index + count,
                        originalIndex: op.originalIndex + count,
                        count: op.count - count,
                    }
                    edits.splice(opIndex + 1, 0, newOp);
                    
                    // Update this op
                    op.count -= newOp.count;
                    opIndex--;
                    continue;
                }

                // Update this op
                op.count -= pending.count;
                op.index += pending.count;
                op.originalIndex += pending.count;

                // Insert sentinal
                new_edits.push({
                    op: "move-left-sentinal",
                    ref: pending.ref,
                });

                // Remove the pending left move
                pending_left_moves.splice(pending_index, 1);

                // Start again in case there's another pending op
                opIndex--;
                continue;
            }

            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = oldKeys[op.index + i];

                // If we're going to be inserting it later then convert to a move-right operation
                let insFrom = insertMap.get(key);
                if (insFrom)
                {
                    // Store an op for the preceding part of this edit
                    if (i > 0)
                    {
                        new_edits.push({
                            op: "delete",
                            index: op.index,
                            originalIndex: op.originalIndex,
                            count: i,
                        });
                        op.count -= i;
                        op.index += i;
                        op.originalIndex += i;
                        i = 0;
                    }

                    // Consume all consecutive matching items
                    let count = 0;
                    while (count < op.count &&
                            insFrom.offset + count < insFrom.count &&
                            newKeys[insFrom.originalIndex + count] == oldKeys[op.index + count])
                    {
                        let itemkey = newKeys[insFrom.originalIndex + count];
                        insertMap.delete(itemkey, x => x.originalIndex == insFrom.originalIndex + count);
                        deleteMap.delete(itemkey, x => x.index == op.index + count);
                        count++;
                    }

                    // Sanity check
                    if (count == 0)
                        throw new Error("internal error, key mismatch")

                    // Generate a move-right
                    let move_op = {
                        op: "move-right",
                        from: op.index,
                        to: insFrom.index,
                        order: insFrom.originalIndex,
                        count,
                    };

                    new_edits.push(move_op);

                    pending_right_moves.push({
                        originalIndex: insFrom.originalIndex,
                        count: move_op.count,
                        ref: move_op,
                    });

                    // Truncate this op
                    op.count -= count;
                    op.index += count;
                    i--;
                    continue;
                }
            }

            if (op.count)
            {
                new_edits.push(op);
            }
        }
    }

    /*
    console.log("---- pre-process ----");
    new_edits.forEach(x => console.log(x));
    */

    // Post process
    // - convert indicies from pre-edit indicies to in-flight edit indicies
    // - convert move-right sentinals to "skip" operations
    // - remove move-left sentinals
    adjust = 0;
    let futureMoves = [];
    for (let opIndex = 0; opIndex<new_edits.length; opIndex++)
    {
        let op = new_edits[opIndex];
        switch (op.op)
        {
            case "insert":
                op.index += adjust;
                adjust += op.count;
                if (op.originalIndex != op.index)
                    throw new Error("insert index changed");
                delete op.originalIndex;
                break;

            case "delete":
                op.index += adjust;
                adjust -= op.count;delete op.originalIndex;
                break;

            case "move-left":
            {
                let fm = {
                    op,
                    index: op.from,
                    adjust: -op.count,
                    order: 0,
                };
                op.op = "move";
                op.to += adjust;
                op.from = future_index(op.from, 0) + adjust;
                adjust += op.count;
                futureMoves.push(fm);
                break;
            }

            case "move-left-sentinal":
                futureMoves.splice(futureMoves.findIndex(x => x.op == op.ref), 1);
                adjust -= op.ref.count;
                new_edits.splice(opIndex, 1);
                opIndex--;
                break;

            case "move-right":
            {
                let fm = {
                    op,
                    index: op.to,
                    adjust: op.count,
                    order: op.order,
                };
                op.op = "move";
                op.from += adjust;
                op.toOriginal = op.to - op.count;
                op.to = future_index(op.to, op.order) + adjust - op.count;
                adjust -= op.count;
                futureMoves.push(fm);
                break;
            }

            case "move-right-sentinal":
                futureMoves.splice(futureMoves.findIndex(x => x.op == op.ref), 1);
                adjust += op.ref.count;
                op.op = "skip";
                op.index = op.ref.toOriginal + adjust;
                op.count = op.ref.count;
                delete op.ref;
                break;

            default:
                throw new Error("Unexpected op type");
        }
    }

    function future_index(index, order)
    {
        let adj = 0;
        for (let i=0; i<futureMoves.length; i++)
        {
            let fm = futureMoves[i];
            if (fm.index == index)
            {
                if (fm.order <= order)
                    adj += fm.adjust;
            }
            else if (fm.index < index)
                adj += fm.adjust;
        }
        return index + adj;
    }

    /*
    console.log("---- final edit list ----");
    new_edits.forEach(x => console.log(x));
    console.log("-------------------");
    */

    return new_edits;
    
}
