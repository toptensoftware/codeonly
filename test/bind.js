import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly.js";
import "./mockdom/mockdom.js";


test("Root Bind", () => {

    let model = {
        get mydiv() { return this._mydiv; },
        set mydiv(value) { this._mydiv = value; },
    };

    let r = Template.compile({
        type: "DIV",
        bind: "mydiv",
    })({ model });

    assert.equal(r.rootNode, model.mydiv);
});

test("Non-root Bind", () => {

    let model = {};

    let r = Template.compile({
        type: "DIV",
        childNodes:
        [
            {
                type: "P",
                bind: "myPara",
                text: "foo",
            }
        ]
    })({ model });

    assert.equal(model.myPara.innerText, "foo");
});

test("Bind conditional", () => {

    let model = {
        get myPara() { return this._p; },
        set myPara(value) { this._p = value; },
    };

    let val = true;
    let r = Template.compile({
        type: "DIV",
        childNodes:
        [
            {
                if: () => val,
                type: "P",
                bind: "myPara",
                text: "foo",
            }
        ]
    })({ model });

    assert.equal(model.myPara.innerText, "foo");
    assert.equal(model.myPara, model._p);

    val = false;
    r.update();
    assert.equal(model.myPara, null);
    assert.equal(model.myPara, model._p);

    val = true;
    r.update();
    assert.equal(model.myPara.innerText, "foo");
    assert.equal(model.myPara, model._p);
});



test("Simple rebind", () => {

    // First bind to this model
    let model = {};
    let ctx = { model };

    let r = Template.compile({
        type: "DIV",
        childNodes:
        [
            {
                type: "P",
                bind: "myPara",
                text: "foo",
            }
        ]
    })(ctx);

    // check bound
    assert.equal(model.myPara.innerText, "foo");

    // Create a new model, store it in the context and rebind
    let model2 = {};
    ctx.model = model2;
    r.rebind();

    assert.equal(model.myPara, null);
    assert.equal(model2.myPara.innerText, "foo");
});


test("Conditional block rebind", () => {

    // First bind to this model
    let model = {};
    let ctx = { model };

    let val = true;

    let r = Template.compile({
        type: "DIV",
        childNodes:
        [
            {
                if: () => val,
                type: "P",
                bind: "myPara",
                text: "foo",
            }
        ]
    })(ctx);

    // check bound
    assert.equal(model.myPara.innerText, "foo");

    // Turn off with conditional
    val = false;
    r.update();
    assert.equal(model.myPara, null);

    val = true;
    r.update();
    assert.equal(model.myPara.innerText, "foo");

    // Create a new model, store it in the context and rebind
    let model2 = {};
    ctx.model = model2;
    r.rebind();

    // Should now be bound to the new model
    assert.equal(model.myPara, null);
    assert.equal(model2.myPara.innerText, "foo");

    // Turn off with condition and check nulled
    val = false;
    r.update();
    assert.equal(model2.myPara, null);

});

