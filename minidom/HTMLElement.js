import { Element } from "./Element.js"
import { ClassList } from "./ClassList.js";
import { StyleList } from "./StyleList.js";
import { parseHtml } from "./parseHtml.js";

export class HTMLElement extends Element
{
    constructor(document, nodeName)
    {
        super(document, nodeName);
    }

    cloneNode(deep) 
    {
        // Create node
        let newNode = new HTMLElement(this.document, this.nodeType);

        // Clone attributes
        for (let [k,v] of this.attributes)
            newNode.setAttribute(k,v);

        // Clone child nodes
        if (deep)
        {
            this.childNodes.forEach(x => {
                newNode.appendChild(x.cloneNode(true));
            });
        }

        // Return cloned node
        return newNode;
    }

    get innerHTML()
    {
        return this.childNodes.map(x => x.html).join("");
    }

    set innerHTML(value)
    {
        var nodes = parseHtml(this.document, value);
        this.childNodes.forEach(x => x.remove());
        this.append(...nodes);
    }

    get innerText()
    {
        let buf = "";
        for (let ch of this.childNodes)
        {
            switch (ch.nodeType)
            {
                case 1:
                    buf += ch.innerText;
                    break;
                
                case 3:
                    buf += ch.nodeValue;
                    break;
            }
        }
        return buf.replace(/\s+/g, ' ');
    }

    set innerText(value)
    {
        // Remove all child nodes
        this.childNodes.forEach(x => x.remove());

        // Set inner text
        this.append(this.document.createTextNode(value));
    }

    #classList;
    get classList()
    {
        if (!this.#classList)
            this.#classList = new ClassList(this);
        return this.#classList;
    }

    #style;
    get style()
    {
        if (!this.#style)
            this.#style = new StyleList(this);
        return this.#style;
    }

}