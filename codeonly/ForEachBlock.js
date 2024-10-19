import { diff_tiny } from "./diff_tiny.js";
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
            this.#patch_existing(this.observableItems, null, index, 1);
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
            if (this.itemKey)
            {
                newKeys = newItems.map((item) => {
                    tempCtx.model = item;
                    return this.itemKey.call(item, item, tempCtx);
                });
            }
        }

        // Items not yet loaded?
        if (!this.itemsLoaded)
        {
            this.itemsLoaded = true;
            this.#insert(newItems, newKeys, 0, newItems.length);
            this.#updateEmpty();
            return;
        }

        // If using an observable items array
        // then don't bother diffing
        if (this.observableItems)
        {
            // Patch existing items and quit
            this.#patch_existing(this.observableItems, null, 0, this.itemDoms.length);
            this.#updateEmpty();
            return;
        }

        // Run diff or patch over
        let ops;
        if (newKeys)
        {
            ops = diff_tiny(this.itemDoms.map(x => x.context.key), newKeys, true);
        }
        else
        {
            if (newItems.length > this.itemDoms.length)
            {
                ops = [{ 
                    op: "insert", 
                    index: this.itemDoms.length,
                    count: newItems.length - this.itemDoms.length,
                }];
            }
            else if (newItems.length < this.itemDoms.length)
            {
                ops = [{
                    op: "delete",
                    index: newItems.length,
                    count: this.itemDoms.length - newItems.length,
                }];
            }
            else
            {
                ops = [];
            }
        }

        // Run diff
        if (ops.length == 0)
        {
            this.#patch_existing(newItems, newKeys, 0, newItems.length);
            return;
        }

        let store = [];
        let spare = [];

        // Op dispatch table
        let handlers = {
            insert: op_insert,
            delete: op_delete,
            store: op_store,
            restore: op_restore,
        };

        // Single vs multi-root op helpers
        let insert, insert_dom, remove_dom;
        if (this.itemConstructor.isSingleRoot)
        {
            insert = this.#single_root_insert;
            insert_dom = this.#single_root_insert_dom;
            remove_dom = this.#single_root_remove_dom;
        }
        else
        {
            insert = this.#multi_root_insert;
            insert_dom = this.#multi_root_insert_dom;
            remove_dom = this.#multi_root_remove_dom;
        }

        // Dispatch to handlers
        let pos = 0;
        for (let o of ops)
        {
            if (o.index > pos)
                this.#patch_existing(newItems, newKeys, pos, o.index - pos);

            handlers[o.op].call(this, o);
        }
        
        // Patch trailing items
        if (pos < newItems.length)
            this.#patch_existing(newItems, newKeys, pos, newItems.length - pos);

        // Destroy remaining spare items
        for (let i=spare.length-1; i>=0; i--)
        {
            spare[i].destroy();
        }

/*
        for (let i=0; i<this.itemDoms.length; i++)
        {
            if (this.itemDoms[i].context.model != newItems[i])
                debugger;
        }
*/

        // Update empty list indicator
        this.#updateEmpty();
        
        function op_insert(op)
        {
            pos += op.count;

            let useSpare = Math.min(spare.length, op.count);
            if (useSpare)
            {
                insert_dom.call(this, op.index, spare.splice(0, useSpare));
                this.#patch_existing(newItems, newKeys, op.index, useSpare);
            }
            if (useSpare < op.count)
            {
                insert.call(this, newItems, newKeys, op.index, op.count);
            }
        }

        function op_delete(op)
        {
            spare.push(...remove_dom.call(this, op.index, op.count));
        }

        function op_store(op)
        {
            store.push(...remove_dom.call(this, op.index, op.count));
        }

        function op_restore(op)
        {
            pos += op.count;
            insert_dom.call(this, op.index, store.slice(op.index, op.index + op.count));
            this.#patch_existing(newItems, newKeys, op.index, op.count);
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
        let itemDoms = [];
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
            itemDoms.push(this.itemConstructor(itemCtx));
        }

        this.#multi_root_insert_dom(index, itemDoms);
    }

    #multi_root_insert_dom(index, itemDoms)
    {
        // Save dom elements
        this.itemDoms.splice(index, 0, ...itemDoms);

        // Insert the nodes
        let newNodes = [];
        itemDoms.forEach(x => newNodes.push(...x.rootNodes));
        if (this.tailSentinal.parentNode)
        {
            let insertBefore;
            if (index + itemDoms.length < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[index + itemDoms.length].rootNodes[0];
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
        let itemDoms = this.#multi_root_remove_dom(index, count);
        for (let i = itemDoms.length-1; i>=0; i--)
        {
            itemsDoms[i].destroy();
        }
    }

    #multi_root_remove_dom(index, count)
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
        }

        // Splice arrays
        return this.itemDoms.splice(index, count);
    }

    #single_root_insert(newItems, newKeys, index, count)
    {
        let itemDoms = [];
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
            itemDoms.push(this.itemConstructor(itemCtx));
        }

        this.#single_root_insert_dom(index, itemDoms);
    }

    #single_root_insert_dom(index, itemDoms)
    {
        // Save dom elements
        this.itemDoms.splice(index, 0, ...itemDoms);

        // Insert the nodes
        let newNodes = itemDoms.map(x => x.rootNode);;
        if (this.tailSentinal.parentNode)
        {
            let insertBefore;
            if (index + itemDoms.length < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[index + itemDoms.length].rootNode;
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
        let itemDoms = this.#single_root_remove_dom(index, count);
        for (let i = itemDoms.length - 1; i>=0; i--)
        {
            itemDoms[i].destroy();
        }
    }

    #single_root_remove_dom(index, count)
    {
        // Remove
        let isAttached = this.tailSentinal.parentNode != null;
        for (let i=0; i<count; i++)
        {
            // Remove child nodes
            if (isAttached)
            {
                this.itemDoms[index + i].rootNode.remove();
            }
        }

        // Splice arrays
        return this.itemDoms.splice(index, count);
    }

    #patch_existing(newItems, newKeys, index, count)
    {
        // If item sensitive, always update index and item
        for (let i=index, end = index + count; i<end; i++)
        {
            let item = this.itemDoms[i];
            item.context.key = newKeys?.[i];
            item.context.index = i;
            item.context.model = newItems[i];
            item.rebind();
            item.update();
        }
    }
}
