import { compileTemplate } from "./TemplateCompiler.js";

export class Template
{
    static declare(componentClass, template)
    {
        componentClass.prototype.template = compileTemplate(template, { initOnCreate: false });
    }
}