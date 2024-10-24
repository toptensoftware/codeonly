import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template, Html } from "../codeonly.js";


test("Basic", () => {

    let r = Template.compile({
        _: "DIV",
        $: [
            { _: "SPAN", text: "foo" },
            { _: "SPAN", text: "bar" },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 2);
    assert.equal(r.rootNodes[0].childNodes[0].nodeName, "SPAN");
    assert.equal(r.rootNodes[0].childNodes[1].nodeName, "SPAN");
});

test("Child Nodes with Dynamic Text", () => {

    let val = "foo";
    let r = Template.compile({
        _: "DIV",
        $: [
            { _: "SPAN", text: () => val },
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
    val = "bar";
    r.update();
    assert.equal(r.rootNodes[0].childNodes[0].innerText, val);
});


test("Child Nodes with Static Text", () => {

    let val = "foo";
    let r = Template.compile({
        _: "DIV",
        text: val,
    })();

    assert.equal(r.rootNodes[0].innerText, val);
});

test("Child Nodes with Static HTML", () => {

    let val = "<span>foo</span>";
    let r = Template.compile({
        _: "DIV",
        text: Html.raw(val),
    })();

    assert.equal(r.rootNodes[0].innerHTML, val);
});

test("$: Static Text", () => {

    let val = "foo";
    let r = Template.compile({
        _: "DIV",
        $: val,
    })();

    assert.equal(r.rootNodes[0].innerText, val);
});

test("$: Static HTML", () => {

    let val = "<span>foo</span>";
    let r = Template.compile({
        _: "DIV",
        $: Html.raw(val),
    })();

    assert.equal(r.rootNodes[0].innerHTML, val);
});

