import { Environment } from "./Environment.js";


export class Template
{
    static compile()
    {
        return Environment.compileTemplate(...arguments);
    }
}