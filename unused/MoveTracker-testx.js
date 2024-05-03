import { test } from "node:test";
import { strict as assert } from "node:assert";
import { MoveTracker } from "../codeonly/MoveTracker.js";


test("Move Tracker", () => {

    let mt = new MoveTracker();
    
    mt.insert(5,2);
    assert.equal(mt.convert(10), 12);

    mt.delete(7,2);
    assert.equal(mt.convert(10), 10);

    mt = new MoveTracker();
    mt.move(3, 10, 2);
    assert.equal(mt.convert(5), 3);
    assert.equal(mt.convert(13), 13);

    mt = new MoveTracker();
    mt.move(8, 5, 2);
    assert.equal(mt.convert(7), 9);
    assert.equal(mt.convert(10), 10);

});

