import { diff } from "./diff.js";

export function patchArray(target, source, compare_key, compare_deep)
{
    let ops = diff(target, source, compare_key);

    if (compare_deep)
    {
        // Deep
        let pos = 0;
        for (let i=0; i < ops.length; i++)
        {
            let op = ops[i];
            if (op.index > pos)
            {
                do_deep_compare(pos, op.index);
            }
            if (op.op == "insert")
            {
                target.splice(op.index, 0, ...source.slice(op.index, op.index + op.count));
            }
            else if (op.op == "delete")
            {
                target.splice(op.index, op.count);
            }
            pos = op.index + op.count;
        }

        do_deep_compare(pos, source.length);

        function do_deep_compare(from, to)
        {
            for (let i=from; i<to; i++)
            {
                compare_deep(target[i], source[i], i);
            }
        }
    }
    else
    {
        // Shallow
        for (let i=0; i < ops.length; i++)
        {
            let op = ops[i];
            if (op.op == "insert")
            {
                target.splice(op.index, 0, ...source.slice(op.index, op.index + op.count));
            }
            else if (op.op == "delete")
            {
                target.splice(op.index, op.count);
            }
        }
    }
}