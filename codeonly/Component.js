import { Template } from "./Template.js";

export class Component extends EventTarget
{
    constructor()
    {
        super();
        
        if (!this.template)
        {
            if (this.constructor.template && !this.constructor.templateConstructor)
                this.constructor.templateConstructor = Template.compile(this.constructor.template, { initOnCreate: false });
            if (this.constructor.templateConstructor)
                this.template = this.constructor.templateConstructor;
        }            


        this.dom = new this.template({ model: this });
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

    watch(obj, eventName)
    {
        if (!this._boundInvalidate)
            this._boundInvalidate = this.invalidate.bind(this);
        if (this._watching)
            this._watching = [];

        if (eventName)
        {
            obj.addEventListener(eventName, this._boundInvalidate);
            this._watching.push(() => {
                obj.removeEventListener(eventName, this._boundInvalidate);
            });

        }
        else if (obj.watch)
        {
            let unwatch = obj.watch(this._boundInvalidate);
            if (!(unwatch instanceof Function))
                throw new Error("watch function didn't return a function to remove watch");
            this._watching.push(unwatch);
        }
        else
        {
            throw new Error("Don't know how to watch that");
        }
    }

    static declareTemplate(componentClass, template)
    {
        componentClass.prototype.template = Template.compile(template, { initOnCreate: false });
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



