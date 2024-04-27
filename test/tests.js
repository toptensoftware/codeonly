import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

test("Single Node", () => {

    let r = compileTemplate({
        type: "DIV",
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
});

test("Static Text Node", () => {

    let r = compileTemplate("Hello World")();

    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, "Hello World");
});

test("Dynamic Text Node", () => {

    let val = "foo";
    let r = compileTemplate(() => val)();

    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, val);
});

test("Static HTML Node", () => {

    let r = compileTemplate(html("Hello World"))();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].innerHTML, "Hello World");
});

test("Dynamic HTML Node", () => {

    let val = "foo";
    let r = compileTemplate(() => html(val))();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].innerHTML, val);

    val = "bar";
    r.update();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].innerHTML, val);
});


test("Text Node", () => {

    let r = compileTemplate("Hello World")();

    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, "Hello World");
});

test("Inner Text", () => {

    let r = compileTemplate({
        type: "DIV",
        text: "Hello World",
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
    assert.equal(r.rootNodes[0].innerText, "Hello World");
});

test("Inner HTML", () => {

    let r = compileTemplate({
        type: "DIV",
        text: html("Hello World"),
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
    assert.equal(r.rootNodes[0].innerHTML, "Hello World");
});

test("Dynamic Text", () => {

    let text = 'foo';
    let r = compileTemplate({
        type: "DIV",
        text: () => text,
    })();

    assert.equal(r.rootNodes[0].innerText, "foo");

    text = 'bar';
    r.update();
    assert.equal(r.rootNodes[0].innerText, "bar");
});


test("Static ID Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        id: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("id"), "foo");
});

test("Dynamic ID Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        id: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("id"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("id"), val);
});

test("Static Class Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        class: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), "foo");
});

test("Dynamic Class Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        class: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("class"), val);
});


test("Static Boolean Class", () => {

    let r = compileTemplate({
        type: "DIV",
        class_foo: true,
        class_bar: false,
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), "foo");
    assert(r.rootNodes[0].classList.has("foo"));
    assert(!r.rootNodes[0].classList.has("bar"));
});

test("Dynamic Boolean Class", () => {

    let val = true;
    let r = compileTemplate({
        type: "DIV",
        class_foo: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), "foo");
    val = false;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("class"), "");
    val = true;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("class"), "foo");
});

test("Static Style Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        style: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "foo");
});

test("Dynamic Style Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        style: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), val);
});


test("Static Attribute", () => {

    let r = compileTemplate({
        type: "DIV",
        attr_dataMyData: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), "foo");
});

test("Dynamic Attribute", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        attr_dataMyData: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), val);
});


test("Child Nodes", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo" },
            { type: "SPAN", text: "bar" },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 2);
    assert.equal(r.rootNodes[0].childNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].childNodes[1].nodeName, "SPAN");
});

test("Child Nodes with Dynamic", () => {

    let val = "foo";
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: () => val },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
});


test("Conditional Child (true)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", condition: true },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 1);
});


test("Conditional Child (false)", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo", condition: false },
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
                condition: () => val,
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

test("Fragment", () => {
    let r = compileTemplate({
        childNodes: [
            { type: "SPAN", text: "foo" },
            { type: "SPAN", text: "bar" },
        ]
    })();
    assert(Array.isArray(r.rootNode));
    assert.equal(r.rootNodes[0].length, 2);
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
    assert.equal(r.rootNodes[0].length, 2);
    assert.equal(r.rootNode[0].nodeType, 8);

    // Attach the root nodes to a div so replaceWith works
    let outer = document.createElement("DIV");
    outer.append(...r.rootNodesFlat);

    // Condition true
    val = true;
    r.update();
    assert.equal(r.rootNodes[0].length, 2);
    assert.equal(r.rootNode[0].nodeType, 1);

    // Condition false
    val = false;
    r.update();
    assert.equal(r.rootNodes[0].length, 2);
    assert.equal(r.rootNode[0].nodeType, 8);
});

test("Nested Fragment", () => {
    let r = compileTemplate({
        childNodes: [
            { type: "SPAN", text: "foo" },
            { 
                childNodes: [ "A", "B", "C" ]
            },
        ]
    })();
    assert(Array.isArray(r.rootNode));
    assert.equal(r.rootNodes[0].length, 2);
    assert.equal(r.rootNodesFlat.length, 4);
});

test("Double Nested Fragment", () => {
    let r = compileTemplate({
        childNodes: [
            { 
                childNodes: [
                    {
                        childNodes: [
                            "A", "B", "C",
                        ]
                    }
                ]
            },
        ]
    })();
    assert(Array.isArray(r.rootNode));
    assert.equal(r.rootNodes[0].length, 1);
    assert.equal(r.rootNodesFlat.length, 3);
});


test("Double Nested Fragment (with conditional)", () => {
    let val1 = true;
    let val2 = true;
    let r = compileTemplate({
        childNodes: [
            { 
                condition: () => val1,
                childNodes: [
                    "A", "B",
                    {
                        condition: () => val2,
                        childNodes: ["C", "D", "E"],
                    }
                ],
            },
        ]
    })();

    // Attach the root nodes to a div so replaceWith works
    let outer = document.createElement("DIV");
    outer.append(...r.rootNodesFlat);

    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes
    assert.deepStrictEqual(outer.childNodes, r.rootNodesFlat);

    val1 = false;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodesFlat);
    assert.equal(outer.childNodes.length, 1);
    assert.equal(outer.childNodes[0].nodeType, 8);

    val1 = true;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodesFlat);
    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes

    val1 = true;
    val2 = false;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodesFlat);
    assert.equal(outer.childNodes.length, 3);
    assert.equal(outer.childNodes[0].nodeType, 3);
    assert.equal(outer.childNodes[1].nodeType, 3);
    assert.equal(outer.childNodes[2].nodeType, 8);

    val1 = true;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodesFlat);
    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes
});



test("ForEach Static", () => {
    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            {
                foreach: [ "apples", "pears", "bananas" ],
                type: "DIV",
                text: x => x,
            }
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 3);
});

test("ForEach Dynamic", () => {

    let items = [ "apples", "pears", "bananas" ];

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                type: "DIV",
                text: x => x,
            }
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 3);

    items.push("oranges", "watermelon");
    r.update();

    assert.equal(r.rootNodes[0].childNodes.length, 5);
});
