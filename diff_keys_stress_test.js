import { strict as assert } from "node:assert";
import { diff_keys } from "./codeonly/diff_keys.js";

function run_diff(oldKeys, newKeys)
{
    let r = [...oldKeys];
    let ops = diff_keys(oldKeys,newKeys);

    for (let o of ops)
    {
        if (o.op == 'insert')
        {
            r.splice(o.index, 0, ...newKeys.slice(o.index, o.index + o.count));
        }
        else if (o.op == 'delete')
        {
            r.splice(o.index, o.count);
        }
        else if (o.op == 'move')
        {
            let sourceKeys = r.slice(o.from, o.from + o.count);
            r.splice(o.from, o.count);
            r.splice(o.to, 0, ...sourceKeys);
        }
        else if (o.op == 'skip')
        {
            // nop
        }
        else
        {
            throw new Error(`unknown diff operation - ${o.op}`);
        }
    };
    assert.deepStrictEqual(r, newKeys);

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

let rF = random(7);
let r = () => parseInt(Math.random() * 10000);

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
            let save = arr.slice(index, index + count);
            arr.splice(index, count);
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

