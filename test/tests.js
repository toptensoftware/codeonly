import { test } from "node:test";
import { strict as assert } from "node:assert";

import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

test("Single Node", () => {

    let r = compileTemplate({
        type: "DIV",
    })();

    assert.equal(r.rootNode.nodeName, "DIV");
});

test("Static Text Node", () => {

    let r = compileTemplate("Hello World")();

    assert.equal(r.rootNode.nodeType, 3);
    assert.equal(r.rootNode.nodeValue, "Hello World");
});

test("Dynamic Text Node", () => {

    let val = "foo";
    let r = compileTemplate(() => val)();

    assert.equal(r.rootNode.nodeType, 3);
    assert.equal(r.rootNode.nodeValue, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.nodeType, 3);
    assert.equal(r.rootNode.nodeValue, val);
});

test("Static HTML Node", () => {

    let r = compileTemplate(html("Hello World"))();

    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode.nodeName, "SPAN");
    assert.equal(r.rootNode.innerHTML, "Hello World");
});

test("Dynamic HTML Node", () => {

    let val = "foo";
    let r = compileTemplate(() => html(val))();

    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode.nodeName, "SPAN");
    assert.equal(r.rootNode.innerHTML, val);

    val = "bar";
    r.update();

    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode.nodeName, "SPAN");
    assert.equal(r.rootNode.innerHTML, val);
});


test("Text Node", () => {

    let r = compileTemplate("Hello World")();

    assert.equal(r.rootNode.nodeType, 3);
    assert.equal(r.rootNode.nodeValue, "Hello World");
});

test("Inner Text", () => {

    let r = compileTemplate({
        type: "DIV",
        text: "Hello World",
    })();

    assert.equal(r.rootNode.nodeName, "DIV");
    assert.equal(r.rootNode.innerText, "Hello World");
});

test("Inner HTML", () => {

    let r = compileTemplate({
        type: "DIV",
        text: html("Hello World"),
    })();

    assert.equal(r.rootNode.nodeName, "DIV");
    assert.equal(r.rootNode.innerHTML, "Hello World");
});

test("Dynamic Text", () => {

    let text = 'foo';
    let r = compileTemplate({
        type: "DIV",
        text: () => text,
    })();

    assert.equal(r.rootNode.innerText, "foo");

    text = 'bar';
    r.update();
    assert.equal(r.rootNode.innerText, "bar");
});


test("Static ID Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        id: "foo",
    })();

    assert.equal(r.rootNode.getAttribute("id"), "foo");
});

test("Dynamic ID Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        id: () => val,
    })();

    assert.equal(r.rootNode.getAttribute("id"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.getAttribute("id"), val);
});

test("Static Class Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        class: "foo",
    })();

    assert.equal(r.rootNode.getAttribute("class"), "foo");
});

test("Dynamic Class Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        class: () => val,
    })();

    assert.equal(r.rootNode.getAttribute("class"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.getAttribute("class"), val);
});


test("Static Boolean Class", () => {

    let r = compileTemplate({
        type: "DIV",
        class_foo: true,
        class_bar: false,
    })();

    assert.equal(r.rootNode.getAttribute("class"), "foo");
    assert(r.rootNode.classList.has("foo"));
    assert(!r.rootNode.classList.has("bar"));
});

test("Dynamic Boolean Class", () => {

    let val = true;
    let r = compileTemplate({
        type: "DIV",
        class_foo: () => val,
    })();

    assert.equal(r.rootNode.getAttribute("class"), "foo");
    val = false;
    r.update();
    assert.equal(r.rootNode.getAttribute("class"), "");
    val = true;
    r.update();
    assert.equal(r.rootNode.getAttribute("class"), "foo");
});

test("Static Style Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        style: "foo",
    })();

    assert.equal(r.rootNode.getAttribute("style"), "foo");
});

test("Dynamic Style Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        style: () => val,
    })();

    assert.equal(r.rootNode.getAttribute("style"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.getAttribute("style"), val);
});


test("Static Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        attr_dataMyData: "foo",
    })();

    assert.equal(r.rootNode.getAttribute("data-my-data"), "foo");
});

test("Dynamic Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        attr_dataMyData: () => val,
    })();

    assert.equal(r.rootNode.getAttribute("data-my-data"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.getAttribute("data-my-data"), val);
});


test("Child Nodes", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo" },
            { type: "SPAN", text: "bar" },
        ]
    })();

    assert.equal(r.rootNode.childNodes.length, 2);
    assert.equal(r.rootNode.childNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNode.childNodes[1].nodeName, "SPAN");
});

test("Child Nodes with Dynamic", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: () => val },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].innerText, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNode.childNodes[0].innerText, val);
});


test("Conditional Child (true)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", condition: true },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
});


test("Conditional Child (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", condition: false },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 8);
});


test("Conditional Child (dynamic)", () => {

    let val = false;
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { 
                type: "DIV", 
                condition: () => val,
                childNodes: [ "A", "B", "C" ]
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 8);
    val = true;
    r.update();
    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].nodeName, "DIV");
    val = false;
    r.update();
    assert.equal(r.rootNode.childNodes[0].nodeType, 8);
});

test("Fragment", () => {
    let r = compileTemplate({
        childNodes: [
            { type: "SPAN", text: "foo" },
            { type: "SPAN", text: "bar" },
        ]
    })();
    assert(Array.isArray(r.rootNode));
    assert.equal(r.rootNode.length, 2);
});

test("Fragment (with conditional)", () => {
    let val = false;
    let r = compileTemplate({
        childNodes: [
            { type: "SPAN", text: "foo", condition: () => val },
            { type: "SPAN", text: "bar" },
        ]
    })();

    assert(Array.isArray(r.rootNode));
    assert.equal(r.rootNode.length, 2);
    assert.equal(r.rootNode[0].nodeType, 8);

    // Attach the root nodes to a div so replaceWith works
    let outer = document.createElement("DIV");
    outer.append(...r.rootNode);

    // Condition true
    val = true;
    r.update();
    assert.equal(r.rootNode.length, 2);
    assert.equal(r.rootNode[0].nodeType, 1);

    // Condition false
    val = false;
    r.update();
    assert.equal(r.rootNode.length, 2);
    assert.equal(r.rootNode[0].nodeType, 8);
});
