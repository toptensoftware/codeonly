import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { diff } from './diff.js';

class VNode
{
    constructor(owner, template, item)
    {
        this.owner = owner;
        this.template = template;
        if (item !== undefined)
            this.item = item;
    }

    bind(name, value)
    {
        this.owner.bind(name, value);
    }

    unbind(name, value)
    {
        this.owner.unbind(name, value);
    }

    // Get all the dom nodes from this node
    // that need to be added to the parent node
    *getDomNodes()
    {
        // If this is a visible, non-template node
        // then we have one single root dom node
        if (this.domNode)
        {
            yield this.domNode;
            return;
        }

        // If this is an excluded node then
        // the this.domNode will be null, but
        // so will the child nodes collection

        // If this is a template then the dom nodes
        // come from the child nodes
        if (this.childNodes)
        {
            for (let c of this.childNodes)
            {
                for (let n in tc.getDomNodes())
                {
                    yield n;
                }
            }
        }
    }

    // Get the first dom node of this vnode
    getFirstDomNode()
    {
        if (this.domNode)
            return this.domNode;
        if (this.childNodes)
        {
            for (let c of this.childNodes)
            {
                let n = c.getFirstDomNode();
                if (n)
                    return n;
            }
        }
        return null;
    }

    // Get the last dom node of this vnode
    getLastDomNode()
    {
        if (this.domNode)
            return this.domNode;
        if (this.childNodes)
        {
            for (let i=this.childNodes.length-1; i>=0; i--)
            {
                let n = c.getLastDomNode();
                if (n)
                    return n;
            }
        }
        return null;
    }

    // Get the position at which a child node should
    // be inserted into the dom
    getDomPosition(childNode)
    {
        console.assert(this.childNodes);

        // Find the child node
        let childNodeIndex = this.childNodes.indexOf(childNode);
        console.assert(childNodeIndex >= 0);

        // Look for next node to insert before
        for (let i=childNodeIndex + 1; i<this.childNodes.length; i++)
        {
            let dn = this.childNodes[i].getFirstDomNode();
            if (dn)
            {
                return {
                    parent: dn.parentNode,
                    before: dn,
                }
            }
        }

        // Look for previous node to insert after
        for (let i=childNodeIndex - 1; i>=0; i--)
        {
            let dn = this.childNodes[i].getLastDomNode();
            if (dn)
            {
                return {
                    parent: dn.parentNode,
                    before: null,
                }
            }
        }

        // First child?
        if (this.domNode)
        {
            return {
                parent: this.domNode,
                before: null,
            }
        }

        // We're a template with no current content
        // so the insert position of the child is the 
        // insert position of this node in our parent
        return this.owner.getDomPosition(this);
    }

    registerUpdateHandler(fn)
    {
        if (!fn)
            return;
        if (!this.updateHandlers)
            this.updateHandlers = [];
        this.updateHandlers.push(fn);
    }

    revokeUpdateHandler(fn)
    {
        if (!fn)
            return;
        if (!this.updateHandlers)
            return;
        let index = this.updateHandlers.indexOf(fn);
        if (index>=0)
            this.updateHandlers.splice(index, 1);
    }

    registerUnmountHandler(fn)
    {
        if (!fn)
            return;
        if (!this.unmountHandlers)
            this.unmountHandlers = [];
        this.unmountHandlers.push(fn);
    }

    revokeUnmountHandler(fn)
    {
        if (!fn)
            return;
        if (!this.unmountHandlers)
            return;
        let index = this.unmountHandlers.indexOf(fn);
        if (index>=0)
            this.unmountHandlers.splice(index, 1);
    }

    get needsUpdate() 
    {  
        return !!this.updateHandlers;
    }

    update()
    {
        this.updateHandlers?.forEach(x => x());  
    }

    unmount()
    {
        this.unmountHandlers?.forEach(x => x());
    }

