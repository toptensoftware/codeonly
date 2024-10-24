import { EnvironmentBase } from "./Environment.js";
import { compileTemplate } from "./TemplateCompilerSSR.js";

export class SSREnvironment extends EnvironmentBase
{
    constructor()
    {
        super();
        this.compileTemplate = compileTemplate;
    }
}

