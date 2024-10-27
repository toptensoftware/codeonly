import { test } from "node:test";
import { strict as assert } from "node:assert";

import "./mockdom.js";
import { env } from "../core/Environment.js";

test("sessionStorage", () => {

    env.reset();
    assert.equal(env.window.sessionStorage.getItem("x"), null);

    env.window.sessionStorage.setItem("x", "y");
    assert.equal(env.window.sessionStorage.getItem("x"), "y");

});

test("history initial state", () => {
    env.reset();
    assert.equal(env.window.location.href, "http://toptensoftware.com/");
    assert.equal(env.window.history.state, null);
});

test("history replace state", async () => {
    env.reset();

    let state = {x:1};
    env.window.history.replaceState(state, null);

    assert.equal(env.window.location.href, "http://toptensoftware.com/");
    assert.deepEqual(env.window.history.state, state);
});

test("history replace url", async () => {
    env.reset();

    env.window.history.replaceState(null, "url");

    assert.equal(env.window.location.href, "http://toptensoftware.com/url");
    assert.deepEqual(env.window.history.state, null);
});

test("history push state", async () => {
    env.reset();

    let state = { x: 1 };
    env.window.history.pushState(state, "");

    assert.equal(env.window.location.href, "http://toptensoftware.com/");
    assert.deepEqual(env.window.history.state, state);
});

test("push url", async () => {
    env.reset();

    env.window.history.pushState(null, "", "url");

    assert.equal(env.window.location.href, "http://toptensoftware.com/url");
    assert.deepEqual(env.window.history.state, null);
});

test("popstate", async () => {
    env.reset();

    // Setup listener
    let pops = [];
    env.window.addEventListener("popstate", ev => {
        pops.push({
            state: ev.state,
            location: env.window.location,
        });
    });

    // Push 2 states
    let state1 = { x: 1 };
    env.window.history.pushState(state1, "", "url1");
    let state2 = { x: 2 };
    env.window.history.pushState(state2, "", "url2");

    // Go back once
    env.window.history.go(-1);
    await env.window.waitAnimationFrames();
    assert.equal(env.window.location.href, "http://toptensoftware.com/url1");
    assert.deepEqual(env.window.history.state, state1);
    assert.equal(pops.length, 1);
    assert.equal(pops[0].state, state1);
    assert.equal(pops[0].location, env.window.location);

    // Go back a second time
    env.window.history.go(-1);
    await env.window.waitAnimationFrames();
    assert.equal(pops.length, 2);
    assert.equal(env.window.location.href, "http://toptensoftware.com/");
    assert.deepEqual(env.window.history.state, null);
    assert.equal(pops[1].state, null);
    assert.equal(pops[1].location, env.window.location);

    // Go forward once
    env.window.history.go(1);
    await env.window.waitAnimationFrames();
    assert.equal(pops.length, 3);
    assert.equal(env.window.location.href, "http://toptensoftware.com/url1");
    assert.deepEqual(env.window.history.state, state1);
    assert.equal(pops[2].state, state1);
    assert.equal(pops[2].location, env.window.location);

    // Go forward again
    env.window.history.go(1);
    await env.window.waitAnimationFrames();
    assert.equal(pops.length, 4);
    assert.equal(env.window.location.href, "http://toptensoftware.com/url2");
    assert.deepEqual(env.window.history.state, state2);
    assert.equal(pops[3].state, state2);
    assert.equal(pops[3].location, env.window.location);

    // Go back twice
    env.window.history.go(-2);
    await env.window.waitAnimationFrames();
    assert.equal(env.window.location.href, "http://toptensoftware.com/");
    assert.deepEqual(env.window.history.state, null);
    assert.equal(pops.length, 5);
    assert.equal(pops[4].state, null);
    assert.equal(pops[4].location, env.window.location);
});

test("forward hash nav", async () => {
    env.reset();

    let pops = [];
    env.window.addEventListener("popstate", ev => {
        pops.push({
            state: ev.state,
            location: env.window.location,
        });
    });

    env.window.history.hashnav("foo");

    assert.equal(env.window.location.href, "http://toptensoftware.com/#foo");
    assert.deepEqual(env.window.history.state, null);
    assert.equal(pops.length, 1);
    assert.equal(pops[0].state, null);
    assert.equal(pops[0].location, env.window.location);



});
