import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


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
    assert.deepStrictEqual(actual(), expected());

    // Append
    items.push("D", "E");
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Prepend
    items.unshift("F", "G");
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Remove from front
    items.shift();
    items.shift();
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Remove from end
    items.pop();
    items.pop();
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Insert
    items.splice(1, 0, "H");
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Delete
    items.splice(1, 1);
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Replace
    items.splice(1, 1, "I");
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Clear
    items.splice(0, items.length);
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Insert again
    items.push("J", "K", "L", "M", "N", "O", "P", "Q");
    r.update();
    assert.deepStrictEqual(actual(), expected());

    // Move right
    let temp = items.splice(0, 3);
    items.push(...temp);
    r.update();
    assert.deepEqual(actual(), expected());

    // Move left
    temp = items.splice(-3, 3);
    items.unshift(...temp);
    r.update();
    assert.deepEqual(actual(), expected());
}


test("ForEach Dynamic", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
            /*
                type: ForEach,
                items: () => items,
                condition: (item) => item,
                template: {
                    type: "DIV",
                    text: (item) => item.text,
                }
            */

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

test("ForEach Array Inensitive", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: {
                    items: () => items,
                    arraySensitive: false,
                },
                type: "DIV",
                text: (x, ctx) => `${x}${ctx.index}`,
            }
        ]
    })();

    assert.deepStrictEqual(["A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.unshift("Z");
    r.update();

    assert.deepStrictEqual(["A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));
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

    assert.deepStrictEqual(["A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.unshift("Z");
    r.update();

    assert.deepStrictEqual(["Z0", "A1", "B2", "C3"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.splice(2, 1);
    r.update();

    assert.deepStrictEqual(["Z0", "A1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));
});



test("ForEach Index Inensitive", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        type: "DIV",
        childNodes: [
            {
                foreach: {
                    items: () => items,
                    itemSensitive: false,
                    indexSensitive: false,         // Update items when index changes
                },
                type: "DIV",
                text: (x, ctx) => `${x}${ctx.index}`,
            }
        ]
    })();

    assert.deepStrictEqual(["A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));

    items.unshift("Z");
    r.update();

    assert.deepStrictEqual(["Z0", "A0", "B1", "C2"], r.rootNode.childNodes.slice(1, -1).map(x => x.innerText));
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

    assert.deepStrictEqual([
        "A1", "A2", "B3", "B4"
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));

    items[0].subItems.push("3");
    r.update();

    assert.deepStrictEqual([
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

    assert.deepStrictEqual([
        "Empty!",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));

    assert.equal(r.empty.innerText, "Empty!");


    items = [ "apples", "bananas" ];
    r.update();
    assert.deepStrictEqual([
        "apples", "bananas",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty, null);


    items = [ ];
    r.update();
    assert.deepStrictEqual([
        "Empty!",
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty.innerText, "Empty!");


    items = [ "foo", "bar" ];
    r.update();
    assert.deepStrictEqual([
        "foo", "bar"
        ], r.rootNode.childNodes.filter(x => x.nodeType == 1).map(x => x.innerText));
    assert.equal(r.empty, null);
});

