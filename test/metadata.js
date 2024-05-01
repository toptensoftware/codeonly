import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Single-root", () => {

    let component = compileTemplate({
        type: "DIV",
        text: "foo",
    });

    assert.equal(component.isMultiRoot, false);
});


test("Multi-root", () => {

    let component = compileTemplate({
        text: "foo",
    });

    assert.equal(component.isMultiRoot, true);
});
