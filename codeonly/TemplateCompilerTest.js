import { compileTemplateCode, compileTemplate } from "./TemplateCompiler.js";
import { html } from "./HtmlString.js";

let template = {
    type: "DIV",
    childNodes: [
        {
            condition: () => true,
            type: "P",
            text: "Hello World",
        },
        {
            foreach: [ "Apples", "Pears", "Bananas" ],
            type: "P",
            text: item => item ,
        }
    ]
};


console.log(compileTemplateCode(template).code);
