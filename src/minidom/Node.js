
export class Node
{
    constructor(document)
    {
        this.#document = document;
    }

    #document;
    #parentNode = null;

    get document() { return this.#document; }
    get parentNode() { return this.#parentNode; }
    get hasChildNodes() { return false; }
    get nodeValue() { return null; }

    _setParentNode(value)
    {
        this.#parentNode = value;
    }

    get nextSibling()
    {
        if (!this.parentNode)
            return null;
        let index = this.parentNode.childNodes.indexOf(this);
        if (index + 1 >= this.parentNode.childNodes.length)
            return null;
        else
            return this.parentNode.childNodes[index + 1];
    }


    get previousSibling()
    {
        if (!this.parentNode)
            return null;
        let index = this.parentNode.childNodes.indexOf(this);
        if (index == 0)
            return null;
        else
            return this.parentNode.childNodes[index - 1];
    }

    remove()
    {
        if (this.parentNode)
            this.parentNode.removeChild(this);
    }

    replaceWith(...newNodes)
    {
        this.after(...newNodes);
        this.remove();
    }

    after(...newNodes)
    {
        this.parentNode.insertNodesBefore(newNodes, this.nextSibling);
    }

    before(...newNodes)
    {
        this.parentNode.insertNodesBefore(newNodes, this);
    }

    addEventListener(name, handler)
    {
        if (!this.listeners)
            this.listeners = [];
        this.listeners.push({ name, handler });
    }

    removeEventListener(name, handler)
    {
        if (!this.listeners)
            throw new Error("Unknown listener");
        let index = this.listeners.findIndex(x => x.name == name && x.handler == handler);
        if (index < 0)
            throw new Error("Unknown listener");
        this.listeners.splice(index, 1);
    }

    fireEvent(name, ev)
    {
        if (!this.listeners)
            return;
        for (let i=this.listeners.length - 1; i>=0; i--)
        {
            if (this.listeners[i].name == name)
                this.listeners[i].handler(ev);
        }
    }
}
