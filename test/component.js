import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Component, Template } from "../codeonly/codeonly.js";
import "./mockdom/mockdom.js";

class TestComponent extends Component
{
    constructor()
    {
        super();
        this.value = "Hello World";
        this.update();
    }

    static template = {
        type:  "DIV",
        childNodes: [
            {
                type: "DIV",
                text: c => c.value,
            }
        ],
    }
}

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

test("Component as direct child node", () => {
    let r = Template.compile({
        childNodes: [
            TestComponent,
        ]
    })();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[0].innerText, "Hello World");
});