import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { diff } from './diff.js';


let frameCallbacks = [];
function nextFrame(fn)
{
    if (!fn)
        return;
    frameCallbacks.push(fn);
    if (frameCallbacks.length == 1)
    {
        requestAnimationFrame(dispatchFrameCallbacks);
    }
}

function dispatchFrameCallbacks()
{
    let pending = frameCallbacks;
    frameCallbacks = [];
    pending.forEach(x => x());
}

class VNode
{
    constructor(owner, template, item)
    {
        this.owner = owner;
        this.template = template;
        if (item !== undefined)
            this.item = item;
    }

    invalidate()
    {
        if (this.invalid)
            return;

        this.invalid = true;
        nextFrame(this.update);
    }

    bind(name, value)
    {
        this.owner.bind(name, value);
    }

    unbind(name, value)
    {
        this.owner.unbind(name, value);
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

    _update()
    {
        this.invalid = false;
        this.updateHandlers?.forEach(x => x());  
    }

    get update()
    {
        if (!this.updateHandlers)
            return null;
        if (!this._boundUpdate)
            this._boundUpdate = this._update.bind(this);
        return this._boundUpdate;
    }

    invokeCallback(callback)
    {
        return callback.call(null, this.item?.item, this.item);
    }

    // Get the first dom node of this vnode
    getFirstDomNode()
    {
        if (this.domNode)
            return this.domNode;
        if (this.fragmentNodes && this.fragmentNodes.length > 0)
            return this.fragmentNodes[0];
        return null;
    }

    // Get the last dom node of this vnode
    getLastDomNode()
    {
        if (this.domNode)
            return this.domNode;
        if (this.fragmentNodes && this.fragmentNodes.length > 0)
            return this.fragmentNodes[this.fragmentNodes.length - 1];
        return null;
    }

    // Get the position at which a child node should
    // be inserted into the dom
    getDomPosition(childNode)
    {
        console.assert(this.childNodes);

        // Find the child node (do reverse search as faster when creating initial dom)
        let childNodeIndex = this.childNodes.lastIndexOf(childNode);
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
                    before: dn.nextSibling,
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

    create()
    {
        // Create DOM
        this.createDom();

        // Get insert position
        let dp = this.owner.getDomPosition(this);

        // Handle fragment nodes differently...
        if (this.isFragment)
        {
            this.fragmentNodes = [ ...this.domNode.childNodes ];
            dp.parent.insertBefore(this.domNode, dp.before);
            this.domNode = null;
        }
        else
        {
            dp.parent.insertBefore(this.domNode, dp.before);
        }
    }

    destroy()
    {
        // Destroy DOM
        if (this.isFragment)
        {
            this.fragmentNodes.forEach(x => x.parentNode.removeChild(x));
            delete this.fragmentNodes;
        }
        else
        {
            this.domNode.parentNode.removeChild(this.domNode);
            delete this.domNode;
        }

        // Remove all update handlers
        delete this.updateHandlers;

        // Remove binding
        if (this.template.bind)
        {
            this.owner.unbind(template.bind, domNode);
        }
    }

    createDom()
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
                this.domNode = document.createTextNode(text);
                this.registerUpdateHandler(() => { this.domNode.nodeValue = this.invokeCallback(template); });
                return;
            }
            else if (text instanceof HtmlString)
            {
                this.domNode = document.createElement('span');
                this.domNode.innerHTML = text.html;
                this.registerUpdateHandler(() => { 
                    this.domNode.innerHTML = this.invokeCallback(template).html; 
                });
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

        // Create DOM
        if (this.template.type)
            this.createDomElement();
        else
            this.createFragmentElement();
    }

    createDomElement()
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
        this.createChildNodes();
    }

    createFragmentElement()
    {
        if (this.template.bind !== undefined)
            throw new Error("Can't bind a non-element ('type' not set)");

        // Create a temporary fragment to hold the child nodes
        this.isFragment = true;
        this.domNode = document.createDocumentFragment();

        // Mount child elements into our parent node
        return this.createChildNodes();
    }

    createChildNodes()
    {
        // No child nodes?
        if (!this.template.childNodes)
            return;
        
        this.childNodes = [];
        for (let childNodeTemplate of this.template.childNodes)
        {
            // foreach loop?
            if (childNodeTemplate.foreach !== undefined)
            {
                this.createForEachNodes(childNodeTemplate);
            }
            else if (childNodeTemplate.condition !== undefined)
            {
                this.createConditionalNode(childNodeTemplate);
            }
            else
            {
                // Create regular child vnode
                let childNode = new VNode(this, childNodeTemplate, this.item);
                this.childNodes.push(childNode);
                childNode.create();
                this.registerUpdateHandler(childNode.update);
            }
        }
    }

