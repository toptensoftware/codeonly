import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Single-root", () => {

    let component = Template.compile({
        type: "DIV",
        text: "foo",
    });

    assert.equal(component.isMultiRoot, false);
});


test("Multi-root", () => {

    let component = Template.compile({
        text: "foo",
    });

    assert.equal(component.isMultiRoot, true);
});
