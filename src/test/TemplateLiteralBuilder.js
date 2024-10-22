import { test } from "node:test";
import { strict as assert } from "node:assert";
import { TemplateLiteralBuilder } from "../core/TemplateLiteralBuilder.js";

test("Raw Text", () => {

    let t = new TemplateLiteralBuilder();
    t.raw("Hello World");
    assert.equal(t.resolve(), "`Hello World`");

});

test("Expression", () => {

    let t = new TemplateLiteralBuilder();
    t.raw("Hello World, ");
    t.expr("name");
    t.raw(" was here");
    assert.equal(t.resolve(), "`Hello World, ${name} was here`");

});

test("Escape Back Ticks", () => {

    let t = new TemplateLiteralBuilder();
    t.raw("Hello `World`");
    assert.equal(t.resolve(), "`Hello \\`World\\``");

});

test("Escape Back Slashes", () => {

    let t = new TemplateLiteralBuilder();
    t.raw("Hello \\World\\");
    assert.equal(t.resolve(), "`Hello \\\\World\\\\`");

});

test("HTML encoding (text)", () => {

    let t = new TemplateLiteralBuilder();
    t.text("A & B");
    assert.equal(t.resolve(), "`A &amp; B`");

});
