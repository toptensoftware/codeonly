import { nextFrame } from "./nextFrame.js";
import { Template } from "./Template.js";
import { env } from "./Environment.js";

export class Component extends EventTarget
{
    constructor()
    {
        super();

        // Bind these so they can be passed directly to update callbacks.
        this.update = this.update.bind(this);
        this.invalidate = this.invalidate.bind(this);
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
        return Template.compile(this.template);
    }

    static get isSingleRoot()
    {
        return this.compiledTemplate.isSingleRoot;
    }

    init()
    {
        if (!this.#dom)
            this.#dom = new this.constructor.compiledTemplate({ model: this });
    }

    #dom;
    get dom()
    {
        if (!this.#dom)
            this.init();
        return this.#dom;
    }

    get isSingleRoot() 
    { 
        return this.dom.isSingleRoot; 
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

    static nextFrameOrder = -100;

    invalidate()
    {
        // No need to invalidate if not created yet
        if (!this.#dom)
            return;

        // Already invalid?
        if (this.invalid)
            return;

        // Mark
        this.invalid = true;

        // Request callback
        Component.invalidate(this);
    }

    validate()
    {
        if (this.invalid)
            this.update();
    }

    static _invalidComponents = [];
    static invalidate(component)
    {
        // Add component to list requiring validation
        this._invalidComponents.push(component);

        // If it's the first, set up a nextFrame callback
        if (this._invalidComponents.length == 1)
        {
            nextFrame(() => {
                // Process invalid components.
                // NB: new components invalidated while validating original
                //     set of components will be added to end of array 
                //     and also updated this frame.
                for (let i=0; i<this._invalidComponents.length; i++)
                {
                    this._invalidComponents[i].validate();
                }
                this._invalidComponents = [];
            }, Component.nextFrameOrder);
        }
    }

    update()
    {
        if (!this.#dom)
            return;
        
        this.invalid = false;
        this.dom.update();
    }

    async load(callback)
    {
        this.#loading++;
        if (this.#loading == 1)
        {
            this.invalidate();  
            env.enterLoading();
            this.dispatchEvent(new Event("loading"));
        }
        try
        {
            return await callback();
        }
        finally
        {
            this.#loading--;
            if (this.#loading == 0)
            {
                this.invalidate();
                this.dispatchEvent(new Event("loaded"));
                env.leaveLoading();
            }
        }
    }

    #loading = 0;

    get loading()
    {
        return this.#loading != 0;
    }
    set loading(value)
    {
        throw new Error("setting Component.loading not supported, use load() function");
    }

    render(w)
    {
        this.dom.render(w);
    }

    destroy()
    {
        if (this.#dom)
        {
            this.#dom.destroy();
            this.#dom = null;
        }
    }

    onMount()
    {
    }

    onUnmount()
    {
    }

    #mounted = false;
    setMounted(mounted)
    {
        this.#dom?.setMounted(mounted);
        this.#mounted = mounted;
        if (mounted)
            this.onMount();
        else
            this.onUnmount();
    }

    mount(el)
    {
        if (typeof(el) === 'string')
        {
            el = document.querySelector(el);
        }
        el.append(...this.rootNodes);
        this.setMounted(true);
        return this;
    }

    unmount()
    {
        if (this.#dom)
            this.rootNodes.forEach(x => x. remove());
        this.setMounted(false);
    }

    static template = {};
}
