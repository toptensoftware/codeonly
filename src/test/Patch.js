import { test } from "node:test";
import { strict as assert } from "node:assert";
import { ObservableArray, Patch, deepEqual } from "../codeonly.js";

// Removing Patch class, don't like it.

/*

test("update_always", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 4, berries: 5 }

    Patch.update_always(a, b);

    assert.deepStrictEqual(a, b);
});

test("Patch.update_different() with Diff, different property values", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2, oranges: 5 }

    let diff = Patch.update_different(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("Patch.update_different() with Diff, add prop", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2, oranges: 3, berries: 5 }

    let diff = Patch.update_different(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("Patch.update_different() with Diff, remove prop", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2 }

    let diff = Patch.update_different(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("Patch.update_different() with Diff, no diff", () => {

    let a = { apples: 1, pears: 2 } 
    let b = { apples: 1, pears: 2 }

    let diff = Patch.update_different(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, false);

});

test("Patch.Array insert", () => {

    let target = [];
    let source = [ 1, 2, 3 ];

    Patch.array(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);

});

test("Patch.Array delete", () => {

    let target = [ 1, 2, 3 ];
    let source = [  ];

    Patch.array(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);
});

test("Patch.Array insert and delete", () => {

    let target = [ 1, 2, 3, 4, 5 ];
    let source = [ 1, 3, 4, 9, 10, 5 ];

    Patch.array(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);
});

test("Patch.Array update deep", () => {

    let initial = [
        { id: 1, name: "apples" },
        { id: 2, name: "pears", },
        { id: 3, name: "bananas", }
    ];

    let target = ObservableArray.from(initial);

    let varied = [
        { id: 1, name: "apples" },
        { id: 2, name: "berries", },
        { id: 3, name: "bananas", }
    ];

    let edits = 0;
    Patch.array(target, varied, 
        (a, b) => a.id == b.id,
        (a, b, index) => {
            if (Patch.update_different(a,b))
            {
                edits++;
                return true;
            }
            return false;
        }
    );

    assert.equal(edits, 1);
    assert.deepEqual(target, varied);
});

test("Patch.Array replace deep", () => {

    let initial = [
        { id: 1, name: "apples" },
        { id: 2, name: "pears", },
        { id: 3, name: "bananas", }
    ];

    let target = ObservableArray.from(initial);

    let varied = [
        { id: 1, name: "apples" },
        { id: 2, name: "berries", },
        { id: 3, name: "bananas", }
    ];

    let edits = 0;
    Patch.array(target, varied, 
        (a, b) => a.id == b.id,
        (a, b, index) => {
            let retv = Patch.replace_different(a,b);
            if (!retv)
                return retv;

            edits++;
            return retv;
        }
    );

    assert.equal(edits, 1);
    assert.strictEqual(target[1], varied[1]);
    assert.deepEqual(target, varied);
});

*/