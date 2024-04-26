import { strict as assert } from "node:assert";

class HTMLClassList
{
    constructor(owner)
    {
        this.owner = owner;
    }

    add(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" ").filter(x => x.length > 0));
        classes.add(className);
        this.owner.setAttribute("class", [...classes].join(' '));
    }

    remove(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" "));
        classes.delete(className);
        this.owner.setAttribute("class", [...classes].join(' '));
    }

    has(className)
    {
        let classes = new Set((this.owner.getAttribute("class") ?? "").split(" "));
        return classes.has(className);
    }
}

class HTMLNode
{
    constructor(type, nameOrValue)
    {
        this.nodeType = type;
        switch (type)
        {
            case 1:
                this.nodeName = nameOrValue;
                this.childNodes = [];
                this.attributes = new Map();
                break;

            case 3:
                this.nodeValue = nameOrValue;
                break;

            case 8:
                this.nodeValue = nameOrValue;
                break;
        }

        this.parentNode = null;
    }

    setAttribute(name, value)
    {
        assert(this.nodeType == 1);
        this.attributes.set(name, value);
    }
    getAttribute(name, value)
    {
        assert(this.nodeType == 1);
        return this.attributes.get(name);
    }

    append()
    {
        assert(this.nodeType == 1);
        for (let arg of [...arguments])
        {
            assert(arg instanceof HTMLNode);
            arg.parentNode = this;
        }
        this.childNodes.push(...arguments);
    }

    replaceWith(newNode)
    {
        assert(this.parentNode);
        assert(!newNode.parentNode)

        let index = this.parentNode.childNodes.indexOf(this);
        assert(index >= 0);

        this.parentNode.childNodes[index] = newNode;
        newNode.parentNode = this.parentNode;
        this.parentNode = null;
    }

    get classList()
    {
        if (!this._classList)
            this._classList = new HTMLClassList(this);
        return this._classList;
    }
}

class Document
{
    constructor()
    {
    }

    createElement(type)
    {
        return new HTMLNode(1, type);
    }
    createTextNode(text)
    {
        return new HTMLNode(3, text);
    }
    createComment(text)
    {
        return new HTMLNode(8, text);
    }
}

globalThis.document = new Document();