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
        else if (o.op == 'skip')
        {
            // nop
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


test("Overlapping move left", () => {
    run_str_diff(
        "abcd*e#fg",
        "a*b#cdefg",
    );
});

test("Overlapping move right", () => {
    run_str_diff(
        "a*b#cdefg",
        "abcd*e#fg",
    );
});

test("Swap Positions", () => {
    run_str_diff(
        "a*bcde#fg",
        "a#bcde*fg",
    );
});


test("XXX", () => {
    
    run_diff(
        [274,280,281,276,277,256,216,278,279,189,234,275,181,306,307,273,310,297,321,322,323,324,325,326,311,312,313,314,315,316,317,318,215,308,309,293,319,320,294,296,290,263,239,287,292,291,299,300,301,302,303,304,305,240,183,288,284,285,286,257,245,246,289,235,298,261,184],
        [274,280,281,276,277,181,306,307,273,310,256,216,316,317,318,215,308,278,325,326,311,312,313,314,315,309,293,319,320,294,296,290,263,239,287,292,291,299,300,301,302,303,304,327,328,329,330,331,305,240,183,288,284,285,261,184],
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
