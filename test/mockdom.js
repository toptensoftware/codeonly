import { strict as assert } from "node:assert";
import { tokenizer } from "../codeonly/tokenizer.js";

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

            case 11:
                this.childNodes = [];
                break;
        }

        this.parentNode = null;
    }

    cloneNode()
    {
        switch (this.nodeType)
        {
            case 3:
            case 8:
                return new HTMLNode(this.nodeType, this.nodeValue);

            case 1:
            case 11:
            {
                // Create node
                let newNode = new HTMLNode(this.nodeType);

                // Clone attributes
                if (this.attributes)
                {
                    for (let [k,v] of this.attributes)
                    {
                        newNode.setAttribute(k,v);
                    }
                }

                // Clone child nodes
                newNode.childNodes = this.childNodes.map(x => {
                    let childNode = x.cloneNode();
                    childNode.parentNode = this;
                    return childNode;
                });

                // Return cloned node
                return newNode;
            }

        }
    }

    get html()
    {
        switch (this.nodeType)
        {
            case 1:
                let r = `<${this.nodeName}`;
                if (this.attributes)
                {
                    for (let [key,value] of this.attributes)
                    {
                        r += ` ${key}=\"${value}\"`;
                    }
                }
                if (this.childNodes)
                {
                    r += ">";
                    this.childNodes.forEach(x => r += x.html);
                    r += `</${this.nodeName}>`;
                }
                else
                {
                    r += "/>";
                }
                return r;

            case 3:
                return this.nodeValue;

            case 8:
                return `<!--${this.nodeValue}-->`;

            case 11:
            {
                let r = `<#document-fragment>`;
                if (this.childNodes)
                {
                    this.childNodes.forEach(x => r += x.html);
                }
                r += `</#document-fragment>`;
                return r;
            }
        }

        throw new Error('not implemented');
    }

    get innerHTML()
    {
        if (this.childNodes)
            return this.childNodes.map(x => x.html).join("");
        else
            return "";
    }

    set innerHTML(value)
    {
        var nodes = parseHtml(value);
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
        assert.equal(this.nodeType, 1);

        // Remove all child nodes
        if (this.childNodes)
            this.childNodes.forEach(x => x.remove());

        // Set inner text
        this.append(document.createTextNode(value));
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
        assert(this.nodeType == 1 || this.nodeType == 11);

        this.insertNodesBefore(nodes, null);
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
        assert(this.parentNode);
        this.parentNode.insertNodesBefore(newNodes, this.nextSibling);
    }

    before(...newNodes)
    {
        assert(this.parentNode);
        this.parentNode.insertNodesBefore(newNodes, this);
    }

    insertNodesBefore(nodes, before)
    {
        if (before)
        {
            assert(before.parentNode == this);
        }

        // Expand document fragments
        let expanded = [];
        for (let i=0; i<nodes.length; i++)
        {
            if (nodes[i].nodeType == 11)
            {
                expanded.push(...nodes[i].childNodes);
            }
            else
            {
                expanded.push(nodes[i]);
            }
        }

        // Remove nodes from other parents
        expanded.forEach(x => {
            x.remove();
            x.parentNode = this;
        });

        // Work out where to insert
        let index = this.childNodes.indexOf(before);
        if (index < 0)
            index = this.childNodes.length;

        // Insert into this node
        this.childNodes.splice(index, 0, ...expanded);
    }

    insertBefore(node, before)
    {
        this.insertNodesBefore([ node ], before);
    }

    removeChild(node)
    {
        assert(this.nodeType == 1 || this.nodeType == 11);
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
        return new HTMLNode(3, text.replace(/\s+/g, ' '));
    }
    createComment(text)
    {
        return new HTMLNode(8, text);
    }
    createDocumentFragment()
    {
        return new HTMLNode(11);
    }
}


// Mini parser converts HTML to an array of nodes
// (lots of limitations, good enough for mocking)
export function parseHtml(str)
{
    let tokens = tokenizer(str);
    let token;

    function nextToken()
    {
        return token = tokens(...arguments);
    }

    nextToken();

    let finalNodes = parseNodes();

    if (token != '\0')
        throw new Error("syntax error: expected eof");

    return finalNodes;

    function parseNodes()
    {
        let nodes = [];
        while (token != '\0'  && token != '</')
        {
            // Text?
            if (token.text)
            {
                nodes.push(document.createTextNode(token.text));
                nextToken();
                continue;
            }

            // Comment?
            if (token.comment)
            {
                nodes.push(document.createComment(token.comment));
                nextToken();
                continue;
            }

            // Tag
            if (token == '<')
            {
                // Skip it
                nextToken();

                // Must be a tag identifier
                if (!token.identifier)
                {
                    throw new Error("syntax error: expected identifier after '<'");
                }

                let node = document.createElement(token.identifier);
                nodes.push(node);

                // Parse attributes
                while (token != '\0' && token != '>' && token != '/>')
                {
                    // Get attribute name, quit if tag closed
                    let attribName = nextToken(true);
                    if (attribName.string === undefined)
                        break;

                    // Store just the name
                    attribName = attribName.string;
                    let attribValue = attribName;

                    // Assigned value?
                    if (nextToken() == '=')
                    {
                        let val = nextToken(true);
                        if (val.string === undefined)
                            throw new Error("syntax error, expected value after '='");
                        attribValue = val.string;
                        nextToken();
                    }

                    // Set attribute value
                    node.setAttribute(attribName, attribValue);
                }

                // Self closing tag?
                if (token == '/>')
                {
                    nextToken();
                    continue;
                }

                if (token != '>')
                {
                    throw new Error("syntax error: expected '>' || '/>'");
                }
                nextToken();

                // Parse child nodes
                node.append(...parseNodes());

                if (token == '</')
                {
                    nextToken();
                    if (token.identifier != node.nodeName)
                        throw new Error("mismatched tags");
                    nextToken();
                    if (token != '>')
                        throw new Error("expected '>' for closing tag");
                    nextToken();
                }
            }
        }

        return nodes;
    }
}


globalThis.document = new Document();
globalThis.requestAnimationFrame = function(callback) { callback() };
globalThis.Node = HTMLNode;

