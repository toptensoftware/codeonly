import { compileTemplate } from "./TemplateCompiler.js";

export class Component
{
    constructor()
    {
        this.dom = this.template(this);
        this.invalidate();
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

    invalidate()
    {
        if (this.invalid)
            return;

        this.invalid = true;
        requestAnimationFrame(() => this.update());
    }

    update()
    {
        if (this.invalid)
        {
            this.invalid = false;
            this.dom.update();
        }
    }

    destroy()
    {
        this.dom.destroy();
    }

    mount(el)
    {
        if (typeof(el) === 'string')
        {
            el = document.querySelector(el);
        }
        el.append(...this.rootNodes);
        return this;
    }

}



