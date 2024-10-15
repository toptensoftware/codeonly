import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Component } from "../codeonly/Component.js";

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = function(callback) 
{ 
};

test("busy", () => {

    let comp = new Component();

    // Busy should be false by default
    assert.equal(comp.busy, false);

    // Mark as busy
    comp.busy = true;
    assert.equal(comp.busy, true);

    // Marking as busy should also invalidate
    assert.equal(comp.invalid, true);
});
