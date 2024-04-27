import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";

function doSomething(base)
{
    class MyClass extends base
    {
    }

    return MyClass;
}

doSomething();

let r = compileTemplate({
    type: "DIV",
    childNodes: 
    [
        "blah",
        {
            condition: () => false,
            type: "DIV",
            childNodes:
            [
                {
                    foreach: [ "apples", "pears", "bananas" ],
                    type: "DIV",
                    childNodes: [
                        { type: "P", text: () => item.first },
                        { type: "P", text: () => item.last },
                    ]
                },
            ]
        }
    ]
});

