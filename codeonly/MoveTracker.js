export class MoveTracker
{
    constructor()
    {
        this.pendingMoves = [];
        this.flushPos = 0;
        this.adjust = 0;
    }

    // Op should have .from, .to and .count.
    trackMove(op)
    {
        if (op.from < this.flushPos || op.to < this.flushPos)
            throw new Error("Move before current position");
            
        this.pendingMoves.push(op);
    }

    // Flush any move operations before 'pos' that
    // no longer have an impact on further index calculations
    flush(pos)
    {
        this.flushPos = 0;
    }

    // Notify that count items were inserted at the current
    // flush position
    insert(count)
    {
        this.adjust += count;
    }

    // Notify that 'count' items were deleted at the current
    // flush position
    delete(count)
    {
        this.adjust -= count;
    }

    // Convert an original index to the equivalent index
    // after the above operations have been applied
    convert(index)
    {
        if (index < this.flushPos)
            throw new Error("Invalid conversion index");

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

