import { suite, test } from "node:test";
import { strict as assert } from "node:assert";
import { urlPattern } from "../codeonly/Utils.js";


/*
test("Extract array", () => {

    let input = [1,2,3,4,5,6,7,8];
    let output = separate_array(input, x => x % 2 == 0);

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

*/


test("Simple", () => {

    let rx = new RegExp(urlPattern("/foo/bar/"));
    console.log(rx);
    
    assert("/foo/bar/".match(rx));
    assert(!"/foo/bar/other".match(rx));

});


test("Any Char", () => {

    let rx = new RegExp(urlPattern("/foo/???/other"));
    console.log(rx);
    
    assert("/foo/bar/other".match(rx));
    assert(!"/foo/barx/other".match(rx));

});

test("Any Chars", () => {

    let rx = new RegExp(urlPattern("/foo/*/baz"));
    console.log(rx);
    
    assert("/foo/bar/baz".match(rx));
    assert("/foo/barx/baz".match(rx));
    assert(!"/foo/barx/other".match(rx));

});

test("ID Matching", () => {

    let rx = new RegExp(urlPattern("/foo/:id/baz"));
    console.log(rx);
    
    let m = "/foo/bar/baz".match(rx);
    assert.equal(m.groups.id, "bar");

});

test("Multiple ID Matching", () => {

    let rx = new RegExp(urlPattern("/foo/:id-:subid/baz"));
    console.log(rx);
    
    let m = "/foo/main-sub/baz".match(rx);
    assert.equal(m.groups.id, "main");
    assert.equal(m.groups.subid, "sub");

});



test("ID Matching with RegExp", () => {

    let rx = new RegExp(urlPattern("/foo/:id(\\d+)/baz"));
    console.log(rx);
    
    let m = "/foo/123/baz".match(rx);
    assert.equal(m.groups.id, "123");

    assert(!"/foo/bar/baz".match(rx));
});


test("ID Matching with RegExp (value choice)", () => {

    let rx = new RegExp(urlPattern("/foo/:id(apples|pears|bananas)/baz"));
    console.log(rx);
    
    assert("/foo/apples/baz".match(rx));
    assert("/foo/pears/baz".match(rx));
    assert("/foo/bananas/baz".match(rx));
    assert(!"/foo/strawberries/baz".match(rx));
});


test("Optional Trailing Slash", () => {

    let rx = new RegExp(urlPattern("/foo/bar"));
    console.log(rx);
    
    assert("/foo/bar".match(rx));
    assert("/foo/bar/".match(rx));

    rx = new RegExp(urlPattern("/foo/bar/"));
    console.log(rx);
    
    assert("/foo/bar".match(rx));
    assert("/foo/bar/".match(rx));
});




