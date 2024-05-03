import { diff } from "./diff.js"
import { separate_array, split_range, subtract_ranges } from "./Utils.js"
import { KeyIndexMap } from "./KeyIndexMap.js"
import { MoveTracker } from "./MoveTracker.js"


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
    // This step also adorns each operation with an "originalIndex" which
    // is the index into the original _unmodified_ oldKeys array.
    let insertMap = new KeyIndexMap();
    let deleteMap = new KeyIndexMap();
    let adjust = 0;
    for (let op of edits)
    {
        op.originalIndex = op.index + adjust;
        if (op.op == 'insert')
        {
            for (let i=0; i<op.count; i++)
            {
                insertMap.add(newKeys[op.index + i], {
                    index: op.index + i,
                    originalIndex: op.originalIndex,            // no +i all itesm in this insert op, go to same target index
                });
            }
            adjust -= op.count;
        }
        else if (op.op == 'delete')
        {
            for (let i=0; i<op.count; i++)
            {
                deleteMap.add(oldKeys[op.originalIndex + i], {
                    index: op.index + i,
                    originalIndex: op.originalIndex + i,
                });
            }
            adjust += op.count;
        }
    }

    console.log("---- insert map ----");
    console.log(insertMap);
    console.log("---- delete map ----");
    console.log(deleteMap);
    console.log("---- raw edits ----");
    edits.filter(x => x.op != 'keep').forEach(x => console.log(x));
    console.log("-------------------");

    // Now enumerate the edits and any ops generate move/store/restore ops
    let new_edits = [];
    let mt = new MoveTracker();
    let pending_left_moves = [];
    let pending_right_moves = [];
    for (let opIndex = 0; opIndex < edits.length; opIndex++)
    {
        let op = edits[opIndex];

        // We don't want 'keep' ops
        if (op.op == "keep")
        {
            continue;
        }

        if (op.op == 'insert')
        {
            // Slice out any part of this range that has already been handled
            // by a previous right move.
            let right_moves = separate_array(pending_right_moves, x => {
                return x.index >= op.index && x.index < op.index + op.count;
            });
            if (right_moves.length)
            {
                // Subtract the already handled ranges from this range
                let newRanges = subtract_ranges(op.index, op.count, right_moves);

                // and create new edit ops for the remaining part
                edits.splice(opIndex, 1, ...newRanges.map(x => {
                    return {
                        op: "insert",
                        index: x.index,
                        count: x.count,
                        originalIndex: x.index - op.index + op.originalIndex,
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
                            count: i,
                        });
                        mt.insert(op.index, i);
                        op.index += i;
                        op.count -= i;
                        i = 0;
                    }

                    // Consume all consecutive matching items
                    let count = 0;
                    while (count < op.count &&
                            op.index + count < newKeys.length &&
                            delFrom.originalIndex + count < oldKeys.length && 
                            newKeys[op.index + count] == oldKeys[delFrom.originalIndex + count])
                    {
                        deleteMap.delete(newKeys[op.index + count], delFrom.originalIndex + count, "originalIndex");
                        insertMap.delete(newKeys[op.index + count], op.index + count, "index");
                        count++;
                    }

                    // Sanity check
                    if (count == 0)
                        throw new Error("internal error, key mismatch")

                    // Generate a move-left
                    let move_op = {
                        op: "move-left",
                        from: mt.convert(delFrom.originalIndex),
                        index: op.index,
                        to: op.index,
                        count,
                    };

                    new_edits.push(move_op);
                    mt.move(move_op.from, move_op.to, move_op.count);

                    // Track
                    pending_left_moves.push({
                        originalIndex: delFrom.originalIndex,
                        count
                    });

                    // Truncate this op
                    op.index += count;
                    op.count -= count;
                    i--;
                    continue;
                }
            }

            if (op.count)
            {
                new_edits.push(op);
                mt.insert(op.index, op.count);
            }
        }
        else if (op.op == 'delete')
        {
            // Slice out any part of this range that has already been handled
            // by a previous left move.
            let left_moves = separate_array(pending_left_moves, x => {
                return x.originalIndex >= op.originalIndex && x.originalIndex < op.originalIndex + op.count;
            });
            if (left_moves.length)
            {
                // Left moves were stored with original index, but subtract_ranges requires
                // index and it needs to be relative to the post modified index, not the
                // original index.
                for (let m of left_moves)
                {
                    m.index = m.originalIndex - op.originalIndex + op.index;
                }

                // Subtract the already handled ranges from this range
                let newRanges = subtract_ranges(op.index, op.count, left_moves);

                // and create new edit ops for the remaining part
                let adj = 0;
                edits.splice(opIndex, 1, ...newRanges.map(x => {
                    let e = {
                        op: "delete",
                        index: x.index - adj,
                        count: x.count,
                        originalIndex: x.index - adj - op.index + op.originalIndex,
                    };
                    adj += x.count;
                    return e;
                }));
                opIndex--;
                continue;
            }

            for (let i=0; i<op.count; i++)
            {
                // Get the key
                let key = oldKeys[op.originalIndex + i];

                // If we're going to be inserting it later then convert to a move operation
                let insFrom = insertMap.get(key);
                if (insFrom)
                {
                    // Store an op for the preceding part of this edit
                    if (i > 0)
                    {
                        new_edits.push({
                            op: "delete",
                            index: op.index,
                            count: i,
                        });
                        mt.delete(op.index, i);
                        op.count -= i;
                        op.originalIndex += i;
                        i = 0;
                    }

                    // Consume all consecutive matching items
                    let count = 0;
                    while (count < op.count &&
                            insFrom.index + count < newKeys.length &&
                            op.originalIndex + count < oldKeys.length && 
                            newKeys[insFrom.index + count] == oldKeys[op.originalIndex + count])
                    {
                        insertMap.delete(newKeys[insFrom.index + count], insFrom.index + count, "index");
                        deleteMap.delete(newKeys[insFrom.index + count], op.oldKeys + count, "originalindex");
                        count++;
                    }

                    // Sanity check
                    if (count == 0)
                        throw new Error("internal error, key mismatch")

                    // Generate a move-right
                    let move_op = {
                        op: "move-right",
                        index: op.index,
                        from: op.index,
                        to: mt.convert(insFrom.originalIndex) - count,
                        count,
                    };

                    new_edits.push(move_op);
                    mt.move(move_op.from, move_op.to, move_op.count);

                    // Track
                    pending_right_moves.push({
                        index: insFrom.index,
                        count
                    });

                    // Truncate this op
                    op.count -= count;
                    op.originalIndex += count;
                    i--;
                    continue;
                }
            }

            if (op.count)
            {
                let adjOp = {
                    op: "delete",
                    index: mt.convert(op.originalIndex),
                    count: op.count,
                };
                new_edits.push(adjOp);
                mt.delete(adjOp.index, op.count);
            }
        }
    }

    return new_edits;
    
}
