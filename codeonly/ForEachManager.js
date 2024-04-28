import { diff } from "./diff.js";

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

        // Run diff
        diff(this.items, newKeys, (this.options.multi_root_items ? multi_root_diff_handler : single_root_diff_handler).bind(this), (a, b) => a.itemCtx.key == b );

        // Diff handler for when item's might have multiple roots
        function multi_root_diff_handler(op, index, count)
        {
            if (op == 'insert')
            {
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
            else
            {
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
        }

        // Diff handler when the items are known to be single root
        function single_root_diff_handler(op, index, count)
        {
            if (op == 'insert')
            {
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
            else
            {
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
        }
    }
}