import { diff_keys } from "./diff.js";
import { Template } from "./Template.js";
import { TemplateNode } from "./TemplateNode.js";

export class ForEachBlock
{
    static integrate(template)
    {
        let data = {
            itemConstructor: Template.compile(template.template),
            template: {
                items: template.items,
                condition: template.condition,
                itemKey: template.itemKey,
            },
        }


        let nodes;
        if (template.empty)
        {
            nodes = [ new TemplateNode(template.empty) ];
        }

        delete template.template;
        delete template.items;
        delete template.condition;
        delete template.itemKey;
        delete template.empty;

        return {
            isSingleRoot: false,
            wantsUpdate: true,
            data: data,
            nodes: nodes
        }
    }

    static transform(template)
    {
        if (template.foreach === undefined)
            return template;

        let newTemplate;

        if (template.foreach instanceof Function || Array.isArray(template.foreach))
        {
            // Declared as an array all options default:
            //    foreach: <array>
            //    foreach: () => anything
            newTemplate = {
                type: ForEachBlock,
                template: template,
                items: template.foreach,
            };
            delete template.foreach;
        }
        else
        {
            // Declared as an object, with options maybe
            //    foreach: { items: }
            newTemplate = Object.assign({}, template.foreach, {
                type: ForEachBlock,
                template: template,
            });
            delete template.foreach;
        }

        return newTemplate;
    }

    static transformGroup(templates)
    {
        for (let i=1; i<templates.length; i++)
        {
            if (templates[i].else !== undefined)
            {
                // Transform previous item to ForEachBlock
                if (templates[i-1].foreach !== undefined)
                {
                    templates[i-1] = ForEachBlock.transform(templates[i-1]);
                }
                if (templates[i-1].type === ForEachBlock && !templates[i-1].else)
                {
                    delete templates[i].else;
                    templates[i-1].empty = templates[i];
                    templates.splice(i, 1);
                    i--;
                }  
            }
        }
    }

    constructor(options)
    {
        // Get the item consructor we compiled earlier
        this.itemConstructor = options.data.itemConstructor;

        // Use this context as the outer context for items
        this.outer = options.context;

        // Get loop options from the template
        this.items = options.data.template.items;
        this.condition = options.data.template.condition;
        this.itemKey = options.data.template.itemKey;
        this.emptyConstructor = options.nodes.length ? options.nodes[0] : null;

        // This will be an array of items constructed from the template
        this.itemDoms = [];

        // Sentinal nodes
        this.headSentinal = document.createComment(" enter foreach block ");
        this.tailSentinal = document.createComment(" leave foreach block ");

        if (options.initOnCreate)
        {
            this.update();
        }
    }

    onObservableUpdate(index, del, ins)
    {
        if (ins == 0 && del == 0)
        {
            this.#patch_existing(this.observableItems, index, 1);
        }
        else
        {
            if (del != 0)
                this.#delete(index, del);
                
            if (ins != 0)
                this.#insert(this.observableItems, null, index, ins);

            this.#updateEmpty();
        }
    }

    get rootNodes()
    {
        let emptyNodes = this.emptyDom ? this.emptyDom.rootNodes : [];

        if (!this.itemConstructor.isSingleRoot)
        {
            let r = [ this.headSentinal ];
            for (let i=0; i<this.itemDoms.length; i++)
            {
                r.push(...this.itemDoms[i].rootNodes);
            }
            r.push(...emptyNodes);
            r.push(this.tailSentinal);
            return r;
        }
        else
        {
            return [this.headSentinal, ...this.itemDoms.map(x => x.rootNode), ...emptyNodes, this.tailSentinal];
        }
    }

    update()
    {
        // Resolve the items collection
        let newItems;
        if (this.items instanceof Function)
        {
            newItems = this.items.call(this.outer.model, this.outer.model, this.outer);
        }
        else
        {
            newItems = this.items;
        }
        newItems = newItems ?? [];

        // Disconnect old observable items?
        if (this.observableItems != null && this.observableItems != newItems)
        {
            this.observableItems.removeListener(this._onObservableUpdate);
        }

        // Connect new observableItems
        if (Array.isArray(newItems) && newItems.isObservable)
        {
            // Different instance?
            if (this.observableItems != newItems)
            {
                // Connect listener
                this._onObservableUpdate = this.onObservableUpdate.bind(this);
                this.observableItems = newItems;
                this.observableItems.addListener(this._onObservableUpdate);

                // Reload items
                this.#delete(0, this.itemDoms.length);
                this.itemsLoaded = false;
            }
        }

        // Run condition and key generation (except if using observable)
        let newKeys = null;
        if (!this.observableItems)
        {
            // Get keys for all items
            let tempCtx = { 
                outer: this.outer 
            };

            // Filter out conditional items
            if (this.condition)
            {
                newItems = newItems.filter((item) => {
                    tempCtx.model = item;
                    return this.condition.call(item, item, tempCtx);
                });
            }

            // Generate keys
            newKeys = this.itemKey ? newItems.map((item) => {
                tempCtx.item = item;
                return this.itemKey.call(item, item, tempCtx);
            }) : newItems;
        }

        // Items not yet loaded?
        if (!this.itemsLoaded)
        {
            this.itemsLoaded = true;
            this.#insert(newItems, newKeys, 0, newItems.length);
            this.#updateEmpty();
            return;
        }

        // If not array sensitive or using an observable items array
        // then don't bother diffing
        if (this.observableItems)
        {
            // Patch existing items and quit
            this.#patch_existing(newItems, 0, this.itemDoms.length);
            this.#updateEmpty();
            return;
        }

        // Run diff
        let ops = diff_keys(this.itemDoms.map(x => x.context.key), newKeys, true);
        if (ops.length == 0)
            return;

        // Single or multi-root handlers
        let handlers;
        if (this.itemConstructor.isSingleRoot)
        {
            handlers = {
                insert: single_root_insert,
                delete: single_root_delete,
                keep: patch_existing,
            }
        }
        else
        {
            handlers = {
                insert: multi_root_insert,
                delete: multi_root_delete,
                keep: patch_existing,
            }
        }

        // Dispatch to handlers
        for (let o of ops)
        {
            handlers[o.op].call(this, o);
        }

        this.#updateEmpty();
        
        function multi_root_insert(op)
        {
            this.#multi_root_insert(newItems, newKeys, op.index, op.count);
        }

        function multi_root_delete(op)
        {
            this.#multi_root_delete(op.index, op.count);
        }

        function single_root_insert(op)
        {
            this.#single_root_insert(newItems, newKeys, op.index, op.count);
        }

        function single_root_delete(op)
        {
            this.#single_root_delete(op.index, op.count);
        }

        function patch_existing(op)
        {
            this.#patch_existing(newItems, op.index, op.count);
        }
    }

