import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff_keys } from "../codeonly/diff_keys.js";

function run_str_diff(oldKeys, newKeys)
{
    oldKeys = oldKeys.split("");
    newKeys = newKeys.split("");
    return run_diff(oldKeys, newKeys);
}

function run_diff(oldKeys, newKeys)
{
    console.log("OLD:", oldKeys.join(","));
    console.log("NEW:", newKeys.join(","));

    let r = [...oldKeys];
    let ops = diff_keys(oldKeys,newKeys);

    for (let o of ops)
    {
        console.log("MOD:", r.join(","));
        console.log(o);

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
        else
        {
            throw new Error(`unknown diff operation - ${o.op}`);
        }
    };
    console.log("FIN:", r.join(","));
    assert.deepStrictEqual(r, newKeys);
}






test("Simple Move Left", () => {
    run_str_diff(
        "abc*e",
        "a*bce"
    );
});


test("Simple Move Right", () => {
    run_str_diff(
        "a*bce",
        "abc*e",
    );
});

test("Move Left and Right", () => {
    run_str_diff(
        "abcd*efgh.ijklm",
        "a*bcdefghijkl.m",
    );
});

test("Move Right and Left", () => {
    run_str_diff(
        "a*bcdefghijkl.m",
        "abcd*efgh.ijklm",
    );
});

test("Move Left and Right Multiple", () => {
    run_str_diff(
        "abcd*#efgh.,ijklm",
        "a*#bcdefghijkl.,m",
    );
});


test("XXX", () => {
    
    run_diff(
        /*
        [10,22,23,25,11,16,17,12,13,34,35,14,15,18,19,20,24,30,31,32,33,21,26,27,28,29],
        [10,11,44,45,46,47,48,49,16,17,12,13,34,35,14,22,23,25,15,36,37,38,39,40,41,42,43,18,19,20]
        */

        /*
        [10,11,44,53,54,16,17,14,22,55,56,57,58,45,46,47,48,49,42,43,18,19,20,29],
        [10,11,44,45,46,47,48,49,16,17,12,13,34,35,14,22,23,25,15,36,37,38,39,40,41,42,43,18,19,20,29]
        */
        [10,11,44,45,46,47,48,49,16,17,12,13,34,35,14,22,23,25,15,36,37,38,39,40,41,42,43,18,19,20,29],
        [10,11,44,53,54,16,17,14,22,55,56,57,58,45,46,47,48,49,42,43,18,19,20,29]
        

    );
});
    
function random(seed) {
    const m = 2 ** 35 - 31;
    const a = 185852;
    let s = seed % m;

    return function () {
        s = (s * a) % m;
        return s / m;
    };
}

test("Stress Test", () => {

    let rF = random(7);
    let r = () => parseInt(rF() * 10000);

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

    for (let i=0; i<100; i++)
    {
        let original = [...arr];
        let edits = r() % 5;
        for (let e=0; e < edits; e++)
        {
            make_random_edit();
        }
        run_diff(original, arr);
    }

});
