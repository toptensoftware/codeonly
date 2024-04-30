import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("If (true)", () => {

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


test("If (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", if: false },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 0);
});


test("If", () => {

    let val = false;
    let r = compileTemplate({
        type: "DIV",
        childNodes: 
        [
            { 
                if: () => val,
                type: "DIV", 
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

test("If-Else", () => {

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
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = false;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");
});

test("If-ElseIf", () => {

    let val = 1;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                if: () => val == 1,
                type: "DIV", 
                text: "foo",
            },
            { 
                elseif: () => val == 2,
                type: "DIV", 
                text: "bar",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = 2;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");

    val = 3;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 8);
});


test("If-ElseIf-Else", () => {

    let val = 1;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                if: () => val == 1,
                type: "DIV", 
                text: "foo",
            },
            { 
                elseif: () => val == 2,
                type: "DIV", 
                text: "bar",
            },
            {
                else: true,
                type: "DIV", 
                text: "baz",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = 2;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");

    val = 3;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "baz");
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
