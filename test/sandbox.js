import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

let r = compileTemplate({
    type: "DIV",
    childNodes: 
    [
        "blah",
        {
            foreach: [ "apples", "pears", "bananas" ],
            type: "DIV",
            text: x => x,
        }
    ]
});

