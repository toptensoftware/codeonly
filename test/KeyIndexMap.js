import { test } from "node:test";
import { strict as assert } from "node:assert";
import { KeyIndexMap } from "../codeonly/KeyIndexMap.js";

test("KeyIndexMap", () => {

    let map = new KeyIndexMap();

    assert.equal(map.get("a"), undefined);

    map.add("a", { index: 23 });
    assert.equal(map.get("a").index, 23);

    map.add("a", { index: 24 });
    assert.equal(map.get("a").index, 23);

    map.delete("a", 23);
    assert.equal(map.get("a").index, 24);

    map.delete("a", 24);
    assert.equal(map.get("a"), undefined);

    map.add("a", { index: 10 } );
    map.add("a", { index: 11 });
    map.add("a", { index: 12 });
    map.delete("a", 11);
    assert.equal(map.get("a").index, 10);
    map.delete("a", 10);
    assert.equal(map.get("a").index, 12);
    map.delete("a", 12);
    assert.equal(map.get("a"), undefined); 
});