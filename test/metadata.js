import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly.js";
import "./mockdom/mockdom.js";


test("Single-root", () => {

    let component = Template.compile({
        type: "DIV",
        text: "foo",
    });

    assert.equal(component.isSingleRoot, true);
});


test("Single-root fragment", () => {

    let component = Template.compile({
        childNodes: [
            "apples",
        ]
    });

    assert.equal(component.isSingleRoot, true);
});

test("Multi-root fragment", () => {

    let component = Template.compile({
        childNodes: [
            "apples",
            "pears",
            "bananas",
        ]
    });

    assert.equal(component.isSingleRoot, false);
});
