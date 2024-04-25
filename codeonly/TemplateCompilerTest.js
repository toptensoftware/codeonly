import { compileTemplateCode } from "./TemplateCompiler.js";
import { html } from "./HtmlString.js";

let template = {
    type: "DIV",
    childNodes: [
        {
            condition: () => false,
            childNodes: [
                { type: "P", text: "Hello" },
                { type: "P", text: "World" },
            ],
        }
    ]
};

console.log(compileTemplateCode(template).code);