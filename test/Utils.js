import { test } from "node:test";
import { strict as assert } from "node:assert";
import { separate_array, subtract_ranges } from "../codeonly/Utils.js";

test("Extract array", () => {

    let input = [1,2,3,4,5,6,7,8];
    let output = separate_array(input, x => x % 2 == 0);

    assert.deepStrictEqual(input, [1,3,5,7]);
    assert.deepStrictEqual(output, [2,4,6,8]);
});


test("Subtract Ranges (start)", () => {

    let ranges = subtract_ranges(10, 10, [
        {index: 10, count: 2},
    ]);

    assert.deepStrictEqual(ranges, [
        { index: 12, count: 8 },
    ]);
});

test("Subtract Ranges (multiple at start)", () => {

    let ranges = subtract_ranges(10, 10, [
        {index: 10, count: 1},
        {index: 11, count: 1},
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 12, count: 8 },
    ]);
});


test("Subtract Ranges (end)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 18, count: 2}
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 8 },
    ]);
});

test("Subtract Ranges (multiple at end)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 18, count: 1},
        { index: 19, count: 1}
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 8 },
    ]);
});


test("Subtract Ranges (middle)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 15, count: 2},
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 5 },
        { index: 17, count: 3 },
    ]);
});


test("Subtract Ranges (multiple in middle)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 15, count: 1 },
        { index: 16, count: 1 },
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 5 },
        { index: 17, count: 3 },
    ]);
});


test("Subtract Ranges (multiple internal)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 12, count: 1 },
        { index: 15, count: 1 },
        { index: 18, count: 1 },
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 10, count: 2 },
        { index: 13, count: 2 },
        { index: 16, count: 2 },
        { index: 19, count: 1 },
    ]);
});


test("Subtract Ranges (start, middle, end)", () => {

    let ranges = subtract_ranges(10, 10, [
        { index: 10, count: 1 },
        { index: 15, count: 1 },
        { index: 19,count: 1 },
    ]);
    assert.deepStrictEqual(ranges, [
        { index: 11, count: 4 },
        { index: 16, count: 3 },
    ]);
});

