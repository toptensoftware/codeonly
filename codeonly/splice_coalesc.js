import { strict as assert } from "node:assert";
import { ObservableArray } from "./ObservableArray.js";

// coalesc a set of split ops:
//    { index, ins, del }
// into a new set of operations that can be applied to a target
// array, assuming ops have already been applied to the source.
function coalesc_splice_ops(ops)
{
    for (let i=0; i<ops.length; i++)
    {
        let op = ops[i];
        if (op.ins)
        {
            op.sourceIndex = op.index;
            for (let j=i+1; j<ops.length; j++)
            {
                if (ops[j].index <= op.sourceIndex)
                {
                    op.sourceIndex += ops[j].ins - ops[j].del;
                }
                else if (ops[j].index < op.sourceIndex + op.ins)
                {
                    debugger;
                }
            }
        }
    }

    return ops;
}


let src = new ObservableArray();
let dest1 = [];
let ops = [];

src.addListener((index, del, ins) => {
    ops.push({ index, del, ins });
    dest1.splice(index, del, ...src.slice(index, index + ins));
});


src.push(10, 20, 30);
src.unshift(1);
src.push(40, 50);
src.splice(3, 0, 99, 100);
assert.deepEqual(src, dest1);

console.log(JSON.stringify(ops, null,4 ));
ops = coalesc_splice_ops([...ops]);
console.log(JSON.stringify(ops, null,4 ));

let dest2 = [];
for (let i=0; i<ops.length; i++)
{
    let op = ops[i];
    dest2.splice(op.index, op.del, ...src.slice(op.sourceIndex, op.sourceIndex + op.ins));
}
console.log(JSON.stringify(src));
console.log(JSON.stringify(dest2));
assert.deepEqual(src, dest2);

console.log("OK");