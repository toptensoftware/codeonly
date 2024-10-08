import { Template } from "./Template.js";

export class Component extends EventTarget
{
    constructor(shouldInit)
    {
        super();

        // Bind these so they can be passed directly to update callbacks.
        this.update = this.update.bind(this);
        this.invalidate = this.invalidate.bind(this);
        
        if (shouldInit !== false)
            this.init();
    }

    static _compiledTemplate;
    static get compiledTemplate()
    {
        if (!this._compiledTemplate)
            this._compiledTemplate = this.compileTemplate();
        return this._compiledTemplate
    }

    static compileTemplate()
    {
        return Template.compile(this.template, { initOnCreate: false });
    }

    static get isSingleRoot()
    {
        return this.compiledTemplate.isSingleRoot;
    }


    init()
    {
        this.dom = new this.constructor.compiledTemplate({ model: this });
        this.invalidate();
    }

    get rootNode() 
    { 
        if (!this.isSingleRoot)
            throw new Error("rootNode property can't be used on multi-root template");

        return this.dom.rootNode;
    }
    get rootNodes() 
    { 
        return this.dom.rootNodes; 
    }

    get isSingleRoot() 
    { 
        return this.dom.isSingleRoot; 
    }

    invalidate()
    {
        if (this.invalid)
            return;

        this.invalid = true;
        requestAnimationFrame(() => {
            if (this.invalid)
                this.update();
        });
    }

    update()
    {
        this.invalid = false;
        this.dom.update();
    }

    destroy()
    {
        // Remove all tracked watchers
        if (this._watching)
        {
            for (let unwatch of this._watching)
                unwatch();
        }

        // Destroy the DOM
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

    static declareProperty(cls, name)
    {
        let storeName = "_" + name;
        Object.defineProperty(cls.prototype, name, {
            get() { return this[storeName]; },
            set(value) { this[storeName] = value; this.invalidate(); }
        });
    }
}



