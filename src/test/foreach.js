import { test } from "node:test";
import { strict as assert } from "node:assert";
import "./mockdom.js";
import { Template, ObservableArray, Component, env } from "../codeonly.js";

function assert_iterables(a, b)
{
    assert.deepStrictEqual(Array.from(a), Array.from(b));
}


test("ForEach Content Static", () => {
    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: [ "apples", "pears", "bananas" ],
                _: "DIV",
                text: x => x,
            }
        ]
    })();

    assert.equal(r.rootNodes[0].childNodes.length, 5);
    assert.equal(r.rootNodes[0].childNodes[0].nodeType, 8);
    assert.equal(r.rootNodes[0].childNodes[1].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[2].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[3].nodeType, 1);
    assert.equal(r.rootNodes[0].childNodes[4].nodeType, 8);
});

function assert_foreach_content(r, items, actual, expected, opts)
{
    // Initial
    assert_iterables(Array.from(actual().map(x => x.innerText)), Array.from(expected()));

    // Append
    items.push("D", "E");
    assert_items();

    // Prepend
    items.unshift("F", "G");
    assert_items();

    // Remove from front
    items.shift();
    items.shift();
    assert_items();

    // Remove from end
    items.pop();
    items.pop();
    assert_items();

    // Insert
    items.splice(1, 0, "H");
    assert_items();

    // Delete
    items.splice(1, 1);
    assert_items();

    // Replace
    items.splice(1, 1, "I");
    assert_items();

    // Replace few with many
    items.splice(1, 2, "J", "K", "L", "M", "N");
    assert_items();

    // Replace many with few
    items.splice(1, 5, "O", "P");
    assert_items();

    // Clear
    items.splice(0, items.length);
    assert_items();

    // Insert again
    items.push("J", "K", "L", "M", "N", "O", "P", "Q");
    assert_items();

    // Move right
    let temp = items.splice(0, 3);
    items.push(...temp);
    assert_items();

    // Move left
    temp = items.splice(-3, 3);
    items.unshift(...temp);
    assert_items();

    function assert_items()
    {
        // Do the update
        if (!items.isObservable)
            r.update();

        // Check items match
        assert_iterables(actual().map(x => x.innerText), expected());
    }
}


test("ForEach Content (diff, unkeyed)", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: () => items,
                _: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1);
    }

    function expected()
    {
        return items;
    }
});

test("ForEach Content (diff, keyed)", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                    itemKey: x => x,
                },
                _: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1);
    }

    function expected()
    {
        return items;
    }
});

test("ForEach Content (observable, unkeyed)", () => {

    let items = new ObservableArray();
    items.push("A", "B", "C");

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: () => items,
                _: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1);
    }

    function expected()
    {
        return items;
    }
});


test("ForEach Content (observable, keyed)", () => {

    let items = new ObservableArray();
    items.push("A", "B", "C");

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                    itemKey: x => x
                },
                _: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1);
    }

    function expected()
    {
        return items;
    }
});


test("ForEach Content (fragment)", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        $: [
            {
                foreach: () => items,
                $: [
                    {
                        _: "DIV",
                        text: x => x,
                    },
                    {
                        _: "SPAN",
                        text: x => x,
                    }
                ]
        }
        ]
    })();

    let outer = env.document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return outer.childNodes.slice(1, -1).filter((x,i) => i % 2 == 0);
    }

    function expected()
    {
        return items;
    }

});


test("ForEach Content (conditional items)", () => {

    let items = [ "A", "B", "C" ];

    let mod = 2;
    let modEq = 0;
    function check_condition(item)
    {
        return item.charCodeAt(0) % mod == modEq;
    }

    let r = Template.compile({
        $: [
            {
                foreach: {
                    items: () => items,
                    condition: check_condition,
                },
                _: "DIV",
                text: x => x,
            }
        ]
    })();

    let outer = env.document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return outer.childNodes.slice(1, -1);
    }

    function expected()
    {
        return items.filter(check_condition);
    }

});

