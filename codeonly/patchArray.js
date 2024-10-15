import { diff } from "./diff.js";

export function patchArray(target, source, compare_key, patch_item)
{
    let ops = diff(target, source, compare_key);

    if (patch_item)
    {
        let isObservableTarget = target.isObservable;

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
                if (!patch_item(target[i], source[i], i) && isObservableTarget)
                {
                    target.touch(i);
                }
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