export class EmbedSlot
{
    constructor()
    {
        this.headSentinal = document.createComment(" start embed slot ");
        this.tailSentinal = document.createComment(" end embed slot ");
        this._content = undefined;
    }

    get rootNodes() 
    { 
        return [ 
            this.headSentinal, 
            this.tailSentinal 
        ]; 
    }

    get isSingleRoot()
    {
        return false;
    }

    get content()
    {
        return this._content;
    }

    set content(value)
    {
        // Remove old content
        let n = this.headSentinal.nextSibling;
        while (n != this.tailSentinal)
        {
            let t = n.nextSibling;
            n.remove();
            n = t;
        }

        this._content = value;

        if (!value)
            return;

        if (Array.isArray(value))
        {
            // Array of HTML nodes
            this.tailSentinal.before(...value);
        }
        else if (value instanceof Node)
        {
            // Single HTML node
            this.tailSentinal.before(value);
        }
        else
        {
            // Component
            this.tailSentinal.before(...value.rootNodes);
        }
    }

    removeContent()
    {
    }

    destroy()
    {
        if (this._content?.destroy instanceof Function)
        {
            this._content.destroy();
        }
    }
}