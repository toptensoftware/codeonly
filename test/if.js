import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("If Child (true)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                if: true,
                type: "SPAN", 
                text: "foo", 
            },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 1);
});


test("If Child (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", if: false },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 8);
});


test("If Child (dynamic)", () => {

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

test("If-Else Child (dynamic)", () => {

    let val = true;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                if: () => val,
                type: "DIV", 
                text: "foo",
            },
            { 
                else: true,
                type: "DIV", 
                text: "bar",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerTExt, "foo");
});


test("If Foreach Fragment", () => {

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
