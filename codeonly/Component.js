import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";

class VNode
{
    constructor(template, component, itemContext)
    {
        this.domNodes = [];
        this.template = template;
        this.component = component;
        if (itemContext !== undefined)
            this.itemContext = itemContext;
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

    appendDomNode(domNode)
    {
        // Get the position in parent container to insert
        let dp = this.getDomPosition(this);

        if (dp.insertIndex < 0)
        {
            // Fast path during initial mount
            dp.node.appendChild(domNode);
        }
        else
        {
            // Slow path for update

            // Work out node to insert before
            let insertIndex = dp.index + this.domNodes.length;
            let insertBefore = insertIndex < dp.node.childNodes.length
                                    ? dp.node.childNodes[insertIndex]
                                    : null; 

            // Insert it
            dp.node.insertBefore(domNode, insertBefore);
        }

        // Also add to our dom nodes collection
        this.domNodes.push(domNode);
    }

    removeAllDomNodes()
    {
        this.domNodes.forEach(x => x.parentNode.removeChild(x));
        this.domNodes = [];
    }

    mount()
    {
        let template = this.template;

        // Text node?
        if (typeof(template) === 'string')
        {
            this.appendDomNode(document.createTextNode(template));
            return;
        }

        // HTML node?
        if (template instanceof HtmlString)
        {
            let frag = document.createElement('template');
            frag.innerHTML = template.html;
            this.appendDomNode(frag.content);
            return;
        }

        // Dynamic text node
        if (typeof(template) === 'function')
        {
            let text = template.apply(null, this.itemContext);
            if (typeof(text) === 'string')
            {
                let dnode = document.createTextNode(text);
                this.registerUpdateHandler(() => { dnode.nodeValue = template.apply(null, this.itemContext); });
                this.appendDomNode(dnode);
                return;
            }
            else if (text instanceof HtmlString)
            {
                let dnode = document.createElement('span');
                dnode.innerHTML = text.html;
                this.registerUpdateHandler(() => { 
                    dnode.innerHTML = template.apply(null, this.itemContext).html; 
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


        // 'foreach' item?
        if (template.foreach === undefined)
            return this.mountConditional(this);

        // Dynamic foreach?
        if (typeof(template.foreach) === 'function')
        {
            this.mountItems(template.foreach.apply(null, this.itemContext));
            this.registerUpdateHandler(() => this.patchItems());
        }
        else
        {
            this.mountItems(template.foreach);
        }
    }

    patchItems()
    {
        let newItems = template.foreach.apply(null, this.itemContext);
    }

    mountItems(items)
    {
        // Default key is the item itself
        if (this.item_key === undefined)
            this.item_key = (item) => item;

        let index = 0;
        this.itemNodes = [];
        let dp = this.getDomPosition();
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
            itemNode.key = this.template.item_key.apply(null, itemContext);

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
        this.excluded = !template.condition.apply(null, this.itemContext);

        // Mount it if current include
        if (!this.excluded)
            this.mountItem();

        // Register update handler
        this.registerUpdateHandler(() => {
            let new_excluded = !template.condition.apply(null, this.itemContext);
            if (new_excluded != this.excluded)
            {
                this.excluded = new_excluded;

                if (new_excluded)
                {  
                    // Remove
                    this.removeAllDomNodes();
                }
                else
                {
                    // Create
                    this.mountItem();
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

    mountElement()
    {
        let template = this.template;

        // Create the dom node
        let domNode = document.createElement(template.type);
        this.appendDomNode(domNode);

        // Bound node?
        if (template.bind !== undefined)
        {
            if (this.itemContext)
                throw new Error("Can't bind item elements");
            
            // Store reference in component
            this.component[template.bind] = domNode;

            // Clear it on unmount
            this.registerUnmountHandler(() => {
                if (this.component[template.bind] == domNode)
                    delete this.component[template.bind];
            });
        }

        // Helper for mapping dynamic values
        let itemContext = this.itemContext;
        let self = this;
        function map_dynamic(value, handler)
        {
            if (typeof(value) === 'function')
            {
                handler(value.apply(null, itemContext));
                self.registerUpdateHandler(() => handler(value.apply(null, itemContext)));
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
        this.mountChildNodes(domNode, 0);
    }

    mountNonElement()
    {
        if (this.template.bind !== undefined)
            throw new Error("Can't bind a non-element ('type' not set)");

        // Mount child elements into our parent node
        let dp = this.getDomPosition();
        return this.mountChildNodes(dp.domNode, dp.index);
    }

    mountChildNodes(domNode, baseIndex)
    {
        // No child nodes?
        if (!this.template.childNodes || this.template.childNodes.length == 0)
            return;

        // Fast dom position during mount
        let getDomPositionMount = function(node)
        {
            return {
                node: domNode,
                index: -1,
            }
        };

        // Slower dom position during update
        let getDomPositionUpdate = function(node)
        {
            let index = baseIndex;
            for (let n of this.childNodes)
            {
                if (n == node)
                    break;
                index += n.domNodes.length;
            }
            return {
                index,
                node: domNode,
            }
        }.bind(this);

        
        // mount nodes
        this.childNodes = [];
        this.template.childNodes.forEach(x => {
            // Create vnode
            let vnode = new VNode(x, this.component, this.itemContext);
            this.childNodes.push(vnode);

            // Mount it
            vnode.getDomPosition = getDomPositionMount;
            vnode.mount();
            vnode.getDomPosition = getDomPositionUpdate;

            // Track for updates
            if (vnode.needsUpdate)
                this.registerUpdateHandler(() => vnode.update());
        });
    }
}


export class Component
{
    constructor()
    {
    }

    mount(domNode)
    {
        this.vnode = new VNode(this.template, this);
        this.vnode.getDomPosition = function(node)
        {
            return {
                index: 0,
                node: domNode,
            }
    }
        this.vnode.mount();
    }

    update()
    {
        this.vnode.update();
    }
}