test("ForEach Content (index sensitive)", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: () => items,
                _: "DIV",
                text: (x, ctx) => `${x}${ctx.index}`,
            }
        ]
    })();

    assert_iterables(["A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.unshift("Z");
    r.update();

    assert_iterables(["Z0", "A1", "B2", "C3"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.splice(2, 1);
    r.update();

    assert_iterables(["Z0", "A1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));
});



test("ForEach Content (nested)", () => {

    let items = [
        { name: "A", subItems: [ "1", "2"], },
        { name: "B", subItems: [ "3", "4"], },
    ];

    let r = Template.compile(
    {
        _: "DIV",
        $: 
        [
            {
                foreach: () => items,
                $: 
                [
                    {
                        foreach: (item) => item.subItems,
                        _: "DIV",
                        text: (subItem, ctx) => `${ctx.outer.model.name}${subItem}`,
                    }
                ],
            }
        ]
    })();

    assert_iterables([
        "A1", "A2", "B3", "B4"
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));

    items[0].subItems.push("3");
    r.update();

    assert_iterables([
        "A1", "A2", "A3", "B3", "B4"
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));

});


test("ForEach Content (with else block)", () => {

    let items = [];

    let r = Template.compile(
    {
        _: "DIV",
        $: [
            {
                _: "DIV",
                foreach: () => items,
                text: x => x,
            },
            {
                else: true,
                _: "DIV",
                text: "Empty!",
                export: "empty",
            }
        ],
    })();

    assert_iterables([
        "Empty!",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));

    assert.equal(r.empty.innerText, "Empty!");


    items = [ "apples", "bananas" ];
    r.update();
    assert_iterables([
        "apples", "bananas",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty, null);


    items = [ ];
    r.update();
    assert_iterables([
        "Empty!",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty.innerText, "Empty!");


    items = [ "foo", "bar" ];
    r.update();
    assert_iterables([
        "foo", "bar"
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty, null);
});


class ItemComponent extends Component
{
    constructor()
    {
        super();
    }

    #item
    get item()
    {
        return this.#item;
    }
    set item(value)
    {
        if (this.#item != value)
        {
            this.#item = value;
            this.invalidate();
        }
    }

    update()
    {
        ItemComponent.updateCount++;
        super.update();
    }

    static template = {
        _: "DIV",
        text: c => c.item.name,
    }

    static updateCount = 0;
}

test("ForEach Update Count Check", async () => {

    let items = [ 
        { name: "Apples" },
        { name: "Pears" },
        { name: "Bananas" },
    ];

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                    itemKey: i => i.name,
                },
                _: ItemComponent,
                item: i => i,
            }
        ]
    })();

    assert.equal(r.rootNode.childNodes[1].innerText, "Apples");
    assert.equal(r.rootNode.childNodes[2].innerText, "Pears");
    assert.equal(r.rootNode.childNodes[3].innerText, "Bananas");

    // There shouldn't be any updates yet
    assert.equal(ItemComponent.updateCount, 0);

    items.push({ name: "Berries" });
    r.update();

    // Check the new item got added 
    assert.equal(r.rootNode.childNodes[1].innerText, "Apples");
    assert.equal(r.rootNode.childNodes[2].innerText, "Pears");
    assert.equal(r.rootNode.childNodes[3].innerText, "Bananas");
    assert.equal(r.rootNode.childNodes[4].innerText, "Berries");

    // There still shouldn't be any updates, because we've only added new
    // items, not updated existing ones
    assert.equal(ItemComponent.updateCount, 0);

    // If we change one item with a new object instance with the same key,
    // we should get one update
    items[0] = { name: "Apples" };
    r.update();
    await env.window.waitAnimationFrames();
    assert.equal(ItemComponent.updateCount, 1);

    // If we change one item with a new object instance with the different key,
    // we should get one update because the old delete item should be re-used
    items[0] = { name: "Watermelon" };
    r.update();
    await env.window.waitAnimationFrames();
    assert.equal(ItemComponent.updateCount, 2);

});


class TextItem extends Component
{
    constructor()
    {
        super();
        TextItem.createCount++;
        TextItem.instanceCount++;
    }

    update()
    {
        super.update();
        TextItem.updateCount++;
    }

    destroy()
    {
        super.destroy();
        TextItem.destroyCount++;
        TextItem.instanceCount--;
    }

    static instanceCount;
    static createCount;
    static updateCount;
    static destroyCount;

    static reset()
    {
        this.instanceCount = 0;
        this.updateCount = 0;
        this.createCount = 0;
        this.destroyCount = 0;
    }

    static resetCycle()
    {
        this.updateCOunt = 0
        this.createCount = 0;
        this.destroyCount = 0;
    }

    #text;
    get text() { return this.#text; }
    set text(value) { this.#text = "" + value; this.invalidate() }

    static template = { 
        _: "DIV",
        text: x => x.text,
    }
}

test("ForEach Item Life (diff, unkeyed)", () => {

    TextItem.reset();

    let items = [ 
        "Apples",
        "Pears",
        "Bananas",
        "Berries",
    ];

    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                },
                _: TextItem,
                text: i => i,
            }
        ]
    })();

    assert.equal(TextItem.instanceCount, items.length);

    items.splice(1, 2,  
        "Melons",
        "Oranges",
        "Lemons",
    );
    TextItem.resetCycle();
    r.update();
    assert.equal(TextItem.instanceCount, items.length);
    assert.equal(TextItem.destroyCount, 0);
    assert.equal(TextItem.createCount, 1);

    items.splice(1, 2);
    TextItem.resetCycle();
    r.update();
    assert.equal(TextItem.instanceCount, items.length);
    assert.equal(TextItem.destroyCount, 2);
    assert.equal(TextItem.createCount, 0);

});


