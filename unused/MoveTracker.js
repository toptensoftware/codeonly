
// Tracks the locations of items in a array as various operations
// are performed.  Operations should be apply in incremental index order
export class MoveTracker
{
    constructor()
    {
        this.pendingMoves = [];
        this.adjust = 0;
        this.editPos = 0;
    }

    // Notify that a move operation took place
    move(from, to, count)
    {
        if (from < this.editPos || to < this.editPos)
            throw new Error("move operation before current edit position");
            
        this.editPos = Math.min(from, to);
        this.pendingMoves.push({ from, to, count });
    }

    // Notify that items were inserted
    insert(index, count)
    {
        if (index < this.editPos)
            throw new Error("unorder array edits");
        this.editPos = index;
        this.adjust += count;
    }

    // Notify that items were deleted
    delete(index, count)
    {
        if (index < this.editPos)
            throw new Error("unorder array edits");
        this.editPos = index;
        this.adjust -= count;
    }

    // Convert an pre-edit index to current index
    convert(index)
    {
        if (index < this.editPos)
            throw new Error("attempt to convert index before current edit position");

        for (let i=0; i<this.pendingMoves.length; i++)
        {
            let op = this.pendingMoves[i];

            // If we've passed this move op, then we can discard it
            if (op.from + op.count < this.flushPos &&
                op.to + op.count < this.flushPos)
                {
                    this.pendingMoves.slice(i, 1);
                    i--;
                    continue;
                }

            if (op.to <= index && op.from > index)
                index += op.count;
            if (op.from < index && op.to >= index)
                index -= op.count;
        }

        return index + this.adjust;
    }
}

