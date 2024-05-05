import { diff_keys } from "./diff_keys.js";

export class ForEachManager
{
    constructor(options)
    {
        this.options = options;
        this.items = [];
        this.headSentinal = document.createComment(" enter foreach ");
        this.tailSentinal = document.createComment(" leave foreach ");
    }

    get nodes()
    {
        if (this.options.multi_root_items)
        {
            let r = [ this.headSentinal ];
            for (let i=0; i<this.items.length; i++)
            {
                r.push(...this.items[i].rootNodes);
            }
            r.push(this.tailSentinal);
            return r;
        }
        else
        {
            return [this.headSentinal, ...this.items.map(x => x.rootNode), this.tailSentinal];
        }
    }

    destroy()
    {
        for (let i=0; i<this.items.length; i++)
        {
            this.items[i].destroy();
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
                item,
                outer: this.options.outer,
            };

            // Test condition
            if (this.options.condition && !this.options.condition.call(this.options.model, item, item.itemCtx))
                continue;

            // Setup key
            if (this.options.key)
            {
                itemCtx.key = this.options.item_key.call(this.options.model, item, item.itemCtx);
            }
            else
            {
                itemCtx.key = item;
            }

            // Deliberately don't set index field until after item_key called
            itemCtx.index = index;

            // Construct the item
            let item_closure = this.options.item_constructor(itemCtx);

            // Add to collections
            this.items.push(item_closure);
        }
    }

    // Update items
    updateItems(newItems)
    {
        // If not array sensitive, don't bother diffing
        if (!this.options.array_sensitive)
        {
            // If item's are sensitive then update them
            if (this.options.item_sensitive)
            {
                for (let i=0; i<this.items; i++)
                {
                    this.items[i].update();
                }
            }
            return;
        }

        // Get keys for all items
        let tempCtx = { outer: this.options.outer };

        // Filter out conditional items
        if (this.options.condition)
        {
            newItems = newItems.filter((item) => {
                tempCtx.item = item;
                return this.options.condition.call(this.options.model, item, tempCtx);
            });
        }

        // Generate keys
        let newKeys = this.options.item_key ? newItems.map((item) => {
            tempCtx.item = item;
            return this.options.item_key.call(this.options.model, item, tempCtx);
        }) : newItems;

        // Do we need to update existing items?
        let needCoverage = this.options.item_sensitive || this.options.index_sensitive;

        // Run diff
        let ops = diff_keys(this.items.map(x => x.itemCtx.key), newKeys, needCoverage);
        if (ops.length == 0)
            return;

        // Single or multi-root handlers
        let handlers;
        if (this.options.multi_root_items)
        {
            handlers = {
                insert: multi_root_insert,
                delete: multi_root_delete,
                move: multi_root_move,
                skip: () => {},
                keep: patch_existing,
            }
        }
        else
        {
            handlers = {
                insert: single_root_insert,
                delete: single_root_delete,
                move: single_root_move,
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
                    item: newItems[index + i],
                    outer: this.options.outer,
                    key: newKeys[index + i],
                    index: index + i,
                };

                // Construct the item
                let item_closure = this.options.item_constructor(itemCtx);

                // Add to item collection
                this.items.splice(index + i, 0, item_closure);

                // Build list of nodes to be inserted
                newNodes.push(...item_closure.rootNodes);
            }

            // Insert the nodes
            let insertBefore;
            if (index + count < this.items.length)
            {
                insertBefore = this.items[index + count].rootNodes[0];
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
                let children = this.items[index + i].rootNodes;
                for (let j = 0; j<children.length; j++)
                {
                    children[j].remove();
                }

                // Destroy the item
                this.items[index + i].destroy();
            }

            // Splice arrays
            this.items.splice(index, count);
        }

        function multi_root_move(op)
        {
            throw new Error("single root move not implemented");
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
                    item: newItems[index + i],
                    outer: this.options.outer,
                    key: newKeys[index + i],
                    index: index + i,
                };

                // Construct the item
                let item_closure = this.options.item_constructor(itemCtx);

                // Add to item collection
                this.items.splice(index + i, 0, item_closure);

                // Build list of nodes to be inserted
                newNodes.push(item_closure.rootNode);
            }

            // Insert the nodes
            let insertBefore;
            if (index + count < this.items.length)
            {
                insertBefore = this.items[index + count].rootNode;
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
                this.items[index + i].rootNode.remove();

                // Destroy the item
                this.items[index + i].destroy();
            }

            // Splice arrays
            this.items.splice(index, count);
        }

        function single_root_move(op)
        {
            throw new Error("single root move not implemented");
        }

        function patch_existing(op)
        {
            if (this.options.item_sensitive)
            {
                // If item sensitive, always update index and item
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this.items[i];
                    item.itemCtx.index = i;
                    item.update();
                }
            }
            else if (this.options.index_sensitive)
            {
                // If index sensitive, only update when index changes
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this.items[i];
                    if (item.itemCtx.index != i)
                    {
                        item.itemCtx.index = i;
                        item.update();
                    }
                }
            }
        }

    }
}
