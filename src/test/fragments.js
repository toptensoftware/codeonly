import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template, env } from "../codeonly.js";


test("Fragment", () => {
    let r = Template.compile({
        $: [
            { _: "SPAN", text: "foo" },
            { _: "SPAN", text: "bar" },
        ]
    })();
    assert.equal(r.rootNodes.length, 2);
});

test("Fragment (with conditional)", () => {
    let val = false;
    let r = Template.compile({
        $: [
            { _: "SPAN", text: "foo", if: () => val },
            { _: "SPAN", text: "bar" },
        ]
    })();

    assert.equal(r.rootNodes.length, 2);
    assert.equal(r.rootNodes[0].nodeType, 8);

    // Attach the root nodes to a div so replaceWith works
    let outer = env.document.createElement("DIV");
    outer.append(...r.rootNodes);

    // Condition true
    val = true;
    r.update();
    assert.equal(r.rootNodes.length, 2);
    assert.equal(r.rootNodes[0].nodeType, 1);

    // Condition false
    val = false;
    r.update();
    assert.equal(r.rootNodes.length, 2);
    assert.equal(r.rootNodes[0].nodeType, 8);
});

test("Nested Fragment", () => {
    let r = Template.compile({
        $: [
            { _: "SPAN", text: "foo" },
            { 
                $: [ "A", "B", "C" ]
            },
        ]
    })();
    assert.equal(r.rootNodes.length, 4);
});

test("Double Nested Fragment", () => {
    let r = Template.compile({
        $: [
            { 
                $: [
                    {
                        $: [
                            "A", "B", "C",
                        ]
                    }
                ]
            },
        ]
    })();
    assert.equal(r.rootNodes.length, 3);
});


test("Double Nested Fragment (with conditional)", () => {
    let val1 = true;
    let val2 = true;
    let r = Template.compile({
        $: [
            { 
                if: () => val1,
                $: [
                    "A", "B",
                    {
                        if: () => val2,
                        $: ["C", "D", "E"],
                    }
                ],
            },
        ]
    })();

    // Attach the root nodes to a div so replaceWith works
    let outer = env.document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);

    val1 = false;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    assert.equal(outer.childNodes.length, 1);
    assert.equal(outer.childNodes[0].nodeType, 8);

    val1 = true;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes

    val1 = true;
    val2 = false;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    assert.equal(outer.childNodes.length, 3);
    assert.equal(outer.childNodes[0].nodeType, 3);
    assert.equal(outer.childNodes[1].nodeType, 3);
    assert.equal(outer.childNodes[2].nodeType, 8);

    val1 = true;
    val2 = true;
    r.update();
    assert.deepStrictEqual(outer.childNodes, r.rootNodes);
    assert.equal(outer.childNodes.length, 5);
    assert(outer.childNodes.every(x => x.nodeType == 3));       // 5x text nodes
});

