import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

test("Static Comment", () => {
    let r = Template.compile({
        type: "comment",
        text: "foo",
    })();

    assert.equal(r.rootNode.nodeType, 8);
    assert.equal(r.rootNode.nodeValue, "foo");
});

test("Dynamic Comment", () => {
    let val = "foo";
    let r = Template.compile({
        type: "comment",
        text: () => val,
    })();

    assert.equal(r.rootNode.nodeType, 8);
    assert.equal(r.rootNode.nodeValue, "foo");

    val = "bar";
    r.update();
    assert.equal(r.rootNode.nodeValue, "bar");

    val = "baz";
    r.update();
    assert.equal(r.rootNode.nodeValue, "baz");
});

test("Single Node", () => {

    let r = Template.compile({
        type: "DIV",
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
});

test("Static Text Node", () => {

    let r = Template.compile("Hello World")();

    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, "Hello World");
});

test("Dynamic Text Node", () => {

    let val = "foo";
    let r = Template.compile(() => val)();

    let outer = document.createElement("div");
    outer.append(...r.rootNodes);

    assert.equal(outer.childNodes.length, 3);
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    let contentNodes = outer.childNodes.filter(x => x.nodeType != 8);
    assert.equal(contentNodes.length, 1);
    assert.equal(contentNodes[0].nodeType, 3);
    assert.equal(contentNodes[0].nodeValue, val);

    val = "bar";
    r.update();
    assert.equal(outer.childNodes.length, 3);
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    contentNodes = outer.childNodes.filter(x => x.nodeType != 8);
    assert.equal(contentNodes.length, 1);
    assert.equal(contentNodes[0].nodeType, 3);
    assert.equal(contentNodes[0].nodeValue, val);
});

test("Static HTML Node", () => {

    let r = Template.compile(html("Hello World"))();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].innerHTML, "Hello World");
});

test("Dynamic HTML Node", () => {

    let val = "foo";
    let r = Template.compile(() => html(val))();

    let contentNodes = r.rootNodes.filter(x => x.nodeType != 8);
    assert.equal(contentNodes[0].nodeType, 3);
    assert.equal(contentNodes[0].nodeValue, val);

    val = "bar";
    r.update();

    contentNodes = r.rootNodes.filter(x => x.nodeType != 8);
    assert.equal(contentNodes[0].nodeType, 3);
    assert.equal(contentNodes[0].nodeValue, val);
});


test("Text Node", () => {

    let r = Template.compile("Hello World")();

    assert.equal(r.rootNodes[0].nodeType, 3);
    assert.equal(r.rootNodes[0].nodeValue, "Hello World");
});

test("Inner Text", () => {

    let r = Template.compile({
        type: "DIV",
        text: "Hello World",
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
    assert.equal(r.rootNodes[0].innerText, "Hello World");
});

test("Inner HTML", () => {

    let r = Template.compile({
        type: "DIV",
        text: html("Hello World"),
    })();

    assert.equal(r.rootNodes[0].nodeName, "DIV");
    assert.equal(r.rootNodes[0].innerHTML, "Hello World");
});

test("Dynamic Text", () => {

    let text = 'foo';
    let r = Template.compile({
        type: "DIV",
        text: () => text,
    })();

    assert.equal(r.rootNodes[0].innerText, "foo");

    text = 'bar';
    r.update();
    assert.equal(r.rootNodes[0].innerText, "bar");
});


test("Static ID Attribute", () => {

    let r = Template.compile({
        type: "DIV",
        id: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("id"), "foo");
});

test("Dynamic ID Attribute", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        id: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("id"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("id"), val);
});

test("Static Class Attribute", () => {

    let r = Template.compile({
        type: "DIV",
        class: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), "foo");
});

test("Dynamic Class Attribute", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        class: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("class"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("class"), val);
});


test("Static Boolean Class", () => {

    let r = Template.compile({
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
    let r = Template.compile({
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

test("Static Style", () => {

    let r = Template.compile({
        type: "DIV",
        style_backgroundColor: "red",
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "background-color: red");
});

test("Dynamic Style", () => {

    let val = "red";
    let r = Template.compile({
        type: "DIV",
        style_backgroundColor: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "background-color: red");

    val = "green";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "background-color: green");

    val = "blue";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "background-color: blue");
});


test("Static Shown", () => {

    let r = Template.compile({
        type: "DIV",
        show: false,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "display: none");
});

test("Dynamic Shown (with prior display set)", () => {

    let val = true;
    let r = Template.compile({
        type: "DIV",
        style: "display: flex",
        show: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "display: flex");

    val = false;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "display: none");

    val = true;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "display: flex");
});

test("Dynamic Shown (without prior display set)", () => {

    let val = true;
    let r = Template.compile({
        type: "DIV",
        style: "",
        show: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "");

    val = false;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "display: none");

    val = true;
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), "");
});


test("Static Style Attribute", () => {

    let r = Template.compile({
        type: "DIV",
        style: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), "foo");
});

test("Dynamic Style Attribute", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        style: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("style"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("style"), val);
});


test("Static Attribute", () => {

    let r = Template.compile({
        type: "DIV",
        attr_dataMyData: "foo",
    })();

    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), "foo");
});

test("Dynamic Attribute", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        attr_dataMyData: () => val,
    })();

    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].getAttribute("data-my-data"), val);
});
