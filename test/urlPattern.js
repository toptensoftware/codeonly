import { test } from "node:test";
import { strict as assert } from "node:assert";
import { urlPattern } from "../codeonly/urlPattern.js";


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




test("Zero or more internal segments", () => {

    let rx = new RegExp(urlPattern("/foo/:segs*/bar"));
    console.log(rx);
    
    
    let m = "/foo/bar".match(rx);
    assert.equal(m.groups.segs, "");

    m = "/foo/123/bar".match(rx);
    assert.equal(m.groups.segs, "123/");

    m = "/foo/123/456/789/bar".match(rx);
    assert.equal(m.groups.segs, "123/456/789/");
});




test("Zero or more segments at end", () => {

    let rx = new RegExp(urlPattern("/foo/:segs*"));
    console.log(rx);
    
    
    let m = "/foo/bar".match(rx);
    assert.equal(m.groups.segs, "bar");

    m = "/foo/123/bar".match(rx);
    assert.equal(m.groups.segs, "123/bar");

    m = "/foo/123/456/789/bar".match(rx);
    assert.equal(m.groups.segs, "123/456/789/bar");

    m = "/foo/123/456/789/bar/".match(rx);
    assert.equal(m.groups.segs, "123/456/789/bar/");
});






test("One or more internal segments", () => {

    let rx = new RegExp(urlPattern("/foo/:segs+/bar"));
    console.log(rx);
    
    
    let m = "/foo/bar".match(rx);
    assert(!m);

    m = "/foo/123/bar".match(rx);
    assert.equal(m.groups.segs, "123/");

    m = "/foo/123/456/789/bar".match(rx);
    assert.equal(m.groups.segs, "123/456/789/");
});




test("One or more segments at end", () => {

    let rx = new RegExp(urlPattern("/foo/:segs+"));
    console.log(rx);
    
    
    let m = "/foo/".match(rx);
    assert(!m);

    m = "/foo/123/bar".match(rx);
    assert.equal(m.groups.segs, "123/bar");

    m = "/foo/123/456/789/bar".match(rx);
    assert.equal(m.groups.segs, "123/456/789/bar");

    m = "/foo/123/456/789/bar/".match(rx);
    assert.equal(m.groups.segs, "123/456/789/bar/");
});




