import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff } from "../codeonly/diff.js";
import { MoveTracker, KeyIndexMap, diff_keys } from "../codeonly/diff_keys.js";

function run_str_diff(oldKeys, newKeys)
{
    oldKeys = oldKeys.split("");
    newKeys = newKeys.split("");
    return run_diff(oldKeys, newKeys);
}

function run_diff(oldKeys, newKeys)
{
    let r = [...oldKeys];
    let pos = 0;
    let store = [];
    let ops = diff_keys(oldKeys,newKeys);
    console.log("OLD:", oldKeys.join(","));
    console.log("NEW:", newKeys.join(","));

    for (let o of ops)
    {
        console.log(r.join(","));
        console.log(o);
        assert(o.index == pos);
        if (o.op == 'insert')
        {
            r.splice(o.index, 0, ...newKeys.slice(o.index, o.index + o.count));
            pos += o.count;
        }
        else if (o.op == 'delete')
        {
            r.splice(o.index, o.count);
        }
        else if (o.op == 'move')
        {
            assert(o.fromIndex > o.index);
            let sourceKeys = r.slice(o.fromIndex, o.fromIndex + o.count);
            r.splice(o.fromIndex, o.count);
            r.splice(o.index, 0, ...sourceKeys);
            pos += o.count;
        }
        else if (o.op == 'store')
        {
            assert(o.storeIndex == store.length);
            store.push(...r.slice(o.index, o.index + o.count));
            r.splice(o.index, o.count);
        }
        else if (o.op == 'restore')
        {
            r.splice(o.index, 0, ...store.slice(o.storeIndex, o.storeIndex + o.count));
            pos += o.count;
        }
        else if (o.op == 'keep')
        {
            pos += o.count;
        }
        else
        {
            throw new Error("unknown diff operation");
        }
    };
    console.log(r);
    assert.equal(pos, r.length);
    assert.deepStrictEqual(r, newKeys);
}






test("Simple Move Up", () => {
    run_str_diff(
        "abcDe",
        "aDbce"
    );
});


test("Simple Down", () => {
    run_str_diff(
        "aDbce",
        "abcDe",
    );
});

test("Move Up and Down", () => {
    run_str_diff(
        "abcDefghIjklm",
        "aDbcefghjkIlm",
    );
});

test("Move Up and Down Multiple", () => {
    run_str_diff(
        "abcDEfghIJklm",
        "aDEbcfghkIJlm",
    );
});

test("Move Down and Up", () => {
    run_str_diff(
        "aDbcefghjkIlm",
        "abcDefghIjklm",
    );
});


test("Stress Test", () => {

    run_diff(
        [10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29],
        [10,22,23,25,11,12,13,24,30,31,32,33,34,35,14,15,16,17,18,19,20,21,26,27,28,29]
    );
});

/*
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

});*/