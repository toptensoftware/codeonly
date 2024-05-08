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

let HTMLStyleListProxy = {
    get: function(object, key)
    {
        let val = Reflect.get(...arguments);
        if (val === undefined)
            val = object.getProperty(key);
        return val;
    },
    set: function(object, key, value)
    {
        if (!object.hasOwnProperty(key))
        {
            return object.setProperty(key, value);
        }

        return Reflect.set(...arguments);
    }
}

class HTMLStyleList
{
    constructor(owner)
    {
        this.owner = owner;
        return new Proxy(this, HTMLStyleListProxy);
    }

    getList()
    {
        let parts = (this.owner.getAttribute("style") ?? "").split(";").map(x => x.trim()).filter(x => x.length > 0);

        return parts.map(x => {
            let keyval = x.split(":");
            return {
                key: keyval[0].trim(),
                value: keyval[1].trim(),
            }
        });
    }

    setList(list)
    {
        this.owner.setAttribute("style", list.map(x => `${x.key}: ${x.value}`).join("; "));
    }

    getProperty(key)
    {
        let list = this.getList();
        let index = list.findIndex(x => x.key == key);
        if (index < 0)
            return undefined;
        return list[index].value;
    }

    setProperty(key, value)
    {
        let list = this.getList();
        let index = list.findIndex(x => x.key == key);
        if (index < 0)
            list.push({ key, value });
        else
            list[index].value = value;
        this.setList(list);
        return true;
    }

    removeProperty(key)
    {
        this.setList(this.getList().filter(x => x.key != key));
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

    append(...nodes)
    {
        assert(this.nodeType == 1);
        for (let arg of nodes)
        {
            assert(arg instanceof HTMLNode);
            arg.parentNode = this;
        }
        this.childNodes.push(...arguments);
    }

    remove()
    {
        assert(this.parentNode)
        this.parentNode.removeChild(this);
    }

    replaceWith(...newNodes)
    {
        this.after(...newNodes);
        this.remove();
    }

    after(...newNodes)
    {
        assert(this.parentNode);
        assert(!newNodes.some(x => x.parentNode));
        assert(!newNodes.some(x => !(x instanceof HTMLNode)));

        let index = this.parentNode.childNodes.indexOf(this);

        this.parentNode.childNodes.splice(index + 1, 0, ...newNodes);

        for (let i=0; i<newNodes.length; i++)
            newNodes[i].parentNode = this.parentNode;
    }

    before(...newNodes)
    {
        assert(this.parentNode);
        assert(!newNodes.some(x => x.parentNode));
        assert(!newNodes.some(x => !(x instanceof HTMLNode)));

        let index = this.parentNode.childNodes.indexOf(this);

        this.parentNode.childNodes.splice(index, 0, ...newNodes);

        for (let i=0; i<newNodes.length; i++)
            newNodes[i].parentNode = this.parentNode;
    }

    insertBefore(node, before)
    {
        assert(this.nodeType == 1);
        assert(node instanceof HTMLNode);
        assert(!node.parentNode);

        if (!before)
        {
            this.childNodes.push(node);
        }
        else
        {
            assert(before instanceof HTMLNode);
            let index = this.childNodes.indexOf(before);
            assert(index >= 0);
            this.childNodes.splice(index, 0, node);
        }

        node.parentNode = this;
    }

    removeChild(node)
    {
        assert(this.nodeType == 1);
        let index = this.childNodes.indexOf(node);
        assert(index >= 0);
        this.childNodes.splice(index, 1);
        node.parentNode = null;
    }

    get classList()
    {
        if (!this._classList)
            this._classList = new HTMLClassList(this);
        return this._classList;
    }

    get style()
    {
        if (!this._style)
            this._style = new HTMLStyleList(this);
        return this._style;
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
globalThis.requestAnimationFrame = function(callback) { callback() };
globalThis.Node = HTMLNode;