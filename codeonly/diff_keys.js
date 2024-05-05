import { diff } from "./diff.js"
import { inplace_filter_array } from "./Utils.js"
import { KeyIndexMap } from "./KeyIndexMap.js"


// Returns an array of edits to apply to an array of items
// to make it match another array
// Returns array of operation objects has 'op' field describing each edit 
// operation: "insert", "delete", "move", "skip", or "keep"
//  - insert
//         index - position to insert to/from
//         count - number of items to insert
//  - delete
//         index - position in old array to delete from
//         count - the number of items to delete
//  - move
//         from - index to move from
//         to - index to move to        // For right moves, already adjusted for items deleted as from
//         index - the smaller of from/to (ie: the index of the LHS of the move operation)
//         count - number of items to move
//  - skip (used to skip over items previously moved from the left to this position)
//         index - index of previously moved items
//         count - number of items to skip
//  - keep 
//         index - index of items in old collection being keps
//         count - number of items being kept
// 
//  "keep" and "skip" operations only supplied when 'covered' parameter is true
export function diff_keys(oldKeys, newKeys, covered)
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
    {
        if (covered)
            insert_keeps(edits, newKeys.length);
        return edits;
    }

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

    // Convert insert/delete operations to move operations where possible
    let new_edits = [];
    let pending_left_moves = [];
    let pending_right_moves = [];
    for (let opIndex = 0; opIndex < edits.length; opIndex++)
    {
        let op = edits[opIndex];
        if (op.op == 'insert')
        {
            // Check if this insert operation is the RHS of a move right operation
            // started by a previous delete operation on matching keys

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

                // Remove the pending right move
                pending_right_moves.splice(pending_index, 1);

                // Start again in case there's another pending op
                opIndex--;
                continue;
            }

            // See if the keys being inserted correspond with the same
            // keys being deleted later.  If so, convert this to a move-left
            
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

                    // Also store pending left move info so
                    // the associated delete operation can be sliced
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

            // Any remain part gets passed through as a regular insert
            if (op.count)
            {
                new_edits.push(op);
            }
        }
        else if (op.op == 'delete')
        {
            // Check if this delete operation is the RHS of a move left operation
            // started by a previous insert operation on matching keys

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

            // See if the keys being deleted correspond with the same
            // keys being inserted later.  If so, convert this to a move-right.

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

                    // Add op
                    new_edits.push(move_op);

                    // Also store pending right move info so
                    // the associated insert operation can be sliced
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

    // Post process
    // - convert indicies from pre-edit indicies to in-flight edit indicies
    // - convert move-right sentinals to "skip" operations (or remove if not covered)
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
                delete op.originalIndex;
                break;

            case "delete":
                op.index += adjust;
                adjust -= op.count;
                delete op.originalIndex;
                break;

            case "move-left":
            {
                // Track this operation in the future moves list
                // (create entry before modifying op, but don't
                // put it in the list until after we've calculated
                // our future index)
                let fm = {
                    op,
                    index: op.from,
                    adjust: -op.count,
                    order: 0,
                };
                
                // Convert to a regular move operation
                op.op = "move";
                op.to += adjust;
                op.index = op.to;
                op.from = future_index(op.from, 0) + adjust;
                adjust += op.count;

                // Add future move
                futureMoves.push(fm);
                break;
            }

            case "move-left-sentinal":
                // Remove associated future move
                futureMoves.splice(futureMoves.findIndex(x => x.op == op.ref), 1);

                // Update adjustment
                adjust -= op.ref.count;

                // Remove this operation as client doesn't need it
                new_edits.splice(opIndex, 1);
                opIndex--;
                break;

            case "move-right":
            {
                // Track this operation in the future moves list
                // (create entry before modifying op, but don't
                // put it in the list until after we've calculated
                // our future index)
                // Note that for right moves we need to track the order
                // of the right hand side index. When there are multiple 
                // right  moves to the same index in the old keys array, 
                // we need to make sure they end up in the correct order.  
                // The order value tracks this and is just the original 
                // index of the key in the newKeys array.
                let fm = {
                    op,
                    index: op.to,
                    adjust: op.count,
                    order: op.order,
                };

                // Convert to a regular move operation
                op.op = "move";
                op.from += adjust;
                op.toOriginal = op.to - op.count;
                op.index = op.from;
                op.to = future_index(op.to, op.order) + adjust - op.count;
                adjust -= op.count;

                // Add future move
                futureMoves.push(fm);
                break;
            }

            case "move-right-sentinal":
                // Remove from future moves collection
                futureMoves.splice(futureMoves.findIndex(x => x.op == op.ref), 1);

                // Update adjustment
                adjust += op.ref.count;

                // For covered edit lists, convert this to a 'skip' operations,
                // otherwise delete it
                if (covered)
                {
                    op.op = "skip";
                    op.index = op.ref.toOriginal + adjust;
                    op.count = op.ref.count;
                }
                else
                {
                    new_edits.splice(opIndex, 1);
                    opIndex--;
                }

                // Clean up working members
                delete op.ref.order;
                delete op.ref.toOriginal;
                delete op.ref;

                break;

            default:
                throw new Error("Unexpected op type");
        }
    }

    // If covered, insert "keep" operations
    if (covered)
        insert_keeps(new_edits, newKeys.length);

    // Calculate the index of the RHS of a move operation
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

    // Done (Phew!)
    return new_edits;
}

// Helper to insert "keep" operations between main set of actual edits
function insert_keeps(ops, length)
{
    let pos = 0;
    for (let i=0; i<ops.length; i++)
    {
        let op = ops[i];

        // Insert keep op if needed
        if (op.index > pos)
        {
            ops.splice(i, 0, {
                op: 'keep',
                index: pos,
                count: op.index - pos,
            });
            i++;
        }

        // Update position (deletes and right moves, don't affect position)
        if (op.op != 'delete' && !(op.op == 'move' && op.to > op.from))
            pos = op.index + op.count;
        else
            pos = op.index;
    }

    // Tailing keep op
    if (pos < length)
    {
        ops.push({
            op: 'keep',
            index: pos,
            count: length - pos,
        });
    }

}

