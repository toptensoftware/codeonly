import { compileTemplate } from "./TemplateCompiler.js";


export class Template
{
    static compile()
    {
        return compileTemplate(...arguments);
    }
}