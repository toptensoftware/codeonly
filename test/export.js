import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Root Export", () => {

    let r = compileTemplate({
        type: "DIV",
        export: "mydiv",
    })();

    assert.equal(r.rootNode, r.mydiv);
});

test("Non-root Export", () => {

    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                type: "P",
                export: "myPara",
                text: "foo",
            }
        ]
    })();

    assert.equal(r.myPara.innerText, "foo");
});

test("Export conditional", () => {

    let val = true;
    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                if: () => val,
                type: "P",
                export: "myPara",
                text: "foo",
            }
        ]
    })();

    assert.equal(r.myPara.innerText, "foo");

    val = false;
    r.update();
    assert.equal(r.myPara, null);

    val = true;
    r.update();
    assert.equal(r.myPara.innerText, "foo");
});

