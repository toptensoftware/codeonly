import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template } from "../codeonly.js";


test("Single-root", () => {

    let component = Template.compile({
        _: "DIV",
        text: "foo",
    });

    assert.equal(component.isSingleRoot, true);
});


test("Single-root fragment", () => {

    let component = Template.compile({
        $: [
            "apples",
        ]
    });

    assert.equal(component.isSingleRoot, true);
});

test("Multi-root fragment", () => {

    let component = Template.compile({
        $: [
            "apples",
            "pears",
            "bananas",
        ]
    });

    assert.equal(component.isSingleRoot, false);
});
