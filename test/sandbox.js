import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


let r = compileTemplate({
    childNodes: [
        "blah",
        {
            foreach: [ "apples", "pears", "bananas" ],
            type: "P",
            text: (item) => item,
        },
    ]
});

console.log(r.code);