    createForEachNodes(childNodeTemplate)
    {
        // Are items conditional?
        let item_condition = childNodeTemplate.condition;
        if (item_condition && typeof(item_condition) != 'function')
        {
            // All items excluded?
            if (!item_condition)
                return;

            // All items included?
            item_condition = null;
        }

        // If this is the first foreach block, setup the array of foreach block infos
        if (!this.forEachBlocks)
            this.forEachBlocks = [];

        // Work out how many nodes besides items nodes so far
        let nonForEachNodeCount = this.childNodes.length - this.forEachBlocks.reduce((acc, x) => {
            return acc + x.itemNodes.length;
        }, 0);

        // Create foreach block info
        let forEachBlock = {
            itemNodes: [],
            index: this.forEachBlocks.length
        };
        this.forEachBlocks.push(forEachBlock);

        // Get the items
        let foreach = childNodeTemplate.foreach;
        let item_key = childNodeTemplate.item_key ?? ((item) => item);
        let itemNodes = forEachBlock.itemNodes;

        let items;
        if (typeof(foreach) === 'function')
        {
            items = this.invokeCallback(foreach);
            this.registerUpdateHandler(patchItems.bind(this));
        }
        else
        {
            items = foreach;
        }

        // Create child node items
        let index = 0;
        for (let item of items)
        {
            let itemContext = {
                item,
                outer: this.item,
            };

            itemContext.key = item_key.call(null, item, itemContext);
            itemContext.index = index++;

            let childNode = new VNode(this, childNodeTemplate, itemContext);
            itemNodes.push(childNode);
            this.childNodes.push(childNode);

            if (item_condition != null)
                childNode.excluded = !item_condition.call(null, item, itemContext);

            if (!childNode.excluded)
                childNode.create();
            //this.createChildNode(childNode);
        }

        // Handle updates
        function patchItems()
        {
            // Get the new items and their keys
            let newItems = this.invokeCallback(foreach);
            let newItemKeys = newItems.map(item => item_key.call(null, item, { item, outer: this.item }));

            // Work out the base index for items in this list
            let baseChildNodeIndex = nonForEachNodeCount;
            for (let i=0; i<forEachBlock.index; i++)
            {
                baseChildNodeIndex += this.forEachBlocks[i].itemNodes.length;
            }

            let pos = 0;
            diff(itemNodes, newItemKeys, 
                (op, index, count) => {

                    // Update condition on any existing nodes
                    if (pos < index)
                    {
                        updateExistingItems(pos, index - pos);
                    }

                    if (op == 'insert')
                    {
                        pos = index + count;
                        for (let i=0; i<count; i++)
                        {
                            // Create new item context
                            let itemContext = {
                                item: newItems[index + i],
                                outer: this.item,
                                key: newItemKeys[index + i],
                                index: index + i,
                            };
                
                            // Create new child node
                            let childNode = new VNode(this, childNodeTemplate, itemContext);
                            this.childNodes.splice(baseChildNodeIndex + index + i, 0, childNode);
                            itemNodes.splice(index + i, 0, childNode);

                            if (item_condition != null)
                                childNode.excluded = !item_condition.call(null, itemContext.item, itemContext);

                            if (!childNode.excluded)
                                childNode.create();
                            //this.createChildNode(childNode);
                        }
                    }
                    else
                    {
                        for (let i=0; i<count; i++)
                        {
                            // Delete child nodes
                            let childNode = itemNodes[index + i];
                            //this.destroyChildNode(childNode);
                            if (!childNode.excluded)
                                childNode.destroy();
                        }
                        itemNodes.splice(index, count);
                        this.childNodes.splice(baseChildNodeIndex + index, count);
                }
                }, 
                (a, b) => {
                    return a.item.key == b;
                }
            );

            // Update visibility of trailing items
            if (pos < itemNodes.length)
            {
                updateExistingItems(pos, itemNodes.length - pos);
            }

            function updateExistingItems(index, count)
            {
                // Quit if not necessary
                if (childNodeTemplate.item_needs_index !== true && !item_condition)
                    return;

                for (let i=0; i<count; i++)
                {
                    let itemNode = itemNodes[index + i];

                    if (item_condition)
                    {
                        let newExcluded = !item_condition.call(null, itemNode.item.item, itemNode.item);
                        if (newExcluded != itemNode.excluded)
                        {
                            itemNode.excluded = newExcluded;
                            if (newExcluded)
                            {
                                itemNode.create();
                            }
                            else
                            {
                                itemNode.destroy();
                            }
                        }
                    }

                    if (childNodeTemplate.item_needs_index && itemNode.item.index != index + i && !itemNode.excluded)
                    {
                        itemNode.item.index = index + i;
                        itemNode.update?.();
                    }
                }
            }
        }
    }

    createConditionalNode(childNodeTemplate)
    {
        let childNode = new VNode(this, childNodeTemplate, this.item);
        this.childNodes.push(childNode);

        if (typeof(childNodeTemplate.condition) === 'function')
        {
            let callback = childNodeTemplate.condition;
            let included = this.invokeCallback(callback);
            this.registerUpdateHandler(() => {

                let new_included = this.invokeCallback(callback);
                if (new_included != included)
                {
                    included = new_included;
                    if (included)
                    {
                        this.createChildNode(childNode);
                    }
                    else
                    {
                        this.destroyChildNode(childNode);
                    }
                }

            });
        }
        else
        {
            // statically excluded node?
            if (!childNodeTemplate.condition)
                return;
        }

        this.createChildNode(childNode);
    }

    createChildNode(childNode)
    {
        childNode.create();
        this.registerUpdateHandler(childNode.update);
    }

    destroyChildNode(childNode)
    {
        this.revokeUpdateHandler(childNode.update);
        childNode.destroy();
    }
}


export class Component
{
    constructor()
    {
    }


    getDomPosition(vnode)
    {
        return {
            parent: this.domNode,
            before: null,
        }
    }

    mount(domNode)
    {
        this.domNode = domNode;
        this.vnode = new VNode(this, this.template);
        this.vnode.create();
    }

    update()
    {
        this.vnode.update();
    }

    invalidate()
    {
        this.vnode.invalidate();
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