    mount()
    {
        let template = this.template;

        // Text node?
        if (typeof(template) === 'string')
        {
            this.domNode = document.createTextNode(template);
            return;
        }

        // HTML node?
        if (template instanceof HtmlString)
        {
            this.domNode = document.createElement('span');
            this.domNode.innerHTML = template.html;
            return;
        }

        // Dynamic text node
        if (typeof(template) === 'function')
        {
            let text = this.invokeCallback(template);
            if (typeof(text) === 'string')
            {
                let dnode = document.createTextNode(text);
                this.registerUpdateHandler(() => { dnode.nodeValue = this.invokeCallback(template); });
                this.appendDomNode(dnode);
                return;
            }
            else if (text instanceof HtmlString)
            {
                let dnode = document.createElement('span');
                dnode.innerHTML = text.html;
                this.registerUpdateHandler(() => { 
                    dnode.innerHTML = this.invokeCallback(template).html; 
                });
                this.appendDomNode(dnode);
                return;
            }
            else
            {
                throw new Error("Dynamic text function returned non-text");
            }
        }

        // Check only one type of content
        if (template.text !== undefined && template.childNodes !== undefined)
            throw new Error("A template element can't have both 'text' and 'childNodes'");


        return this.mountConditional(this);

/*
        // 'foreach' item?
        if (template.foreach === undefined)
            return this.mountConditional(this);

        // Dynamic foreach?
        if (typeof(template.foreach) === 'function')
        {
            this.mountItems(this.invokeCallback(template.foreach));
            this.registerUpdateHandler(() => this.patchItems());
        }
        else
        {
            this.mountItems(template.foreach);
        }
*/
    }

/*
    patchItems()
    {
        // Default key is the item itself
        let item_key = this.template.item_key ?? ((item) => item);

        // Get the new items
        let newItems = this.invokeCallback(this.template.foreach);

        // Get item keys and contexts
        let newItemInfos = [];
        for (let i=0; i<newItems.length; i++)
        {
            let info = {
                itemContext: [
                    newItems[i],
                    i,
                ],
            }
            info.key = this.invokeCallback(item_key);
            newItemInfos.push(info);
        }

        let dp = this.getDomPosition();

        // Run the diff algorithm
        diff(this.itemNodes, newItemInfos, apply_diff.bind(this), (a, b) => a.key == b.key);

        function apply_diff(op, index, count)
        {
            if (op == 'insert')
            {
                for (let i=0; i<count; i++)
                {
                    // Get info about the new item
                    let newItemInfo = newItemInfos[index];

                    // Create new vnode
                    let vnode = new VNode(this.template, this.component, newItemInfo.itemContext);

                    // Store the item key
                    vnode.key = newItemInfo.key;

                    // Insert into the item nodes collection
                    this.itemNodes.splice(index, 0, vnode);

                    // Setup position
                    vnode.getDomPosition = function()
                    {
                        return {
                            node: dp.node,
                            index: 0,
                        }
                    }

                    // Mount it
                    vnode.mountConditional();
                }
            }
            else
            {
                for (let i=0; i<count; i++)
                {
                }
            }
        }
    }

    mountItems(items)
    {
        // Default key is the item itself
        let item_key = this.template.item_key ?? ((item) => item);

        let index = 0;
        this.itemNodes = [];
        for (let item of items)
        {
            // Create item context
            let itemContext = [
                item,
                index,
            ];

            // Create loop item vnode
            let itemNode = new VNode(this.template, this.component, itemContext);

            // Store item key
            itemNode.key = this.invokeCallback(item_key);

            // Store it
            this.itemNodes.push(itemNode);

            // Create mount context for the item
            itemNode.getDomPosition = function()
            {
                return {
                    node: dp.node,
                    index: dp.node.childNodes.length,
                }
            };

            // Mount it
            itemNode.mountConditional();

            // Bump counter
            index++;
        }
    }
    */

    mountConditional()
    {
        let template = this.template;

        // Conditional?
        if (template.condition === undefined)
            return this.mountItem();

        // Static condition?
        if (typeof(template.condition) !== 'function')
        {
            if (template.condition)
                this.mountItem();
            else
                this.excluded = true;
            return;
        }

        // Work out if currently included?
        this.excluded = !this.invokeCallback(template.condition);

        // Mount it if current include
        if (!this.excluded)
            this.mountItem();

        // Register update handler
        this.registerUpdateHandler(() => {
            let new_excluded = !this.invokeCallback(template.condition);
            if (new_excluded != this.excluded)
            {
                this.excluded = new_excluded;

                if (new_excluded)
                {  
                    // Remove from DOM
                    for (let dn in this.getDomNodes())
                    {
                        dn.parentNode.removeChild(dn);
                    }

                    // Revoke update handler from parent node
                    this.owner.revokeUpdateHandler(this.update);

                    // Reset child nodes
                    this.childNodes = [];
                    this.domNode = null;
                }
                else
                {
                    // Create child Nodes
                    this.mountItem();

                    // Register update handler with parent
                    if (this.needsUpdate)
                        this.owner.registerUpdateHandler(this.update);

                    // Add child nodes
                    let dp = this.owner.getDomPosition();
                    for (let dn in this.getDomNodes())
                    {
                        dp.parent.insertBefore(dn, dp.before);
                    }
                }
            }
        });
    }

