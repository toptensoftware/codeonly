import { test } from "node:test";
import { strict as assert } from "node:assert";
import { binarySearch } from "../core/Utils.js";

test("Existing Item Lookup", () => {

    let arr = [10, 20, 30, 40, 50, 60];

    for (let i=0; i<arr.length; i++)
    {
        let find = arr[i];
        assert.equal(binarySearch(arr, (a,b) => a-b, find), i);
        assert.equal(binarySearch(arr, (a) => a-find), i);
    }

});

test("Missing Item Insert", () => {

    let start = [10, 20, 30, 40, 50, 60];
    let arr = [...start];
    let ins = [5, 15, 25, 35, 45, 55, 65];
    for (let i=0; i<ins.length; i++)
    {
        let pos = binarySearch(arr, (a, b) => a-b, ins[i]);
        assert(pos < 0);

        let index = -pos - 1;
        arr.splice(index, 0, ins[i]);
    }

    let expected = [...start, ...ins].sort((a, b) => a - b);
    assert.deepStrictEqual(arr, expected);

});