import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, IfBlock, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

test("IfBlock", () => {

    let val = false;
    let r = Template.compile({
        type: "div",
        childNodes: 
        [
            {
                type: IfBlock,
                branches: [
                    {
                        condition: () => val,
                        template: 
                        { 
                            type: "DIV", 
                            childNodes: [ "A", "B", "C" ]
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
