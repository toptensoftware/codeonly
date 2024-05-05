import { test } from "node:test";
import { strict as assert } from "node:assert";
import { diff } from "../codeonly/diff.js";
    
function run_diff(a, b)
{
    let r = [...a];
    for (let o of diff(a,b))
    {
        if (o.op == 'insert')
        {
            r.splice(o.index, 0, ...b.slice(o.index, o.index + o.count));
        }
        else if (o.op == 'delete')
        {
            r.splice(o.index, o.count);
        }
        else
        {
            assert(false);
        }
    };
    assert.deepStrictEqual(r, b);
}

test("No-op", () => {
    run_diff(
        [1,2,3],
        [1,2,3]
    );
});

test("Prepend", () => {
    run_diff(
        [1,2,3],
        [-1,-2,-3,1,2,3]
    );
});

test("Append", () => {
    run_diff(
        [1,2,3],
        [1,2,3,4,5,6]
    );
});

test("Simple Insert", () => {
    run_diff(
        [1,2,3],
        [1,2,10,11,12,3]
    );
});

test("Simple Delete", () => {
    run_diff(
        [1,2,4,5,6,3],
        [1,2,3]
    );
});

test("No common trimming", () => {
    run_diff(
        [-1, 1,-100,2,3, -1],
        [-2, 1,2,+100,3, -2]
    );
});

test("Common Start", () => {
    run_diff(
        [-1, 1,-100,2,3, -1],
        [-1, 1,2,+100,3, -2]
    );
});

test("Common Start", () => {
    run_diff(
        [-1, 1,-100,2,3, -1],
        [-1, 1,2,+100,3, -2]
    );
});

test("Common End", () => {
    run_diff(
        [-1, 1,-100,2,3, -1],
        [-2, 1,2,+100,3, -1]
    );
});

test("Common Start/End", () => {
    run_diff(
        [-1, 1,-100,2,3, -1],
        [-1, 1,2,+100,3, -1]
    );
});

