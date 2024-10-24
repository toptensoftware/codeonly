import { compileTemplate } from "./TemplateCompiler.js";

export let env = null;

export class EnvironmentBase extends EventTarget
{
    constructor()
    {
        super();
        this.browser = false;
    }

    #loading = 0;

    enterLoading()
    {
        this.#loading++;
        if (this.#loading == 1)
            this.dispatchEvent(new Event("loading"));
    }
    leaveLoading()
    {
        this.#loading--;
        if (this.#loading == 0)
            this.dispatchEvent(new Event("loaded"));
    }

    get loading()
    {
        return this.#loading != 0;
    }

    async load(callback)
    {
        this.enterLoading();
        try
        {
            return await callback();
        }
        finally
        {
            this.leaveLoading();
        }
    }
}

export class BrowserEnvironment extends EnvironmentBase
{
    constructor()
    {
        super();
        this.browser = true;
        this.document = document;
        this.compileTemplate = compileTemplate;
        this.window = window;
        this.requestAnimationFrame = window.requestAnimationFrame.bind(window);
        this.Node = Node;
    }
}

export function setEnvironment(newEnv)
{
    env = newEnv;
}


if (typeof(document) !== "undefined")
{
    setEnvironment(new BrowserEnvironment());
}

