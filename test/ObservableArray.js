import { test } from "node:test";
import { strict as assert } from "node:assert";
import { ObservableArray } from "../codeonly.js";


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

    a.splice(0),
    assert.deepEqual(a, b);
});




test("Initial Data", () => {
    let arr = new ObservableArray("apples", "pears", "bananas");
    assert.deepStrictEqual(arr, ["apples", "pears", "bananas"]);
});

test("From", () => {
    let arr = ObservableArray.from(["apples", "pears", "bananas"]);
    assert.deepStrictEqual(arr, ["apples", "pears", "bananas"]);
});

test("touch", () => {

    let arr = new ObservableArray("apples", "pears", "bananas");

    let touched;
    arr.addListener((index, del, ins) => {
        if (del == 0 && ins == 0)
            touched = index;
    });

    arr.touch(1);
    assert.equal(touched, 1);


});