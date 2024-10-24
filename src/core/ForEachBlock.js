import { diff_tiny } from "./diff_tiny.js";
import { TemplateNode } from "./TemplateNode.js";
import { env } from "./Environment.js";

export class ForEachBlock
{
    static integrate(template, compilerOptions)
    {
        let data = {
            itemConstructor: compilerOptions.compileTemplate(template.template),
            template: {
                items: template.items,
                condition: template.condition,
                itemKey: template.itemKey,
            },
        }


        let nodes;
        if (template.empty)
        {
            nodes = [ new TemplateNode(template.empty, compilerOptions) ];
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
        this.headSentinal = env.document?.createComment(" enter foreach block ");
        this.tailSentinal = env.document?.createComment(" leave foreach block ");

        // Single vs multi-root op helpers
        let insert, insert_dom, remove_dom;
        if (this.itemConstructor.isSingleRoot)
        {
            this.#insert = this.#single_root_insert;
            this.#delete = this.#single_root_delete;
            this.#insert_dom = this.#single_root_insert_dom;
            this.#remove_dom = this.#single_root_remove_dom;
        }
        else
        {
            this.#insert = this.#multi_root_insert;
            this.#delete = this.#multi_root_delete;
            this.#insert_dom = this.#multi_root_insert_dom;
            this.#remove_dom = this.#multi_root_remove_dom;
        }
        
    }

    onObservableUpdate(index, del, ins)
    {
        let tempCtx = { outer: this.outer };
        if (ins == 0 && del == 0)
        {
            let item = this.observableItems[index];
            let newItems = [ item ];
            let newKeys = null;
            if (this.itemKey)
            {
                tempCtx.model = item;
                newKeys = [ this.itemKey.call(item, item, tempCtx) ];
            }
            this.#patch_existing(newItems, newKeys, index, 0, 1);
        }
        else
        {
            // Over patch or keyed patch?
            let newKeys = null;
            let newItems = this.observableItems.slice(index, index + ins);
            if (this.itemKey)
            {
                // Get keys for all new items
                newKeys = newItems.map((item) => {
                    tempCtx.model = item;
                    return this.itemKey.call(item, item, tempCtx);
                });
            }

            if (ins && del)
            {
                // Update range
                this.#update_range(index, del, newItems, newKeys); 
            }
            else if (del != 0)
            {
                this.#delete(index, del);
            }
            else if (ins != 0)
            {
                this.#insert(newItems, newKeys, index, 0, ins);
            }

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

        // Get keys for all items
        let tempCtx = { 
            outer: this.outer 
        };

        // Run condition and key generation (except if using observable)
        let newKeys = null;
        if (!this.observableItems)
        {
            // Filter out conditional items
            if (this.condition)
            {
                newItems = newItems.filter((item) => {
                    tempCtx.model = item;
                    return this.condition.call(item, item, tempCtx);
                });
            }
        }

        // Generate keys
        if (this.itemKey)
        {
            newKeys = newItems.map((item) => {
                tempCtx.model = item;
                return this.itemKey.call(item, item, tempCtx);
            });
        }

        // Items not yet loaded?
        if (!this.itemsLoaded)
        {
            this.itemsLoaded = true;
            this.#insert(newItems, newKeys, 0, 0, newItems.length);
            this.#updateEmpty();
            return;
        }

        // Don't update observable items
        if (this.observableItems)
        {
            return;
        }

        // Update
        this.#update_range(0, this.itemDoms.length, newItems, newKeys);
    }
    
    render(w)
    {
        w.write(`<!-- enter foreach block -->`);
        for (let i=0; i<this.itemDoms.length; i++)
        {
            this.itemDoms[i].render(w);
        }
        w.write(`<!-- leave foreach block -->`);
    }

    #update_range(range_start, range_length, newItems, newKeys)
    {
        let range_end = range_start + range_length;

        // Get the old items in range
        let oldItemDoms;
        if (range_start == 0 && range_length == this.itemDoms.length)
            oldItemDoms = this.itemDoms;
        else
            oldItemDoms = this.itemDoms.slice(range_start, range_end);

        // Run diff or patch over
        let ops;
        if (newKeys)
        {
            ops = diff_tiny(oldItemDoms.map(x => x.context.key), newKeys);
        }
        else
        {
            if (newItems.length > oldItemDoms.length)
            {
                ops = [{ 
                    op: "insert", 
                    index: oldItemDoms.length,
                    count: newItems.length - oldItemDoms.length,
                }];
            }
            else if (newItems.length < oldItemDoms.length)
            {
                ops = [{
                    op: "delete",
                    index: newItems.length,
                    count: oldItemDoms.length - newItems.length,
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
            this.#patch_existing(newItems, newKeys, range_start, 0, range_length);
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


        // Dispatch to handlers
        let pos = 0;
        for (let o of ops)
        {
            if (o.index > pos)
            {
                this.#patch_existing(newItems, newKeys, range_start + pos, pos, o.index - pos);
                pos = o.index;
            }

            handlers[o.op].call(this, o);
        }
        
        // Patch trailing items
        if (pos < newItems.length)
            this.#patch_existing(newItems, newKeys, range_start + pos, pos, newItems.length - pos);

        // Destroy remaining spare items
        for (let i=spare.length-1; i>=0; i--)
        {
            spare[i].destroy();
        }

        // Update empty list indicator
        this.#updateEmpty();
        
        function op_insert(op)
        {
            pos += op.count;

            let useSpare = Math.min(spare.length, op.count);
            if (useSpare)
            {
                this.#insert_dom(op.index + range_start, spare.splice(0, useSpare));
                this.#patch_existing(newItems, newKeys, op.index + range_start, op.index, useSpare);
            }
            if (useSpare < op.count)
            {
                this.#insert(newItems, newKeys, op.index + range_start + useSpare, op.index + useSpare, op.count - useSpare);
            }
        }

        function op_delete(op)
        {
            spare.push(...this.#remove_dom(op.index + range_start, op.count));
        }

        function op_store(op)
        {
            store.push(...this.#remove_dom(op.index + range_start, op.count));
        }

        function op_restore(op)
        {
            pos += op.count;
            this.#insert_dom(op.index + range_start, store.slice(op.storeIndex, op.storeIndex + op.count));
            this.#patch_existing(newItems, newKeys, op.index + range_start, op.index, op.count);
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
                if (this.isAttached)
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
                if (this.isAttached)
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

    #insert;
    #insert_dom;
    #delete;
    #remove_dom;

    get isAttached()
    {
        return this.tailSentinal?.parentNode != null;
    }

    #multi_root_insert(newItems, newKeys, index, src_index, count)
    {
        let itemDoms = [];
        for (let i=0; i<count; i++)
        {
            // Setup item context
            let itemCtx = {
                outer: this.outer,
                model: newItems[src_index + i],
                key: newKeys?.[src_index + i],
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
        if (this.isAttached)
        {
            let newNodes = [];
            itemDoms.forEach(x => newNodes.push(...x.rootNodes));

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
            itemDoms[i].destroy();
        }
    }

    #multi_root_remove_dom(index, count)
    {
        // Destroy the items
        let isAttached = this.isAttached;
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

    #single_root_insert(newItems, newKeys, index, src_index, count)
    {
        let itemDoms = [];
        for (let i=0; i<count; i++)
        {
            // Setup item context
            let itemCtx = {
                outer: this.outer,
                model: newItems[src_index + i],
                key: newKeys?.[src_index + i],
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
        if (this.isAttached)
        {
            let newNodes = itemDoms.map(x => x.rootNode);

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
        let isAttached = this.isAttached;
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

    #patch_existing(newItems, newKeys, index, src_index, count)
    {
        // If item sensitive, always update index and item
        for (let i=0; i<count; i++)
        {
            let item = this.itemDoms[index + i];
            item.context.key = newKeys?.[src_index + i];
            item.context.index = index + i;
            item.context.model = newItems[src_index + i];
            item.rebind();
            item.update();
        }
    }
}
