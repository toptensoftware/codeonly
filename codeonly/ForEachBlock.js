import { diff_keys } from "./diff_keys.js";
import { Component } from "./Component.js";

export class ForEachManager extends Component
{
    static prepareTemplate(template)
    {
        return {
            isSingleRoot: false,
            wantsModel: true,
            wantsUpdate: true,
            templates: [ template.template ],
        }
    }

    constructor(options)
    {
        this._outer = null;
        this._itemConstructor = null;
        this._items = [];
        this._headSentinal = document.createComment(" enter foreach block ");
        this._tailSentinal = document.createComment(" leave foreach block ");
    }

    get outer()
    {
        return this._outer;
    }

    set outer(value)
    {
        this._outer = value;
    }

    get template()
    {
        return this._itemConstructor;
    }

    set template(value)
    {
        this._itemConstructor = value;
    }

    get hasSingleRootItems()
    {
        return this._itemConstructor.isSingleRoot;
    }

    get condition()
    {
        return this._condition;
    }

    set contition(value)
    {
        this._condition = value;
    }

    get nodes()
    {
        if (this.hasMultiRootItems)
        {
            let r = [ this._headSentinal ];
            for (let i=0; i<this._items.length; i++)
            {
                r.push(...this._items[i].rootNodes);
            }
            r.push(this._tailSentinal);
            return r;
        }
        else
        {
            return [this._headSentinal, ...this._items.map(x => x.rootNode), this._tailSentinal];
        }
    }

    destroy()
    {
        for (let i=0; i<this._items.length; i++)
        {
            this._items[i].destroy();
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
                outer: this._outer,
                item,
            };

            // Test condition
            if (this.options.condition && !this.options.condition.call(this.options.model, item, itemCtx))
                continue;

            // Setup key
            if (this.options.key)
            {
                itemCtx.key = this.options.item_key.call(this.options.model, item, itemCtx);
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
            this._items.push(item_closure);
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
                for (let i=0; i<this._items; i++)
                {
                    this._items[i].update();
                }
            }
            return;
        }

        // Get keys for all items
        let tempCtx = { 
            model: this.options.model,
            outer: this.options.outer 
        };

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
        let ops = diff_keys(this._items.map(x => x.itemCtx.key), newKeys, needCoverage);
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
                    model: this.options.model,
                    outer: this.options.outer,
                    item: newItems[index + i],
                    key: newKeys[index + i],
                    index: index + i,
                };

                // Construct the item
                let item_closure = this.options.item_constructor(itemCtx);

                // Add to item collection
                this._items.splice(index + i, 0, item_closure);

                // Build list of nodes to be inserted
                newNodes.push(...item_closure.rootNodes);
            }

            // Insert the nodes
            let insertBefore;
            if (index + count < this._items.length)
            {
                insertBefore = this._items[index + count].rootNodes[0];
            }
            else
            {
                insertBefore = this._tailSentinal;
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
                let children = this._items[index + i].rootNodes;
                for (let j = 0; j<children.length; j++)
                {
                    children[j].remove();
                }

                // Destroy the item
                this._items[index + i].destroy();
            }

            // Splice arrays
            this._items.splice(index, count);
        }

        function multi_root_move(op)
        {
            // Collect and remove DOM nodes
            let nodes = [];
            for (let i=0; i<op.count; i++)
            {
                nodes.push(...this._items[op.from + i].rootNodes);
            }
            for (let i=0; i<nodes.length; i++)
            {
                nodes[i].remove();
            }

            // Remove items
            let items = this._items.splice(op.from, op.count);

            // Re-insert items
            this._items.splice(op.to, 0, ...items);

            // Insert the nodes
            let insertBefore;
            if (op.to + op.count < this._items.length)
            {
                insertBefore = this._items[op.to + op.count].rootNodes[0];
            }
            else
            {
                insertBefore = this._tailSentinal;
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
                    model: this.options.model,
                    outer: this.options.outer,
                    item: newItems[index + i],
                    key: newKeys[index + i],
                    index: index + i,
                };

                // Construct the item
                let item_closure = this.options.item_constructor(itemCtx);

                // Add to item collection
                this._items.splice(index + i, 0, item_closure);

                // Build list of nodes to be inserted
                newNodes.push(item_closure.rootNode);
            }

            // Insert the nodes
            let insertBefore;
            if (index + count < this._items.length)
            {
                insertBefore = this._items[index + count].rootNode;
            }
            else
            {
                insertBefore = this._tailSentinal;
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
                this._items[index + i].rootNode.remove();

                // Destroy the item
                this._items[index + i].destroy();
            }

            // Splice arrays
            this._items.splice(index, count);
        }

        function single_root_move(op)
        {
            // Collect and remove DOM nodes
            let nodes = [];
            for (let i=0; i<op.count; i++)
            {
                nodes.push(this._items[op.from + i].rootNode);
            }
            for (let i=0; i<nodes.length; i++)
            {
                nodes[i].remove();
            }

            // Remove items
            let items = this._items.splice(op.from, op.count);

            // Re-insert items
            this._items.splice(op.to, 0, ...items);

            // Insert the nodes
            let insertBefore;
            if (op.to + op.count < this._items.length)
            {
                insertBefore = this._items[op.to + op.count].rootNodes[0];
            }
            else
            {
                insertBefore = this._tailSentinal;
            }
            insertBefore.before(...nodes);

        }

        function patch_existing(op)
        {
            if (this.options.item_sensitive)
            {
                // If item sensitive, always update index and item
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this._items[i];
                    item.itemCtx.index = i;
                    item.update();
                }
            }
            else if (this.options.index_sensitive)
            {
                // If index sensitive, only update when index changes
                for (let i=op.index, end = op.index + op.count; i<end; i++)
                {
                    let item = this._items[i];
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
