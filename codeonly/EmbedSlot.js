export class EmbedSlot
{
    #content;
    #headSentinal;
    #tailSentinal;

    constructor()
    {
        this.#headSentinal = document.createComment(" start embed slot ");
        this.#tailSentinal = document.createComment(" end embed slot ");
        this.#content = undefined;
    }

    get rootNodes() 
    { 
        return [ 
            this.#headSentinal, 
            this.#tailSentinal 
        ]; 
    }

    get isSingleRoot()
    {
        return false;
    }

    get content()
    {
        return this.#content;
    }

    set content(value)
    {
        // Remove old content
        let n = this.#headSentinal.nextSibling;
        while (n != this.#tailSentinal)
        {
            let t = n.nextSibling;
            n.remove();
            n = t;
        }
        this.#content?.destroy?.();

        this.#content = value;

        if (!value)
            return;

        if (value.rootNodes !== undefined)
        {
            // Component like object
            this.#tailSentinal.before(...value.rootNodes);
        }
        else if (Array.isArray(value))
        {
            // Array of HTML nodes
            this.#tailSentinal.before(...value);
        }
        else if (value instanceof Node)
        {
            // Single HTML node
            this.#tailSentinal.before(value);
        }
        else
        {
            throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
        }
    }

    destroy()
    {
        if (this.#content?.destroy instanceof Function)
        {
            this.#content.destroy();
        }
    }
}