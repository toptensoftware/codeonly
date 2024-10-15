import { test } from "node:test";
import { strict as assert } from "node:assert";
import { nextFrame, postNextFrame } from "../codeonly/nextFrame.js";

// Mock requestAnimationFrame
let pendingCallbacks = [];
globalThis.requestAnimationFrame = function(callback) 
{ 
    pendingCallbacks.push(callback);
};

function mock_dispatch()
{
    let temp = pendingCallbacks;
    pendingCallbacks = [];
    temp.forEach(x => x());
}

test("single", () => {

    let invoked = false;
    nextFrame(() => { invoked = true });
    mock_dispatch();
    assert(invoked);

});

test("multiple", () => {

    let invoked = 0;
    nextFrame(() => { invoked++ });
    nextFrame(() => { invoked++ });
    nextFrame(() => { invoked++ });
    mock_dispatch();
    assert.equal(invoked, 3);

});

test("sorted", () => {

    let order = [];
    nextFrame(() => { order.push(-100); }, -100);
    nextFrame(() => { order.push(0); }, 0);
    nextFrame(() => { order.push(100); }, 100);
    nextFrame(() => { order.push(0); }, 0);
    nextFrame(() => { order.push(-100); }, -100);
    nextFrame(() => { order.push(100); }, 100);
    mock_dispatch();
    assert.deepStrictEqual(order, [-100, -100, 0, 0, 100, 100]);

});

test("postNextFrame (immediate)", () => {
    let invoked = 0;
    postNextFrame(() => invoked++);
    assert.equal(invoked, 1);
});

test("postNextFrame (delayed)", () => {
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
    mock_dispatch();
    assert.deepEqual(invoked, [0, 1, 1, 3]);
});