    bind()
    {
        this.emptyDom?.bind?.();
    }

    unbind()
    {
        this.emptyDom?.unbind?.();
    }

    destroy()
    {
        if (this.observableItems != null)
        {
            this.observableItems.removeListener(this._onObservableUpdate);
            this.observableItems = null;
        }

        for (let i=0; i<this.itemDoms.length; i++)
        {
            this.itemDoms[i].destroy();
        }

        this.itemDoms = null;
    }

    #updateEmpty()
    {
        if (this.itemDoms.length == 0)
        {
            if (!this.emptyDom && this.emptyConstructor)
            {
                this.emptyDom = this.emptyConstructor();
                if (this.tailSentinal.parentNode)
                    this.tailSentinal.before(...this.emptyDom.rootNodes);
            }
            if (this.emptyDom)
            {
                this.emptyDom.update();
            }
        }
        else
        {
            if (this.emptyDom)
            {
                if (this.tailSentinal.parentNode)
                {
                    for (var n of this.emptyDom.rootNodes)
                    {
                        n.remove();
                    }
                }
                this.emptyDom.destroy();
                this.emptyDom = null;
            }
        }
    }

    #insert(newItems, newKeys, index, count)
    {
        if (this.itemConstructor.isSingleRoot)
            this.#single_root_insert(newItems, newKeys, index, count);
        else
            this.#multi_root_insert(newItems, newKeys, index, count);
    }

    #delete(index, count)
    {
        if (this.itemConstructor.isSingleRoot)
            this.#single_root_delete(index, count);
        else
            this.#multi_root_delete(index, count);
    }

    #multi_root_insert(newItems, newKeys, index, count)
    {
        let newNodes = [];
        for (let i=0; i<count; i++)
        {
            // Setup item context
            let itemCtx = {
                outer: this.outer,
                model: newItems[index + i],
                key: newKeys?.[index + i],
                index: index + i,
            };

            // Construct the item
            let itemDom = this.itemConstructor(itemCtx);

            // Add to item collection
            this.itemDoms.splice(index + i, 0, itemDom);

            // Build list of nodes to be inserted
            newNodes.push(...itemDom.rootNodes);
        }

        // Insert the nodes
        if (this.tailSentinal.parentNode)
        {
            let insertBefore;
            if (index + count < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[index + count].rootNodes[0];
            }
            else
            {
                insertBefore = this.tailSentinal;
            }
            insertBefore.before(...newNodes);
        }
    }

    #multi_root_delete(index, count)
    {
        // Destroy the items
        let isAttached = this.tailSentinal.parentNode != null;
        for (let i=0; i<count; i++)
        {
            // Remove child nodes
            if (isAttached)
            {
                let children = this.itemDoms[index + i].rootNodes;
                for (let j = 0; j<children.length; j++)
                {
                    children[j].remove();
                }
            }

            // Destroy the item
            this.itemDoms[index + i].destroy();
        }

        // Splice arrays
        this.itemDoms.splice(index, count);
    }

    #single_root_insert(newItems, newKeys, index, count)
    {
        let newNodes = [];
        for (let i=0; i<count; i++)
        {
            // Setup item context
            let itemCtx = {
                outer: this.outer,
                model: newItems[index + i],
                key: newKeys?.[index + i],
                index: index + i,
            };

            // Construct the item
            let item_closure = this.itemConstructor(itemCtx);

            // Add to item collection
            this.itemDoms.splice(index + i, 0, item_closure);

            // Build list of nodes to be inserted
            newNodes.push(item_closure.rootNode);
        }

        // Insert the nodes
        if (this.tailSentinal.parentNode)
        {
            let insertBefore;
            if (index + count < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[index + count].rootNode;
            }
            else
            {
                insertBefore = this.tailSentinal;
            }
            insertBefore.before(...newNodes);
        }
    }

    #single_root_delete(index, count)
    {
        // Destroy the items
        let isAttached = this.tailSentinal.parentNode != null;
        for (let i=0; i<count; i++)
        {
            // Remove child nodes
            if (isAttached)
            {
                this.itemDoms[index + i].rootNode.remove();
            }

            // Destroy the item
            this.itemDoms[index + i].destroy();
        }

        // Splice arrays
        this.itemDoms.splice(index, count);
    }

    #patch_existing(newItems, index, count)
    {
        // If item sensitive, always update index and item
        for (let i=index, end = index + count; i<end; i++)
        {
            let item = this.itemDoms[i];
            item.context.index = i;
            item.context.model = newItems[i];
            item.rebind();
            item.update();
        }
    }
}
