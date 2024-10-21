import { strict as assert } from "node:assert";
import { tokenizer } from "../minidom/tokenizer.js";
import { test } from "node:test";

test("comment", () => {
    let tokens = tokenizer("<!-- foo bar -->");
    assert.deepStrictEqual(tokens(), { comment: " foo bar "} );
    assert.deepStrictEqual(tokens(), '\0' );
});

test("text", () => {
    let tokens = tokenizer(" foo bar ");
    assert.deepStrictEqual(tokens(), { text: " foo bar "} );
    assert.deepStrictEqual(tokens(), '\0' );
});

test("self closing tag", () => {
    let tokens = tokenizer("<tag />");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), '/>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("opening tag", () => {
    let tokens = tokenizer("<tag>");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("closing tag", () => {
    let tokens = tokenizer("</tag>");
    assert.deepStrictEqual(tokens(), '</');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("boolean attribute", () => {
    let tokens = tokenizer("<tag attr>");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), { identifier: 'attr' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("attribute with value", () => {
    let tokens = tokenizer("<tag attr = value >");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), { identifier: 'attr' } );
    assert.deepStrictEqual(tokens(), '=');
    assert.deepStrictEqual(tokens(), { identifier: 'value' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("attribute with single quoted value", () => {
    let tokens = tokenizer("<tag attr = 'value' >");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), { identifier: 'attr' } );
    assert.deepStrictEqual(tokens(), '=');
    assert.deepStrictEqual(tokens(), { string: 'value' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("attribute with double quoted value", () => {
    let tokens = tokenizer("<tag attr = \"value\" >");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), { identifier: 'attr' } );
    assert.deepStrictEqual(tokens(), '=');
    assert.deepStrictEqual(tokens(), { string: 'value' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("identifier with dash", () => {
    let tokens = tokenizer("<my-tag>");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'my-tag' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

test("unquoted attribute value", () => {
    let tokens = tokenizer("<tag attr=some-value-23>");
    assert.deepStrictEqual(tokens(), '<');
    assert.deepStrictEqual(tokens(), { identifier: 'tag' } );
    assert.deepStrictEqual(tokens(), { identifier: 'attr' } );
    assert.deepStrictEqual(tokens(), '=' );
    assert.deepStrictEqual(tokens(true), { string: 'some-value-23' } );
    assert.deepStrictEqual(tokens(), '>');
    assert.deepStrictEqual(tokens(), '\0' );
});

