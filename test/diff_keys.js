import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff_keys } from "../codeonly/diff_keys.js";
import { extract_array, split_range } from "../codeonly/Utils.js";

function run_diff(oldKeys, newKeys)
{
    oldKeys = oldKeys.split("");
    newKeys = newKeys.split("");
    let r = [...oldKeys];
    let pos = 0;
    let store = [];
    let ops = diff_keys(oldKeys,newKeys);
    console.log("OLD:", oldKeys);
    console.log("NEW:", newKeys);
    for (let o of ops)
    {
        console.log(r.join(""));
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
    run_diff(
        "abcDe",
        "aDbce"
    );
});


test("Simple Down", () => {
    run_diff(
        "aDbce",
        "abcDe",
    );
});

test("Move Up and Down", () => {
    run_diff(
        "abcDefghIjklm",
        "aDbcefghjkIlm",
    );
});

test("Move Down and Up", () => {
    run_diff(
        "aDbcefghjkIlm",
        "abcDefghIjklm",
    );
});



test("Extract array", () => {

    let input = [1,2,3,4,5,6,7,8];
    let output = extract_array(input, x => x % 2 == 0);

    assert.deepStrictEqual(input, [1,3,5,7]);
    assert.deepStrictEqual(output, [2,4,6,8]);
});


test("Split Range (start)", () => {

    let ranges = split_range(10, 10, [10]);
    assert.deepStrictEqual(ranges, [
        { index: 11, count: 9 },
    ]);
});

test("Split Range (multiple at start)", () => {

    let ranges = split_range(10, 10, [10, 11, 12]);
    assert.deepStrictEqual(ranges, [
        { index: 13, count: 7 },
    ]);
});


test("Split Range (end)", () => {

    let ranges = split_range(10, 10, [19]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 9 },
    ]);
});

test("Split Range (multiple at end)", () => {

    let ranges = split_range(10, 10, [17, 18, 19]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 7 },
    ]);
});


test("Split Range (middle)", () => {

    let ranges = split_range(10, 10, [15]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 5 },
        { index: 16, count: 4 },
    ]);
});


test("Split Range (multiple in middle)", () => {

    let ranges = split_range(10, 10, [15, 16, 17]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 5 },
        { index: 18, count: 2 },
    ]);
});


test("Split Range (multiple internal)", () => {

    let ranges = split_range(10, 10, [12, 15, 18]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 2 },
        { index: 13, count: 2 },
        { index: 16, count: 2 },
        { index: 19, count: 1 },
    ]);
});


test("Split Range (start, middle, end)", () => {

    let ranges = split_range(10, 10, [10, 15, 19]);
    assert.deepStrictEqual(ranges, [
        { index: 11, count: 4 },
        { index: 16, count: 3 },
    ]);
});

