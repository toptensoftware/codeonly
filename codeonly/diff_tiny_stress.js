import { strict as assert } from "node:assert";
import { diff_tiny } from "./diff_tiny.js";

function run_diff(oldKeys, newKeys)
{
    let ops = diff_tiny(oldKeys,newKeys);

    let store = [];
    for (let op of ops)
    {
        let pre_edit = [...oldKeys];
        switch (op.op)
        {
            case "insert":
                oldKeys.splice(op.index, 0, ...newKeys.slice(op.index, op.index + op.count));
                break;

            case "delete":
                oldKeys.splice(op.index, op.count);
                break;

            case "store":
                store.push(...oldKeys.splice(op.index, op.count));
                break;

            case "restore":
                oldKeys.splice(op.index, 0, ...store.slice(op.storeIndex, op.storeIndex + op.count));
                break;

            default:
                throw new Error("unknown diff op");
        }
    }
    assert.deepStrictEqual(oldKeys, newKeys);

    return ops.length;
}


    
function random(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;

    return function () {
        s = (s * a) % m;
        return s / m;
    };
}

let rf = random(7);
let r = () => parseInt(rf() * 10000);
let rr = () => parseInt(Math.random() * 10000);

let arr = [];
let nextKey = 10;
for (let i=0; i<20; i++)
{
    arr.push(nextKey++);
}

function make_random_edit()
{
    switch (r() % 3)
    {
        case 0:
        {
            // Insert
            let count = r() % 10;
            let index = arr.length == 0 ? 0 : (r() % arr.length);
            for (let i=0; i<count; i++)
            {
                arr.splice(index + i, 0, nextKey++);
            }
            break;
        }

        case 1:
        {
            // Delete
            let count = r() % 10;
            let index = 0;
            if (count > arr.length)
            {
                count = arr.length;
            }
            else
            {
                index = r() % (arr.length - count);
            }
            arr.splice(index, count);
        }

        case 2:
            // Move
            let count = r() % 10;
            let index = 0;
            if (count > arr.length)
            {
                count = arr.length;
            }
            else
            {
                index = r() % (arr.length - count);
            }
            let save = arr.splice(index, count);
            index = arr.length == 0 ? 0 : r() % arr.length;
            arr.splice(index, 0, ...save);
            break;
    }
}

let iter = 0;
let opCount = 0;
while (true)
{
    let original = [...arr];
    let edits = r() % 20;
    for (let e=0; e < edits; e++)
    {
        make_random_edit();
    }

    process.stdout.write(`\rIteration: ${iter++} Len: ${arr.length} Ops: ${opCount}              `);

    try
    {
        opCount = run_diff(original, arr);
    }
    catch (err)
    {
        console.log(err);
        console.log(`OLD: ${original.join(",")}`);
        console.log(`NEW: ${arr.join(",")}`);
        break;
    }

}

