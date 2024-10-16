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

