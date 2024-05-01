import { test } from "node:test";
import { strict as assert } from "node:assert";
import { compileTemplate, html } from "../codeonly/codeonly.js";
import "./mockdom.js";


test("Single root component at root level", () => {

    let component = compileTemplate({
        type: "DIV",
        text: "foo",
    });

    let r = compileTemplate({
        type: component,
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.innerText, "foo");

});


test("Single root component as child", () => {

    let component = compileTemplate({
        type: "DIV",
        text: "foo",
    });

    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes[0].innerText, "foo");
});


test("Multi-root component at root level", () => {

    let component = compileTemplate({
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let r = compileTemplate({
        type: component,
    })();

    assert.equal(r.isMultiRoot, true);
    assert.equal(r.rootNodes[0].nodeValue, "foo");
    assert.equal(r.rootNodes[1].nodeValue, "bar");

});


test("Multi-root component as child", () => {

    let component = compileTemplate({
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes[0].nodeValue, "foo");
    assert.equal(r.rootNode.childNodes[1].nodeValue, "bar");
});


test("Conditional single-root component", () => {

    let component = compileTemplate({
        type: "DIV",
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let value = true;
    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                if: () => value,
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes[0].childNodes[0].nodeValue, "foo");
    assert.equal(r.rootNode.childNodes[0].childNodes[1].nodeValue, "bar");

    value = false;
    r.update();
    assert.equal(r.rootNode.childNodes[0].nodeType, 8);

    value = true;
    r.update();
    assert.equal(r.rootNode.childNodes[0].childNodes[0].nodeValue, "foo");
    assert.equal(r.rootNode.childNodes[0].childNodes[1].nodeValue, "bar");
});

test("Conditional multi-root component", () => {

    let component = compileTemplate({
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let value = true;
    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                if: () => value,
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes[0].nodeValue, "foo");
    assert.equal(r.rootNode.childNodes[1].nodeValue, "bar");

    value = false;
    r.update();
    assert.equal(r.rootNode.childNodes[0].nodeType, 8);

    value = true;
    r.update();
    assert.equal(r.rootNode.childNodes[0].nodeValue, "foo");
    assert.equal(r.rootNode.childNodes[1].nodeValue, "bar");
});



test("Foreach single-root component", () => {

    let component = compileTemplate({
        type: "DIV",
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let value = ["apples", "pears", "bananas"];
    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                foreach: () => value,
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes.length, 5);

    value.unshift("foo", "bar");
    r.update();
    assert.equal(r.rootNode.childNodes.length, 7);

});


test("Foreach multi-root component", () => {

    let component = compileTemplate({
        childNodes:
        [
            "foo", 
            "bar"
        ]
    });

    let value = ["apples", "pears", "bananas"];
    let r = compileTemplate({
        type: "DIV",
        childNodes:
        [
            {
                foreach: () => value,
                type: component,
            }
        ]
    })();

    assert.equal(r.isMultiRoot, false);
    assert.equal(r.rootNode.childNodes.length, 8);

    value.unshift("foo", "bar");
    r.update();
    assert.equal(r.rootNode.childNodes.length, 12);
});

