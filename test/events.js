import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly.js";
import "./mockdom/mockdom.js";


test("Event", () => {

    let triggered = false;
    let model = {};

    let r = Template.compile({
        type: "BUTTON",
        on_click: (evModel, ev) => {
            // Note triggered
            triggered = true;

            // Make sure model has been attached to the event
            assert.equal(model, evModel);
        },
        export: "button",
    })({ model });

    // Simulate click and check we got the event
    r.button.fireEvent("click", { });
    assert(triggered);

    // Destroy the DOM and check event handler was removed
    let node = r.rootNode;
    assert(node.listeners.length == 1);
    r.destroy();
    assert(node.listeners.length == 0);
});
