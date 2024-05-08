import { diff_keys } from "./diff_keys.js";
import { Template } from "./Template.js";

export class ForEachBlock
{
    static integrate(template)
    {
        let data = {
            itemConstructor: Template.compile(template.template, { initOnCreate: true}),
            template,
        }

        return {
            isSingleRoot: false,
            wantsUpdate: true,
            data: data,
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
        this.arraySensitive = options.data.template.arraySensitive !== false;
        this.itemSensitive = options.data.template.itemSensitive !== false;
        this.indexSensitive = options.data.template.indexSensitive !== false;

        // This will be an array of items constructed from the template
        this.itemDoms = [];

        // Sentinal nodes
        this.headSentinal = document.createComment(" enter foreach block ");
        this.tailSentinal = document.createComment(" leave foreach block ");

        if (options.initOnCreate)
        {
            this.loadItems(this.resolveItems());
        }
    }

    resolveItems()
    {
        if (this.items instanceof Function)
        {
            return this.items.call(this.outer.model, this.outer.model, this.outer);
        }
        else
        {
            return this.items;
        }
    }

    get rootNodes()
    {
        if (!this.itemConstructor.isSingleRoot)
        {
            let r = [ this.headSentinal ];
            for (let i=0; i<this.itemDoms.length; i++)
            {
                r.push(...this.itemDoms[i].rootNodes);
            }
            r.push(this.tailSentinal);
            return r;
        }
        else
        {
            return [this.headSentinal, ...this.itemDoms.map(x => x.rootNode), this.tailSentinal];
        }
    }

    update()
    {
        this.updateItems(this.resolveItems());
    }

    destroy()
    {
        for (let i=0; i<this.itemDoms.length; i++)
        {
            this.itemDoms[i].destroy();
        }
    }

    // Load initial items
    loadItems(items)
    {
        if (!items)
            items = [];

        // Construct all items
        for (let index=0; index<items.length; index++)
        {
            // Get item
            let item = items[index];

            // Setup item context
            let itemCtx = {
                outer: this.outer,
                model: item,
            };

            // Test condition
            if (this.condition && !this.condition.call(item, item, itemCtx))
                continue;

            // Setup key
            if (this.itemKey)
            {
                itemCtx.key = this.itemKey.call(item, item, itemCtx);
            }
            else
            {
                itemCtx.key = item;
            }

            // Deliberately don't set index field until after itemKey called
            itemCtx.index = index;

            // Construct the item
            let itemDom = this.itemConstructor(itemCtx);

            // Add to collections
            this.itemDoms.push(itemDom);
        }
    }

    // Update items
    updateItems(newItems)
    {
        // If not array sensitive, don't bother diffing
        if (!this.arraySensitive)
        {
            // If item's are sensitive then update them
            if (this.itemSensitive)
            {
                for (let i=0; i<this.itemDoms; i++)
                {
                    this.itemDoms[i].update();
                }
            }
            return;
        }

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
        let newKeys = this.itemKey ? newItems.map((item) => {
            tempCtx.item = item;
            return this.itemKey.call(item, item, tempCtx);
        }) : newItems;

        // Do we need to update existing items?
        let needCoverage = this.itemSensitive || this.indexSensitive;

        // Run diff
        let ops = diff_keys(this.itemDoms.map(x => x.context.key), newKeys, needCoverage);
        if (ops.length == 0)
            return;

        // Single or multi-root handlers
        let handlers;
        if (this.itemConstructor.isSingleRoot)
        {
            handlers = {
                insert: single_root_insert,
                delete: single_root_delete,
                move: single_root_move,
                skip: () => {},
                keep: patch_existing,
            }
        }
        else
        {
            handlers = {
                insert: multi_root_insert,
                delete: multi_root_delete,
                move: multi_root_move,
                skip: () => {},
                keep: patch_existing,
            }
        }

        // Dispatch to handlers
        for (let o of ops)
        {
            handlers[o.op].call(this, o);
        }

        function multi_root_insert(op)
        {
            let index = op.index;
            let count = op.count;
            let newNodes = [];
            for (let i=0; i<count; i++)
            {
                // Setup item context
                let itemCtx = {
                    outer: this.outer,
                    model: newItems[index + i],
                    key: newKeys[index + i],
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

        function multi_root_delete(op)
        {
            let index = op.index;
            let count = op.count;

            // Destroy the items
            for (let i=0; i<count; i++)
            {
                // Remove child nodes
                let children = this.itemDoms[index + i].rootNodes;
                for (let j = 0; j<children.length; j++)
                {
                    children[j].remove();
                }

                // Destroy the item
                this.itemDoms[index + i].destroy();
            }

            // Splice arrays
            this.itemDoms.splice(index, count);
        }

        function multi_root_move(op)
        {
            // Collect and remove DOM nodes
            let nodes = [];
            for (let i=0; i<op.count; i++)
            {
                nodes.push(...this.itemDoms[op.from + i].rootNodes);
            }
            for (let i=0; i<nodes.length; i++)
            {
                nodes[i].remove();
            }

            // Remove items
            let items = this.itemDoms.splice(op.from, op.count);

            // Re-insert items
            this.itemDoms.splice(op.to, 0, ...items);

            // Insert the nodes
            let insertBefore;
            if (op.to + op.count < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[op.to + op.count].rootNodes[0];
            }
            else
            {
                insertBefore = this.tailSentinal;
            }
            insertBefore.before(...nodes);
        }

        function single_root_insert(op)
        {
            let index = op.index;
            let count = op.count;
            let newNodes = [];
            for (let i=0; i<count; i++)
            {
                // Setup item context
                let itemCtx = {
                    outer: this.outer,
                    model: newItems[index + i],
                    key: newKeys[index + i],
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

        function single_root_delete(op)
        {
            let index = op.index;
            let count = op.count;
            // Destroy the items
            for (let i=0; i<count; i++)
            {
                // Remove child nodes
                this.itemDoms[index + i].rootNode.remove();

                // Destroy the item
                this.itemDoms[index + i].destroy();
            }

            // Splice arrays
            this.itemDoms.splice(index, count);
        }

        function single_root_move(op)
        {
            // Collect and remove DOM nodes
            let nodes = [];
            for (let i=0; i<op.count; i++)
            {
                nodes.push(this.itemDoms[op.from + i].rootNode);
            }
            for (let i=0; i<nodes.length; i++)
            {
                nodes[i].remove();
            }

            // Remove items
            let items = this.itemDoms.splice(op.from, op.count);

            // Re-insert items
            this.itemDoms.splice(op.to, 0, ...items);

            // Insert the nodes
            let insertBefore;
            if (op.to + op.count < this.itemDoms.length)
            {
                insertBefore = this.itemDoms[op.to + op.count].rootNodes[0];
            }
            else
            {
                insertBefore = this.tailSentinal;
            }
            insertBefore.before(...nodes);

        }

        function patch_existing(op)
        {
            if (this.itemSensitive)
            {
                // If item sensitive, always update index and item
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this.itemDoms[i];
                    item.context.index = i;
                    item.update();
                }
            }
            else if (this.indexSensitive)
            {
                // If index sensitive, only update when index changes
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this.itemDoms[i];
                    if (item.context.index != i)
                    {
                        item.context.index = i;
                        item.update();
                    }
                }
            }
        }

    }
}
