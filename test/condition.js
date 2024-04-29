import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Conditional Child (true)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", if: true },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 1);
});


test("Conditional Child (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", if: false },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 8);
});


test("Conditional Child (dynamic)", () => {

    let val = false;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                type: "DIV", 
                if: () => val,
                childNodes: [ "A", "B", "C" ]
            },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 8);
    val = true;
    r.update();
    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[0].nodeName, "DIV");
    val = false;
    r.update();
    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 8);
});


test("Conditional Foreach", () => {

    let val = false;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            {
                if: () => val,
                childNodes: [
                    "text",
                    { 
                        foreach: [ "A", "B", "C" ],
                        type: "DIV", 
                        text: x => x,
                    },
                ]
            }
        ]
    })();

});
