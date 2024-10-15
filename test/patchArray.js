import { test } from "node:test";
import { strict as assert } from "node:assert";
import { ObservableArray, patchArray, deepEqual } from "../codeonly.js";


test("Insert", () => {

    let target = [];
    let source = [ 1, 2, 3 ];

    patchArray(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);

});

test("Delete", () => {

    let target = [ 1, 2, 3 ];
    let source = [  ];

    patchArray(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);
});

test("Insert and Delete", () => {

    let target = [ 1, 2, 3, 4, 5 ];
    let source = [ 1, 3, 4, 9, 10, 5 ];

    patchArray(target, source, (a, b) => a == b);

    assert.deepStrictEqual(target, source);
});

test("Deep", () => {

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
    patchArray(target, varied, 
        (a, b) => a.id == b.id,
        (a, b, index) => {
            if (!deepEqual(a, b, index))
            {
                edits++;
                Object.assign(a, b);
                target.touch(index);
            }
        }
    );

    assert.equal(edits, 1);
    assert.deepEqual(target, varied);
});