import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("ForEach Static", () => {
    let r = compileTemplate({
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
    items.push("J", "K", "L");
    r.update();
    assert.deepStrictEqual(actual(), expected());
}

test("ForEach Dynamic", () => {

    let items = [ "A", "B", "C" ];

    let r = compileTemplate({
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
        return items;
    }

    function expected()
    {
        return r.rootNodes[0].childNodes.slice(1, -1).map(x => x.innerText);
    }
});


test("ForEach Dynamic Fragment", () => {

    let items = [ "A", "B", "C" ];

    let r = compileTemplate({
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

    let r = compileTemplate({
        childNodes: [
            {
                type: "DIV",
                foreach: () => items,
                condition: check_condition,
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

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                array_sensitive: false,
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

    let r = compileTemplate({
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

    let r = compileTemplate({
        type: "DIV",
        childNodes: [
            {
                foreach: () => items,
                item_sensitive: false,
                index_sensitive: false,         // Update items when index changes
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

    let r = compileTemplate(
    {
        type: "DIV",
        childNodes: 
        [
            {
                foreach: () => items,
                childNodes: 
                [
                    {
                        type: "DIV",
                        foreach: (item) => item.subItems,
                        text: (subItem, ctx) => `${ctx.outer.item.name}${subItem}`,
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

