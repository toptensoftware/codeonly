import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { env, nextFrame, postNextFrame } from "../codeonly.js";


test("single", async () => {

    let invoked = false;
    nextFrame(() => { invoked = true });
    await env.window.waitAnimationFrames();
    assert(invoked);

});

test("multiple", async () => {

    let invoked = 0;
    nextFrame(() => { invoked++ });
    nextFrame(() => { invoked++ });
    nextFrame(() => { invoked++ });
    await env.window.waitAnimationFrames();
    assert.equal(invoked, 3);

});

test("sorted", async () => {

    let order = [];
    nextFrame(() => { order.push(-100); }, -100);
    nextFrame(() => { order.push(0); }, 0);
    nextFrame(() => { order.push(100); }, 100);
    nextFrame(() => { order.push(0); }, 0);
    nextFrame(() => { order.push(-100); }, -100);
    nextFrame(() => { order.push(100); }, 100);
    await env.window.waitAnimationFrames();
    assert.deepStrictEqual(order, [-100, -100, 0, 0, 100, 100]);

});

test("postNextFrame (immediate)", () => {
    let invoked = 0;
    postNextFrame(() => invoked++);
    assert.equal(invoked, 1);
});

test("postNextFrame (delayed)", async () => {
    let invoked = [];
    // Immediate
    postNextFrame(() => invoked.push(0));
    assert.deepEqual(invoked, [0]);

    // Delayed
    nextFrame(() => invoked.push(1));
    assert.deepEqual(invoked, [0]);

    // Delayed
    postNextFrame(() => invoked.push(3));
    assert.deepEqual(invoked, [0]);

    // Delayed
    nextFrame(() => invoked.push(1));
    assert.deepEqual(invoked, [0]);

    // Dispatched
    await env.window.waitAnimationFrames();
    assert.deepEqual(invoked, [0, 1, 1, 3]);
});