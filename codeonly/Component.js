import { compileTemplate } from "./TemplateCompiler.js";

export class Component
{
    constructor()
    {
    }

    initialize()
    {
        this.dom = this.template(this)
    }

    get rootNode() 
    { 
        if (this.isMultiRoot)
            throw new Error("rootNode property can't be used on multi-root template");

        return this.dom.rootNode;
    }
    get rootNodes() 
    { 
        return this.dom.rootNodes; 
    }

    get isMultiRoot() 
    { 
        return this.dom.isMultiRoot; 
    }

    update()
    {
        this.dom.update();
    }

    destroy()
    {
        this.dom.destroy();
    }

}



export function declareTemplate(componentClass, template)
{
    componentClass.prototype.template = compileTemplate(template);
}