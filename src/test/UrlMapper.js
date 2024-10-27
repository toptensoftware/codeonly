import { test } from "node:test";
import { strict as assert } from "node:assert";

import { UrlMapper } from "../core/UrlMapper.js";

test("internalize with base", () => {
    let um = new UrlMapper({ base: "/base/" });

    let r = um.internalize(new URL("http://co/base/"));
    assert.equal(r.href, "http://co/");

    r = um.internalize(new URL("http://co/base/subpath?q=1#hash"));
    assert.equal(r.href, "http://co/subpath?q=1#hash");

});

test("externalize with base", () => {
    let um = new UrlMapper({ base: "/base/" });

    let r = um.externalize(new URL("http://co/"));
    assert.equal(r.href, "http://co/base/");

    r = um.externalize(new URL("http://co/subpath?q=1#hash"));
    assert.equal(r.href, "http://co/base/subpath?q=1#hash");

});

test("internalize with hash", () => {
    let um = new UrlMapper({ hash: true });

    let r = um.internalize(new URL("http://co/#/"));
    assert.equal(r.href, "http://co/");

    r = um.internalize(new URL("http://co/#/path?q=1#hash"));
    assert.equal(r.href, "http://co/path?q=1#hash");
    assert.equal(r.pathname, "/path");
    assert.equal(r.search, "?q=1");
    assert.equal(r.hash, "#hash");
});

test("externalize with hash", () => {
    let um = new UrlMapper({ hash: true });

    let r = um.externalize(new URL("http://co/"));
    assert.equal(r.href, "http://co/#/");

    r = um.externalize(new URL("http://co/path?q=1#hash"));
    assert.equal(r.href, "http://co/#/path?q=1#hash");
});