import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, ObservableArray, Component } from "../codeonly.js";
import "./mockdom/mockdom.js";

function assert_iterables(a, b)
{
    assert.deepStrictEqual(Array.from(a), Array.from(b));
}


test("ForEach Static", () => {
    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: [ "apples", "pears", "bananas" ],
                type: "DIV",
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

function assert_foreach_content(r, items, actual, expected)
{
    // Initial
    assert_iterables(Array.from(actual()), Array.from(expected()));

    // Append
    items.push("D", "E");
    r.update();
    assert_iterables(actual(), expected());

    // Prepend
    items.unshift("F", "G");
    r.update();
    assert_iterables(actual(), expected());

    // Remove from front
    items.shift();
    items.shift();
    r.update();
    assert_iterables(actual(), expected());

    // Remove from end
    items.pop();
    items.pop();
    r.update();
    assert_iterables(actual(), expected());

    // Insert
    items.splice(1, 0, "H");
    r.update();
    assert_iterables(actual(), expected());

    // Delete
    items.splice(1, 1);
    r.update();
    assert_iterables(actual(), expected());

    // Replace
    items.splice(1, 1, "I");
    r.update();
    assert_iterables(actual(), expected());

    // Clear
    items.splice(0, items.length);
    r.update();
    assert_iterables(actual(), expected());

    // Insert again
    items.push("J", "K", "L", "M", "N", "O", "P", "Q");
    r.update();
    assert_iterables(actual(), expected());

    // Move right
    let temp = items.splice(0, 3);
    items.push(...temp);
    r.update();
    assert_iterables(actual(), expected());

    // Move left
    temp = items.splice(-3, 3);
    items.unshift(...temp);
    r.update();
    assert_iterables(actual(), expected());
}


test("ForEach Dynamic", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                type: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1).map(x => x.innerText);
    }

    function expected()
    {
        return items;
    }
});

test("ForEach Observable", () => {

    let items = new ObservableArray();
    items.push("A", "B", "C");

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                type: "DIV",
                text: x => x,
            }
        ]
    })();


    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return r.rootNodes[0].childNodes.slice(1, -1).map(x => x.innerText);
    }

    function expected()
    {
        return items;
    }
});


test("ForEach Dynamic Fragment", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        childNodes: [
            {
                foreach: () => items,
                childNodes: [
                    {
                        type: "DIV",
                        text: x => x,
                    },
                    {
                        type: "SPAN",
                        text: x => x,
                    }
                ]
        }
        ]
    })();

    let outer = document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return items;
    }

    function expected()
    {
        return outer.childNodes.slice(1, -1).filter((x,i) => i % 2 == 0).map(x => x.innerText);
    }

});


test("ForEach with Conditional Items", () => {

    let items = [ "A", "B", "C" ];

    let mod = 2;
    let modEq = 0;
    function check_condition(item)
    {
        return item.charCodeAt(0) % mod == modEq;
    }

    let r = Template.compile({
        childNodes: [
            {
                foreach: {
                    items: () => items,
                    condition: check_condition,
                },
                type: "DIV",
                text: x => x,
            }
        ]
    })();

    let outer = document.createElement("DIV");
    outer.append(...r.rootNodes);

    assert_foreach_content(r, items, actual, expected);

    function actual()
    {
        return items.filter(check_condition);
    }

    function expected()
    {
        return outer.childNodes.slice(1, -1).map(x => x.innerText);
    }

});

test("ForEach Index Sensitive", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                type: "DIV",
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


function div(opts)
{
    return Object.assign({ type: "DIV" }, opts)
}

test("ForEach Nested", () => {

    let items = [
        { name: "A", subItems: [ "1", "2"], },
        { name: "B", subItems: [ "3", "4"], },
    ];

    let r = Template.compile(
    {
        type: "DIV",
        childNodes: 
        [
            {
                foreach: () => items,
                childNodes: 
                [
                    {
                        foreach: (item) => item.subItems,
                        type: "DIV",
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


test("ForEach Else", () => {

    let items = [];

    let r = Template.compile(
    {
        type: "DIV",
        childNodes: [
            {
                type: "DIV",
                foreach: () => items,
                text: x => x,
            },
            {
                else: true,
                type: "DIV",
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
        type: "DIV",
        text: c => c.item.name,
    }

    static updateCount = 0;
}

test("ForEach Component Update", () => {

    let items = [ 
        { name: "Apples" },
        { name: "Pears" },
        { name: "Bananas" },
    ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: {
                    items: () => items,
                    itemKey: i => i.name,
                },
                type: ItemComponent,
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
    assert.equal(ItemComponent.updateCount, 1);

    // If we change one item with a new object instance with the different key,
    // we should get one update because the old delete item should be re-used
    items[0] = { name: "Watermelon" };
    r.update();
    assert.equal(ItemComponent.updateCount, 2);

});

