import { Node } from "./Node.js"

export class Element extends Node
{
    constructor(document, nodeName)
    {
        super(document);
        this.#nodeName = nodeName;
    }

    #nodeName;
    #childNodes = [];
    #attributes = new Map();

    get nodeType() { return 1; }
    get nodeName() { return this.#nodeName; }
    get childNodes() { return this.#childNodes; }
    get attributes() { return this.#attributes; }
    get hasChildNodes() { return this.#childNodes.length > 0; }

    get html()
    {
        let r = `<${this.nodeName}`;
        if (this.attributes)
        {
            for (let [key,value] of this.attributes)
            {
                r += ` ${key}=\"${value}\"`;
            }
        }
        if (this.#childNodes)
        {
            r += ">";
            this.#childNodes.forEach(x => r += x.html);
            r += `</${this.nodeName}>`;
        }
        else
        {
            r += "/>";
        }
        return r;
    }

    setAttribute(name, value)
    {
        this.attributes.set(name, value);
    }
    getAttribute(name, value)
    {
        return this.attributes.get(name);
    }

    append(...nodes)
    {
        this.insertNodesBefore(nodes, null);
    }

    insertBefore(node, before)
    {
        this.insertNodesBefore([ node ], before);
    }

    insertNodesBefore(nodes, before)
    {
        // Remove nodes from other parents
        nodes.forEach(x => {
            x.remove();
            x._setParentNode(this);
        });

        // Work out where to insert
        let index = this.#childNodes.indexOf(before);
        if (index < 0)
            index = this.#childNodes.length;

        // Insert into this node
        this.#childNodes.splice(index, 0, ...nodes);
    }

    removeChild(node)
    {
        let index = this.#childNodes.indexOf(node);
        if (index < 0)
            throw new Error("node a child");

        this.#childNodes.splice(index, 1);
        node._setParentNode(null);
    }

    appendChild(node)
    {
        this.insertNodesBefore([node], null);
    }


}