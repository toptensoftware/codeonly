import { strict as assert } from "node:assert";
import { test } from "node:test";
import { Document, parseHtml } from "../minidom/minidom.js";


test("text node", () => {
    let nodes = parseHtml(new Document(), "Hello World");
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].nodeType, 3);
    assert.equal(nodes[0].nodeValue, "Hello World");
});

test("comment", () => {
    let nodes = parseHtml(new Document(), "<!-- comment -->");
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].nodeType, 8);
    assert.equal(nodes[0].nodeValue, " comment ");
});

test("element", () => {
    let nodes = parseHtml(new Document(), "<tag/>");
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].nodeType, 1);
    assert.equal(nodes[0].nodeName, "tag");
});

test("element with attribute", () => {
    let nodes = parseHtml(new Document(), "<tag attr=value/>");
    assert.equal(nodes[0].getAttribute("attr"), "value");
});


test("element with quoted attribute", () => {
    let nodes = parseHtml(new Document(), "<tag attr=\"value\"/>");
    assert.equal(nodes[0].getAttribute("attr"), "value");
});

test("element with child nodes", () => {
    let nodes = parseHtml(new Document(), "<outer><inner1/><inner2/></outer>");
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].childNodes.length, 2);
});


test("element with mixed child nodes", () => {
    let nodes = parseHtml(new Document(), "<outer><!-- foo -->   bar   baz   <inner/></outer>");
    assert.equal(nodes.length, 1);
    assert.equal(nodes[0].childNodes.length, 3);
    assert.equal(nodes[0].childNodes[0].nodeType, 8);
    assert.equal(nodes[0].childNodes[0].nodeValue, " foo ");
    assert.equal(nodes[0].childNodes[1].nodeType, 3);
    assert.equal(nodes[0].childNodes[1].nodeValue, "   bar   baz   ");
    assert.equal(nodes[0].childNodes[2].nodeType, 1);
    assert.equal(nodes[0].childNodes[2].nodeName, "inner");
});
