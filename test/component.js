import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Component } from "../codeonly/codeonly.js";
import "./mockdom.js";

class TestComponent extends Component
{
    constructor()
    {
        super();
        this.value = "Hello World";
        this.update();
    }
}

Component.declareTemplate(TestComponent, {
    type:  "DIV",
    childNodes: [
        {
            type: "DIV",
            text: c => c.value,
        }
    ],
});

test("Instantiate Component", () => {

    let c = new TestComponent();
    assert(c.rootNode != null);
    assert.equal(c.rootNodes.length, 1);
    assert(!c.isMultiRoot);
});


test("Access Component Property from Template", () => {

    let c = new TestComponent();
    assert.equal(c.rootNode.childNodes[0].innerText, "Hello World");
});


test("Update Component", () => {

    let c = new TestComponent();
    assert.equal(c.rootNode.childNodes[0].innerText, "Hello World");

    c.value = "foo";
    c.update();
    assert.equal(c.rootNode.childNodes[0].innerText, "foo");
});
