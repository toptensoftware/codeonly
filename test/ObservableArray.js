import { test } from "node:test";
import { strict as assert } from "node:assert";
import { ObservableArray } from "../codeonly/codeonly.js";


test("Events Test", () => {

    let a = new ObservableArray();
    let b = [];

    a.addListener((index, del, ins) => {
        b.splice(index, del, ...a.slice(index, index + ins));
    });

    a.push("apples", "pears", "bananas");
    assert.deepEqual(a, b);

    assert.equal(a[0], "apples");
    assert.equal(b[0], "apples");

    a.unshift();
    assert.deepEqual(a, b);
    a.unshift("foo", "bar");
    assert.deepEqual(a, b);

    a.shift();
    a.shift();
    assert.deepEqual(a, b);

    a.push();
    assert.deepEqual(a, b);
    a.push("foo", "bar");
    assert.deepEqual(a, b);

    a.pop();
    a.pop();
    assert.deepEqual(a, b);

    a.splice(1, 1);
    assert.deepEqual(a, b);
    a.splice(1, 0, "pears");
    assert.deepEqual(a, b);

    a.splice(1, 1, "berries");
    assert.deepEqual(a, b);
    a.splice(1, 1, "pears");
    assert.deepEqual(a, b);

    a.splice(-1, 1);
    assert.deepEqual(a, b);

    a.splice(100, 1, "berries");
    assert.deepEqual(a, b);

    a.splice(-1, 0, "bananas");
    assert.deepEqual(a, b);

    a.splice(-1, 1);
    assert.deepEqual(a, b);

    a[1] = "berries";
    assert.deepEqual(a, b);
});

