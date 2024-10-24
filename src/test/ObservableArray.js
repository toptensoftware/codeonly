import { test } from "node:test";
import { strict as assert } from "node:assert";
import { ObservableArray } from "../core/ObservableArray.js";

function assert_iterables(a, b)
{
    assert.deepStrictEqual(Array.from(a), Array.from(b));
}


test("constructor", () => {
    let a = new ObservableArray(1,2,3);
    assert_iterables(a, [ 1,2,3 ]);
});

test("from", () => {
    let a = ObservableArray.from([1,2,3]);
    assert_iterables(a, [ 1,2,3 ]);
});

test("isObservable", () => {
    assert(new ObservableArray().isObservable);
});


test("Events Test", () => {

    let a = new ObservableArray();
    let b = [];

    a.addListener((index, del, ins) => {
        b.splice(index, del, ...a.slice(index, index + ins));
    });

    a.push("apples", "pears", "bananas");
    assert_iterables(a, b);

    assert.equal(a[0], "apples");
    assert.equal(b[0], "apples");

    a.unshift();
    assert_iterables(a, b);
    a.unshift("foo", "bar");
    assert_iterables(a, b);

    a.shift();
    a.shift();
    assert_iterables(a, b);

    a.push();
    assert_iterables(a, b);
    a.push("foo", "bar");
    assert_iterables(a, b);

    a.pop();
    a.pop();
    assert_iterables(a, b);

    a.splice(1, 1);
    assert_iterables(a, b);
    a.splice(1, 0, "pears");
    assert_iterables(a, b);

    a.splice(1, 1, "berries");
    assert_iterables(a, b);
    a.splice(1, 1, "pears");
    assert_iterables(a, b);

    a.splice(-1, 1);
    assert_iterables(a, b);

    a.splice(100, 1, "berries");
    assert_iterables(a, b);

    a.splice(-1, 0, "bananas");
    assert_iterables(a, b);

    a.splice(-1, 1);
    assert_iterables(a, b);

/*  Observable array doens't fire events on []
    a[1] = "berries";
*/
    a.setAt(1, "berries");
    assert_iterables(a, b);

    a.splice(0),
    assert_iterables(a, b);
});




test("Initial Data", () => {
    let arr = new ObservableArray("apples", "pears", "bananas");
    assert_iterables(arr, ["apples", "pears", "bananas"]);
});

test("From", () => {
    let arr = ObservableArray.from(["apples", "pears", "bananas"]);
    assert_iterables(arr, ["apples", "pears", "bananas"]);
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