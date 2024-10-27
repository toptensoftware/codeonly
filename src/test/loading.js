import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Component, env } from "../codeonly.js";


test("loading", async () => {

    let comp = new Component();
    comp.init();

    // Busy should be false by default
    assert.equal(comp.loading, false);

    // Mark as loading
    await comp.load(async () => {
        assert.equal(comp.loading, true);
    });

    // Marking as loading should also invalidate
    assert.equal(comp.invalid, true);
});

test("loaded event", async () => {

    let comp = new Component();
    comp.init();


    let loaded = 0;
    comp.addEventListener("loaded", (ev) => {
        loaded++;
    });
    let loading = 0;
    comp.addEventListener("loading", (ev) => {
        loading++;
    });

    let envloaded = 0;
    env.addEventListener("loaded", (ev) => {
        envloaded++;
    });
    let envloading = 0;
    env.addEventListener("loading", (ev) => {
        envloading++;
    });

    let result = await comp.load(async () => {
        assert.equal(comp.loading, true);
        assert.equal(loading, 1);

        assert.equal(env.loading, true);
        assert.equal(envloading, 1);
        return 23;
    });

    assert.equal(result, 23);

    assert.equal(comp.loading, false);
    assert.equal(loaded, 1);
    assert.equal(loading, 1);

    assert.equal(env.loading, false);
    assert.equal(envloaded, 1);
    assert.equal(envloading, 1);

});
