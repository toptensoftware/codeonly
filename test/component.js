import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Component, Template } from "../codeonly.js";
import "./mockdom/mockdom.js";

class TestComponent extends Component
{
    constructor()
    {
        super();
        this.value = "Hello World";
        this.updateCount = 0;
        this.update();
    }


    update()
    {
        if (this.onUpdate)
            this.onUpdate();
        this.updateCount++;
        super.update();
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

test("Invalidate Component", () => {

   let comp = new TestComponent();

   blockAnimationFrames(); 
   comp.invalidate();
   assert.equal(comp.updateCount, 1);
   dispatchAnimationFrames();
   assert.equal(comp.updateCount, 2);
});

test("Invalidate during Update", () => {

    let comp = new TestComponent();
    let comp2 = new TestComponent();

    comp.onUpdate = function()
    {
        // This seecond component will be invalidated 
        // while the first component is being updated.
        // This component should be updated in the same
        // cycle as the original component.
        comp2.invalidate();
    }
 
    blockAnimationFrames(); 
    comp.invalidate();
    assert.equal(comp.updateCount, 1);
    assert.equal(comp2.updateCount, 1);
    dispatchAnimationFrames();
    assert.equal(comp.updateCount, 2);
    assert.equal(comp2.updateCount, 2);
 });