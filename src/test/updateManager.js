import { test } from "node:test";
import { strict as assert } from "node:assert";
import { UpdateManager } from "../core/UpdateManager.js";

test("update manager", () => {

    // Create an update manager
    let um = new UpdateManager();

    // A source object to fire updates from
    let so = {};

    // Handler to count callbacks
    let count = 0;
    function handler(o)
    {
        assert.equal(so, o);
        count++;
    }

    // Add listener
    um.addListener(so, handler);

    // Fire on two objects, check only heard from one
    um.fire(so);
    um.fire({});
    assert.equal(count, 1);

    // Add a second listener, ensure fires twice
    count = 0;
    um.addListener(so, handler);
    um.fire(so);
    assert.equal(count, 2);

    // Remove second listener, ensure fires once
    count = 0;
    um.removeListener(so, handler);
    um.fire(so);
    assert.equal(count, 1);

    // Remove last listener, ensure not fired
    count = 0;
    um.removeListener(so, handler);
    um.fire(so);
    assert.equal(count, 0);

    function handler2(o, p1, p2)
    {
        assert.equal(o, so);
        assert.equal(p1, "1");
        assert.equal(p2, "2");
        count++;
    }

    count = 0;
    um.addListener(so, handler2);

});