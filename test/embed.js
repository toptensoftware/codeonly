import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, EmbedSlot, Component } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Empty Embed", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            "pre",
            {
                type: EmbedSlot,
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);
    assert.equal(r.rootNode.childNodes.length, 4);      // pre + post + embed head/tail sentinals
});

test("Embedded Single Element", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            "pre",
            {
                type: EmbedSlot,
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = document.createElement("span");

    assert.equal(r.rootNode.childNodes.length, 5);      // pre + post + embed head/tail sentinals + 2x spans

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes.length, 4);
    
});

test("Embedded Multiple Elements", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            "pre",
            {
                type: EmbedSlot,
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = [
        document.createElement("span"),
        document.createElement("span"),
    ]

    assert.equal(r.rootNode.childNodes.length, 6);      // pre + post + embed head/tail sentinals + 2x spans

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes.length, 4);
    
});



class MyComponent extends Component
{
    constructor()
    {
        super()
    }

    destroy()
    {
        this.wasDestroyed = true;
        super.destroy();
    }
}

Component.declareTemplate(MyComponent, {
    childNodes: [
        "apples",
        "pears",
        "bananas",
    ]
});


test("Embedded Component", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            "pre",
            {
                type: EmbedSlot,
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = new MyComponent();

    assert.equal(r.rootNode.childNodes.length, 7);      // pre + post + embed head/tail sentinals + 3x spans from component

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes.length, 4);

});


test("Embedded Component destroyed", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            "pre",
            {
                type: EmbedSlot,
                export: "slot",
            },
            "post",
        ]
    })();

    // Create component and load it into slot
    let c = new MyComponent();
    r.slot.content = c;

    // Destroy the outer component and check the embedded inner component's 
    // destroy method was called
    r.destroy();
    assert(c.wasDestroyed);

});
