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

    assert.equal(r.rootNodes[0].childNodes.length, 1);
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

    let val = true;
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

    assert.equal(r.rootNode.childNodes.length, 6);      // test + foreach*2 + foreach head/tail sentinal

    val = false;
    r.update();

    assert.equal(r.rootNode.childNodes.length, 1);      // if placeholder

    val = true;
    r.update();

    assert.equal(r.rootNode.childNodes.length,6);      // as before
});

test("If at root", () => {

    let val = true;
    let r = compileTemplate({
        type: "DIV",
        if: () => val,
    })();

    let outer = document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode, outer.childNodes[0]);

    val = false;
    r.update();
    assert.equal(r.rootNode.nodeType, 8);
    assert.equal(r.rootNode, outer.childNodes[0]);

    val = true;
    r.update();
    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode, outer.childNodes[0]);
});

test("If at root (true)", () => {

    let r = compileTemplate({
        type: "DIV",
        if: true,
    })();

    let outer = document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 1);
});

test("If at root (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        if: false,
    })();

    let outer = document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 8);
});


test("If on fragment at root", () => {

    let val = true;
    let r = compileTemplate({
        if: () => val,
        childNodes: 
        [
            {
                type: "DIV",
            }
        ]
    })();

    let outer = document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 1);

    val = false;
    r.update();
    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 8);

    val = true;
    r.update();
    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 1);
});

