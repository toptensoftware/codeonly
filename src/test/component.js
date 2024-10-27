import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Component, Template, env } from "../codeonly.js";

class TestComponent extends Component
{
    constructor()
    {
        super();
        this.value = "Hello World";
        this.updateCount = 0;
    }


    update()
    {
        if (this.onUpdate)
            this.onUpdate();
        this.updateCount++;
        super.update();
    }

    static template = {
        _:  "DIV",
        $: [
            {
                _: "DIV",
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
        $: [
            TestComponent,
        ]
    })();

    assert.equal(r.rootNodes[0].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[0].innerText, "Hello World");
});

test("Invalidate Component", async () => {

   let comp = new TestComponent();
   comp.init();

   comp.invalidate();
   assert.equal(comp.updateCount, 0);
   await env.window.waitAnimationFrames();
   assert.equal(comp.updateCount, 1);
});

test("Invalidate during Update", async () => {

    let comp = new TestComponent();
    let comp2 = new TestComponent();
    comp.init();
    comp2.init();

    comp.onUpdate = function()
    {
        // This seecond component will be invalidated 
        // while the first component is being updated.
        // This component should be updated in the same
        // cycle as the original component.
        comp2.invalidate();
    }
 
    await env.window.waitAnimationFrames();
    comp.invalidate();
    assert.equal(comp.updateCount, 0);
    assert.equal(comp2.updateCount, 0);
    await env.window.waitAnimationFrames();
    assert.equal(comp.updateCount, 1);
    assert.equal(comp2.updateCount, 1);
 });

 test("deep update on", () => {

    let template = Template.compile({
        _: TestComponent,
        update: true,
        export: "comp",
    });

    let inst = template();
    inst.update();
    assert.equal(inst.comp.updateCount, 2);

 });

 test("deep update off", () => {

    let template = Template.compile({
        _: TestComponent,
        update: false,
        export: "comp",
    });

    let inst = template();
    inst.update();
    assert.equal(inst.comp.updateCount, 0);

 });

 test("deep update dynamic", () => {

    let shouldUpdate = false;

    let template = Template.compile({
        _: TestComponent,
        update: () => shouldUpdate,
        export: "comp",
    });

    let inst = template();

    inst.update();
    assert.equal(inst.comp.updateCount, 0);

    shouldUpdate = true;
    inst.update();
    assert.equal(inst.comp.updateCount, 1);

    inst.update();
    assert.equal(inst.comp.updateCount, 2);

    shouldUpdate = false;
    inst.update();
    assert.equal(inst.comp.updateCount, 2);
    inst.update();
    assert.equal(inst.comp.updateCount, 2);

 });

 test("deep update auto", () => {

    let prop_value = "foo";

    let template = Template.compile({
        _: TestComponent,
        update: "auto",
        export: "comp",
        prop: () => prop_value,
    });

    let inst = template();

    prop_value = "foo";
    inst.update();
    assert.equal(inst.comp.updateCount, 1);

    prop_value = "foo";
    inst.update();
    assert.equal(inst.comp.updateCount, 1);

    prop_value = "bar";
    inst.update();
    assert.equal(inst.comp.updateCount, 2);

    prop_value = "bar";
    inst.update();
    assert.equal(inst.comp.updateCount, 2);

 });