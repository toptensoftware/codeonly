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