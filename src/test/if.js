import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, IfBlock, Environment } from "../codeonly.js";
import "./mockdom.js";


test("If (true)", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            { 
                if: true,
                _: "SPAN", 
                text: "foo", 
            },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 1);
});


test("If (false)", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            { _: "SPAN", text: "foo", if: false },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 1);
});


test("If", () => {

    let val = false;
    let r = Template.compile({
        _: "DIV",
        $: 
        [
            { 
                if: () => val,
                _: "DIV", 
                $: [ "A", "B", "C" ]
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

test("If-Else", () => {

    let val = true;
    let r = Template.compile({
        _: "DIV",
        $: [
            { 
                if: () => val,
                _: "DIV", 
                text: "foo",
            },
            { 
                else: true,
                _: "DIV", 
                text: "bar",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = false;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");
});

test("If-ElseIf", () => {

    let val = 1;
    let r = Template.compile({
        _: "DIV",
        $: [
            { 
                if: () => val == 1,
                _: "DIV", 
                text: "foo",
            },
            { 
                elseif: () => val == 2,
                _: "DIV", 
                text: "bar",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = 2;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");

    val = 3;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 8);
});


test("If-ElseIf-Else", () => {

    let val = 1;
    let r = Template.compile({
        _: "DIV",
        $: [
            { 
                if: () => val == 1,
                _: "DIV", 
                text: "foo",
            },
            { 
                elseif: () => val == 2,
                _: "DIV", 
                text: "bar",
            },
            {
                else: true,
                _: "DIV", 
                text: "baz",
            },
        ]
    })();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");

    val = 2;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "bar");

    val = 3;
    r.update();

    assert.equal(r.rootNode.childNodes[0].nodeType, 1);
    assert.equal(r.rootNode.childNodes[0].innerText, "baz");
});

test("If Foreach Fragment", () => {

    let val = true;
    let r = Template.compile({
        _: "DIV",
        $: [
            {
                if: () => val,
                $: [
                    "text",
                    { 
                        foreach: [ "A", "B", "C" ],
                        _: "DIV", 
                        text: x => x,
                    },
                ]
            }
        ]
    })();

    assert.equal(r.rootNode.childNodes.length, 6);      // test + foreach*2 + foreach head/tail sentinal

    val = false;
    r.update();

    assert.equal(r.rootNode.childNodes.length, 1);      // if placeholder

    val = true;
    r.update();

    assert.equal(r.rootNode.childNodes.length,6);      // as before
});

test("If at root", () => {

    let val = true;
    let r = Template.compile({
        _: "DIV",
        if: () => val,
    })();

    let outer = Environment.document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode, outer.childNodes[0]);

    val = false;
    r.update();
    assert.equal(r.rootNode.nodeType, 8);
    assert.equal(r.rootNode, outer.childNodes[0]);

    val = true;
    r.update();
    assert.equal(r.rootNode.nodeType, 1);
    assert.equal(r.rootNode, outer.childNodes[0]);
});

test("If at root (true)", () => {

    let r = Template.compile({
        _: "DIV",
        if: true,
    })();

    let outer = Environment.document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 1);
});

test("If at root (false)", () => {

    let r = Template.compile({
        _: "DIV",
        if: false,
    })();

    let outer = Environment.document.createElement("DIV");
    outer.append(r.rootNode);

    assert.equal(r.rootNode.nodeType, 8);
});


test("If on fragment at root", () => {

    let val = true;
    let r = Template.compile({
        if: () => val,
        $: 
        [
            {
                _: "DIV",
            }
        ]
    })();

    let outer = Environment.document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 1);

    val = false;
    r.update();
    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 8);

    val = true;
    r.update();
    assert.equal(r.rootNodes.length, 1);
    assert.equal(r.rootNodes[0].nodeType, 1);
});



test("IfBlock", () => {

    let val = false;
    let r = Template.compile({
        _: "div",
        $: 
        [
            {
                _: IfBlock,
                branches: [
                    {
                        condition: () => val,
                        template: 
                        { 
                            _: "DIV", 
                            $: [ "A", "B", "C" ]
                        },
                    },
                ]
            }
        ],
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