function test_item_life(r, items)
{
    assert.equal(TextItem.instanceCount, items.length);

    function run_edit(cb)
    {
        TextItem.resetCycle();

        // Capture the current item -> node mapping
        let nodes = r.rootNodes[0].childNodes.slice(1, -1);
        assert.equal(nodes.length, items.length);
        let nodeMap = new Map();
        for (let i=0; i<items.length; i++)
        {
            nodeMap.set(items[i], nodes[i]);
        }

        let edits;
        if (items.isObservable)
        {
            // For observable arrays we need
            // to do all the edits in a single update
            // otherwise items aren't re-used in the
            // same manner.  Copy to a temp array
            // make the edits and then merge back 
            let wip = Array.from(items);
            edits = cb(wip);

            // Work out what actually changed
            let start = 0;
            while (start < wip.length && 
                   start < items.length && 
                   wip[start] == items[start])
                start++;
            let end = 0;
            while (items.length - end > 0 &&
                    wip.length - end > 0 &&
                    items[items.length - end - 1] == wip[wip.length - end - 1])
                end++;

            // Get the changed range
            let wip_slice = wip.slice(start, wip.length - end);

            // Splice it back onto the observable array
            items.splice(start, items.length - end - start, ...wip_slice);

            // Make sure we didn't mess it up
            assert.deepEqual(wip, Array.from(items));
        }
        else
        {
            edits = cb(items);
            r.update();
        }

        // Check counts
        assert.equal(TextItem.instanceCount, items.length);
        assert.equal(TextItem.destroyCount, edits.destroy);
        assert.equal(TextItem.createCount, edits.create);

        // Make sure items that were in the old set of items
        // are still using the same set of root nodes
        nodes = r.rootNodes[0].childNodes.slice(1, -1);
        assert.equal(nodes.length, items.length);
        for (let i=0; i<items.length; i++)
        {
            if (nodeMap.has(items[i]))
            {
                if (nodeMap.get(items[i]) != nodes[i])
                {
                    assert(false);
                }
            }
        }
    }

    run_edit((arr) => {
        arr.splice(1, 2,  
            10,
            20,
            30,
        );
        return { create: 3, destroy: 0 }
    });

    run_edit((arr) => {
        arr.splice(1, 2,  
            40,
            50,
            60,
        );
        return { create: 1, destroy: 0 }
    });

    run_edit((arr) => {
        arr.splice(1, 3,  
            70,
            80,
            90,
        );
        return { create: 0, destroy: 0 }
    });

    run_edit((arr) => {
        arr.splice(1, 3,  
            80,
            90,
            70,
        );
        return { create: 0, destroy: 0 }
    });

    run_edit((arr) => {
        arr.splice(1, 2);
        return { create: 0, destroy: 2 }
    });

    run_edit((arr) => {
        arr.push(...arr.splice(0, 2));
        return { create: 0, destroy: 0 }
    });
}

test("ForEach Item Life (diff, keyed)", () => {

    TextItem.reset();

    let items = [ 
    ];


    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                    itemKey: i => i,
                },
                _: TextItem,
                text: i => i,
            }
        ]
    })();

    test_item_life(r, items);
});


test("ForEach Item Life (observable, keyed)", () => {

    TextItem.reset();

    let items = ObservableArray.from([ 
    ]);


    let r = Template.compile({
        _: "DIV",
        $: [
            {
                foreach: {
                    items: () => items,
                    itemKey: i => i,
                },
                _: TextItem,
                text: i => i,
            }
        ]
    })();

    test_item_life(r, items);
});

