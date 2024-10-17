import { test } from "node:test";
import { strict as assert } from "node:assert";
import { Template, ForEachBlock, Component } from "../codeonly.js";
import "./mockdom/mockdom.js";

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
                type: ForEachBlock,
                items: () => items,
                template: {
                    type: "DIV",
                    text: x => x
                }
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


class TestComponent extends Component
{

}



test("ForEach Component", () => {

    let items = [ "A", "B", "C" ];

    let r = Template.compile({
        $: [
            {
                type: ForEachBlock,
                items: () => items,
                template: {
                    type: TestComponent,
                    text: x => x
                }
            }
        ]
    })();

});
