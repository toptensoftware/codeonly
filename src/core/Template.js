import { env } from "./Environment.js";


export class Template
{
    static compile()
    {
        return env.compileTemplate(...arguments);
    }
}