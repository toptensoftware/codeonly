import { diff } from "./diff.js";

export class ForEachManager
{
    constructor(options)
    {
        this.options = options;
        this.items = [];
        this.nodes = [];
    }

    // Load initial items
    loadItems(items)
    {
        if (!items)
            items = [];

        // Construct all items
        items.forEach((item, index) => {

            // Setup item context
            let itemCtx = {
                item,
                outer: this.options.outer,
            };

            // Setup key
            if (this.options.key)
            {
                itemCtx.key = this.options.item_key.call(this.options.model, item.itemCtx);
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
            this.nodes.push(item_closure.rootNode);
        });

        // Return array of nodes
        return this.nodes;
    }

    // Update items
    updateItems(items)
    {
        // Get keys for all items
        let tempCtx = { outer: this.options.outer };
        let newKeys = this.options.item_key ? item.map((item) => {
            tempCtx.item = item;
            return this.options.item_key.call(this.options.model, item, tempCtx);
        }) : items;

        // Diff keys
        diff(this.items, newKeys, (op, index, count) => {
            if (op == 'insert')
            {
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

                    // Add to collections
                    this.items.splice(index + i, 0, item_closure);
                    this.nodes.splice(index + i, 0, item_closure.rootNode);
                }
            }
            else
            {
                // Destroy the items
                for (let i=0; i<count; i++)
                {
                    this.items[index + i].destroy();
                }

                // Splice arrays
                this.items.splice(index, count);
                this.nodes.splice(index, count);
            }
        },
        (a, b) => a.itemCtx.key == b );
    }
}