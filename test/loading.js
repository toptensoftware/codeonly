import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Component } from "../codeonly/Component.js";

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = function(callback) 
{ 
};

test("loading", () => {

    let comp = new Component();
    comp.init();

    // Busy should be false by default
    assert.equal(comp.loading, false);

    // Mark as loading
    comp.loading = true;
    assert.equal(comp.loading, true);

    // Marking as loading should also invalidate
    assert.equal(comp.invalid, true);
});

test("loaded event", () => {

    let comp = new Component();
    comp.init();


    let triggered = 0;
    comp.addEventListener("loaded", (ev) => {
        triggered++;
    });

    // Mark as loading
    comp.loading = true;
    assert.equal(comp.loading, true);
    comp.update();
    assert.equal(triggered, 0);

    // Update again
    assert.equal(comp.loading, true);
    comp.update();
    assert.equal(triggered, 0);

    // Mark as loaded
    comp.loading = false;
    assert.equal(comp.loading, false);
    comp.update();
    assert.equal(triggered, 1);
});
