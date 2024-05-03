import { diff } from "./diff.js"
import { separate_array, split_range, subtract_ranges } from "./Utils.js"
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


/*
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
*/

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
                    op: op,
                    offset: i,
                    index: op.originalIndex + i,
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
                    op: op,
                    offset: i,
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
    */
    console.log("---- raw edits ----");
    edits.forEach(x => console.log(x));
    console.log("-------------------");

    // Now enumerate the edits and any ops generate move/store/restore ops
    let new_edits = [];
    let pending_left_moves = [];
    let pending_right_moves = [];
    for (let opIndex = 0; opIndex < edits.length; opIndex++)
    {
        let op = edits[opIndex];
        if (op.op == 'insert')
        {
            // Slice out any part of this range that has already been handled
            // by a previous right move.
            let right_moves = separate_array(pending_right_moves, x => {
                return x.index >= op.index && x.index < op.index + op.count;
            });
            if (right_moves.length)
            {
                // Split this op into sub-inserts and right move sentinals
                let newRanges = subtract_ranges(op.index, op.count, right_moves);
                new_edits.push(...newRanges.map(x => {
                    return {
                        op: "move-right-sentinal",
                        ref: x.ref,
                    }
                }));
                edits.splice(opIndex, 1, ...newRanges.map(x => {
                    return {
                        op: "insert",
                        index: x.index,
                        count: x.count,
                        originalIndex: x.index + op.index - op.originalIndex,
                    }
                }));
                opIndex--;
                continue;
            }


            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = newKeys[op.index + i];

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
                        op.index += i;
                        op.originalIndex += i;
                        op.count -= i;
                        i = 0;
                    }

                    // Consume all consecutive matching items
                    let count = 0;
                    while (count < op.count &&
                            delFrom.offset + count < delFrom.op.count &&
                            newKeys[op.index + count] == oldKeys[delFrom.index + count])
                    {
                        deleteMap.delete(newKeys[op.index + count], delFrom.index + count);
                        insertMap.delete(newKeys[op.index + count], op.index + count);
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
                    op.index += count;
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
            // Slice out any part of this range that has already been handled
            // by a previous left move.
            let left_moves = separate_array(pending_left_moves, x => {
                return x.index >= op.index && x.index < op.index + op.count;
            });
            if (left_moves.length)
            {
                // Split this operation into sub-deletes and left move sentinals
                let newRanges = subtract_ranges(op.index, op.count, left_moves);
                new_edits.push(...newRanges.map(x => {
                    return {
                        op: "move-left-sentinal",
                        ref: x.ref,
                    };
                }));
                edits.splice(opIndex, 1, ...newRanges.map(x => {
                    return {
                        op: "delete",
                        index: x.index,
                        originalIndex: x.index + op.originalIndex - op.index,
                        count: x.count,
                    };
                }));
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
                            insFrom.offset + count < insFrom.op.count &&
                            newKeys[insFrom.index + count] == oldKeys[op.index + count])
                    {
                        insertMap.delete(newKeys[insFrom.index + count], insFrom.index + count);
                        deleteMap.delete(newKeys[insFrom.index + count], op.index + count);
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
                        count,
                    };

                    new_edits.push(move_op);

                    pending_right_moves.push({
                        index: insFrom.index,
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

    // Post process
    // - convert indicies from pre-edit indicies to in-flight edit indicies
    // - convert move-right sentinals to "skip" operations
    // - remove move-left sentinals
    adjust = 0;
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
                adjust -= op.count;
                if (op.originalIndex != op.index)
                    throw new Error("delete index changed");
                break;

            case "move-left":
                op.op = "move";
                op.to += adjust;
                adjust += op.count;
                break;

            case "move-left-sentinal":
                op.ref.from += adjust;
                adjust -= op.ref.count;
                new_edits.splice(opIndex, 1);
                opIndex--;
                break;

            case "move-right":
                op.op = "move";
                op.from += adjust;
                adjust -= op.count;
                break;

            case "move-right-sentinal":
                op.ref.to += adjust;
                op.op = "skip";
                op.index = op.ref.to;
                op.count = op.ref.count;
                delete op.ref;
                adjust += op.count;
                break;

            default:
                throw new Error("Unexpected op type");
        }
    }

    return new_edits;
    
}