    mountItem()
    {
        if (this.template.type)
            return this.mountElement();
        else
            return this.mountNonElement();
    }

    invokeCallback(callback)
    {
        return callback.apply(null, this.item?.item, this.item);
    }

    mountElement()
    {
        let template = this.template;

        // Create the dom node
        let domNode = this.domNode = document.createElement(template.type);

        // Bound node?
        if (template.bind !== undefined)
        {
            if (this.item)
                throw new Error("Can't bind item elements");
            
            // Store reference in component
            this.owner.bind(template.bind, domNode);

            // Clear it on unmount
            this.registerUnmountHandler(() => {
                this.owner.unbind(template.bind, domNode);
            });
        }

        // Helper for mapping dynamic values
        let self = this;
        function map_dynamic(value, handler)
        {
            if (typeof(value) === 'function')
            {
                handler(self.invokeCallback(value));
                self.registerUpdateHandler(() => handler(self.invokeCallback(value)));
            }
            else
            {
                handler(value);
            }
        }

        // Class
        if (template.class)
        {
            map_dynamic(template.class, (value) => {
                domNode.setAttribute("class", value);
            });
        }

        // Style
        if (template.style)
        {
            map_dynamic(template.style, (value) => {
                domNode.setAttribute("style", value);
            })
        }

        // Attributes
        for (let attr of Object.keys(template).filter(x => x.startsWith("attr_")))
        {
            map_dynamic(template[attr], (value) => {
                domNode.setAttribute(camel_to_dash(attr.substring(5)), value);
            });
        }

        // Assign inner text
        if (template.text)
        {
            map_dynamic(template.text, (value) => {
                if (value instanceof HtmlString)
                    domNode.innerHTML = value.html;
                else
                    domNode.innerText = value
            });
        }

        // Attach event handlers
        for (let eventName of Object.keys(template).filter(x => x.startsWith("on_")))
        {
            let actualEventName = eventName.substring(3);
            let handler = template[eventName];
            domNode.addEventListener(actualEventName, handler);
        }

        // Boolean classes
        for (let className of Object.keys(template).filter(x => x.startsWith("class_")))
        {
            let actualClassName = className.substring(6);
            map_dynamic(template[className], (value) => {
                if (value)
                    domNode.classList.add(actualClassName);
                else
                    domNode.classList.remove(actualClassName);
            });
        }

        // Child nodes
        this.mountChildNodes();
    }

    mountNonElement()
    {
        if (this.template.bind !== undefined)
            throw new Error("Can't bind a non-element ('type' not set)");

        // Mount child elements into our parent node
        return this.mountChildNodes();
    }

    mountChildNodes()
    {
        // No child nodes?
        if (!this.template.childNodes || this.template.childNodes.length == 0)
            return;
        
        // mount nodes
        this.template.childNodes.forEach(x => {
            // Create vnode
            let vnode = new VNode(this, x, this.item);
            this.childNodes.push(vnode);

            // Mount it
            vnode.mount();

            // Track for updates
            if (vnode.needsUpdate)
                this.registerUpdateHandler(() => vnode.update());

            // Add child dom nodes to this node (unless we're a template node)
            if (this.domNode)
            {
                for (let dn in vnode.getDomNodes())
                {
                    this.domNode.appendChild(dn);
                }
            }
        });
    }
}


export class Component
{
    constructor()
    {
        super();
    }

    mount(domNode)
    {
        this.vnode = new VNode(this, this.template);
        this.vnode.mount();
        for (let dn in this.vnode.getDomNodes())
        {
            domNode.appendChild(dn);
        }
    }

    update()
    {
        this.vnode.update();
    }

    bind(name, value)
    {
        this[name] = value;
    }

    unbind(name, value)
    {
        if (thia[name] == value)
            delete this[name];
    }
}