import { test } from "node:test";
import { strict as assert } from "node:assert";
import { updateObject, patchObject } from "../codeonly/updateObject.js";


test("Simple", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 4, berries: 5 }

    updateObject(a, b);

    assert.deepStrictEqual(a, b);
});

test("With Diff, different property values", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2, oranges: 5 }

    let diff = patchObject(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("With Diff, add prop", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2, oranges: 3, berries: 5 }

    let diff = patchObject(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("With Diff, remove prop", () => {

    let a = { apples: 1, pears: 2, oranges: 3 } 
    let b = { apples: 1, pears: 2 }

    let diff = patchObject(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, true);

});

test("With Diff, no diff", () => {

    let a = { apples: 1, pears: 2 } 
    let b = { apples: 1, pears: 2 }

    let diff = patchObject(a, b);

    assert.deepStrictEqual(a, b);
    assert.equal(diff, false);

});
