import { test } from "node:test";
import { strict as assert } from "node:assert";
import { MoveTracker } from "../codeonly/MoveTracker.js";


test("Move Tracker", () => {

    let mt = new MoveTracker();
    
    mt.insert(2);
    assert.equal(mt.convert(10), 12);

    mt.delete(2);
    assert.equal(mt.convert(10), 10);

    mt = new MoveTracker();
    mt.trackMove({ from: 3, to: 10, count: 2});
    assert.equal(mt.convert(5), 3);
    assert.equal(mt.convert(13), 13);

    mt = new MoveTracker();
    mt.trackMove({ from: 8, to: 5, count: 2});
    assert.equal(mt.convert(7), 9);
    assert.equal(mt.convert(10), 10);

});

