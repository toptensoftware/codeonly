import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template, Component, env } from "../codeonly.js";
import { EmbedSlot } from "../codeonly.js";


test("Empty Embed", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
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
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = env.document.createElement("span");

    assert.equal(r.rootNode.childNodes.length, 5);      // pre + post + embed head/tail sentinals + 2x spans

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes.length, 4);
    
});

test("Embedded Multiple Elements", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
                export: "slot",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = [
        env.document.createElement("span"),
        env.document.createElement("span"),
    ]

    assert.equal(r.rootNode.childNodes.length, 6);      // pre + post + embed head/tail sentinals + 2x spans

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes.length, 4);
    
});


test("Embedded with Placeholder", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
                export: "slot",
            },
            {
                else: true,
                _: "span",
                text: "placeholder content",
            },
            "post",
        ]
    })();

    assert(r.slot instanceof EmbedSlot);

    r.slot.content = env.document.createElement('span');
    r.slot.content.innerText = "embedded content";

    assert.equal(r.rootNode.childNodes.length, 5);      // pre + post + embed head/tail sentinals + 2x spans
    assert.equal(r.rootNode.childNodes[2].innerText, "embedded content");

    r.slot.content = null;
    assert.equal(r.rootNode.childNodes[2].innerText, "placeholder content");
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

    static template = {
        $: [
            "apples",
            "pears",
            "bananas",
        ]
    }
}


test("Embedded Component", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
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
        _: "DIV",
        $: [
            "pre",
            {
                _: "embed-slot",
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
