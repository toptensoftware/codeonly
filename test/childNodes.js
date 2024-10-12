import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, Html } from "../codeonly.js";
import "./mockdom/mockdom.js";


test("Child Nodes", () => {

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: "foo" },
            { type: "SPAN", text: "bar" },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 2);
    assert.equal(r.rootNodes[0].childNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].childNodes[1].nodeName, "SPAN");
});

test("Child Nodes with Dynamic", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        childNodes: [
            { type: "SPAN", text: () => val },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
});


test("Child Nodes is Static Text", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        text: val,
    })();

    assert.equal(r.rootNodes[0].innerText, val);
});

test("Child Nodes is Static HTML", () => {

    let val = "<span>foo</span>";
    let r = Template.compile({
        type: "DIV",
        text: Html.raw(val),
    })();

    assert.equal(r.rootNodes[0].innerHTML, val);
});

test("$ is Static Text", () => {

    let val = "foo";
    let r = Template.compile({
        type: "DIV",
        $: val,
    })();

    assert.equal(r.rootNodes[0].innerText, val);
});

test("$ is Static HTML", () => {

    let val = "<span>foo</span>";
    let r = Template.compile({
        type: "DIV",
        $: Html.raw(val),
    })();

    assert.equal(r.rootNodes[0].innerHTML, val);
});

