import { test } from "node:test";
import { strict as assert } from "node:assert";
import { SSREnvironment } from "../core/SSREnvironment.js";
import { compileTemplate } from "../core/TemplateCompilerSSR.js";
import { Html } from "../core/Html.js";
import { ObservableArray } from "../core/ObservableArray.js";
import { Component } from "../core/Component.js";
import { env, setEnvironment } from "../core/Environment.js";
import { Window } from "../minidom/Window.js";

setEnvironment(new SSREnvironment());

let w = new Window();
env.requestAnimationFrame = w.requestAnimationFrame.bind(w);


test("Element (bare)", () => {

    let r = compileTemplate({
        type: "div",
    })();

    assert.equal(r.html, "<div></div>");

});


test("Element (bare, self closing)", () => {

    let r = compileTemplate({
        type: "br",
    })();

    assert.equal(r.html, "<br/>");

});


test("Element Attribute (static, text)", () => {

    let r = compileTemplate({
        type: "input",
        attr_type: "text&",
    })();

    assert.equal(r.html, `<input type="text&amp;"/>`);

});

test("Element Attribute (static, raw)", () => {

    let r = compileTemplate({
        type: "input",
        attr_type: Html.raw("text&"),
    })();

    assert.equal(r.html, `<input type="text&"/>`);

});

test("Element Attribute (dynamic, text)", () => {

    let r = compileTemplate({
        type: "input",
        attr_type: () => "text&",
    })();

    assert.equal(r.html, `<input type="text&amp;"/>`);

});

test("Element Attribute (dynamic, raw)", () => {

    let r = compileTemplate({
        type: "input",
        attr_type: () => Html.raw("text&"),
    })();

    assert.equal(r.html, `<input type="text&"/>`);

});

test("Element id (static, text)", () => {

    let r = compileTemplate({
        type: "div",
        id: "mine&"
    })();

    assert.equal(r.html, `<div id="mine&amp;"></div>`);

});

test("Element id (static, raw)", () => {

    let r = compileTemplate({
        type: "div",
        id: Html.raw("mine&"),
    })();

    assert.equal(r.html, `<div id="mine&"></div>`);

});


test("Element id (dynamic, text)", () => {

    let r = compileTemplate({
        type: "div",
        id: () => "mine&"
    })();

    assert.equal(r.html, `<div id="mine&amp;"></div>`);

});

test("Element id (dynamic, raw)", () => {

    let r = compileTemplate({
        type: "div",
        id: () => Html.raw("mine&"),
    })();

    assert.equal(r.html, `<div id="mine&"></div>`);

});


test("Element class (static, text)", () => {

    let r = compileTemplate({
        type: "div",
        class: "mine&"
    })();

    assert.equal(r.html, `<div class="mine&amp;"></div>`);

});

test("Element class (static, raw)", () => {

    let r = compileTemplate({
        type: "div",
        class: Html.raw("mine&"),
    })();

    assert.equal(r.html, `<div class="mine&"></div>`);

});


test("Element class (dynamic, text)", () => {

    let r = compileTemplate({
        type: "div",
        class: () => "mine&"
    })();

    assert.equal(r.html, `<div class="mine&amp;"></div>`);

});

test("Element class (dynamic, raw)", () => {

    let r = compileTemplate({
        type: "div",
        class: () => Html.raw("mine&"),
    })();

    assert.equal(r.html, `<div class="mine&"></div>`);

});


test("Element named class (static, true)", () => {

    let r = compileTemplate({
        type: "div",
        class: "mydiv",
        class_selected: true,
    })();

    assert.equal(r.html, `<div class="mydiv selected"></div>`);

});

test("Element named class (static, false)", () => {

    let r = compileTemplate({
        type: "div",
        class: "mydiv",
        class_selected: false,
    })();

    assert.equal(r.html, `<div class="mydiv"></div>`);

});
test("Element named class (dynamic, true)", () => {

    let r = compileTemplate({
        type: "div",
        class: "mydiv",
        class_selected: () => true,
    })();

    assert.equal(r.html, `<div class="mydiv selected"></div>`);

});

test("Element named class (dynamic, false)", () => {

    let r = compileTemplate({
        type: "div",
        class: "mydiv",
        class_selected: () => false,
    })();

    assert.equal(r.html, `<div class="mydiv "></div>`);

});


test("Element style (static, text)", () => {

    let r = compileTemplate({
        type: "div",
        style: "x:y&"
    })();

    assert.equal(r.html, `<div style="x:y&amp;;"></div>`);

});

test("Element style (static, raw)", () => {

    let r = compileTemplate({
        type: "div",
        style: Html.raw("x:y&"),
    })();

    assert.equal(r.html, `<div style="x:y&;"></div>`);

});


test("Element style (dynamic, text)", () => {

    let r = compileTemplate({
        type: "div",
        style: () => "x:y&"
    })();

    assert.equal(r.html, `<div style="x:y&amp;"></div>`);

});

test("Element style (dynamic, raw)", () => {

    let r = compileTemplate({
        type: "div",
        style: () => Html.raw("x:y&"),
    })();

    assert.equal(r.html, `<div style="x:y&;"></div>`);

});


test("Element named style (static, value)", () => {

    let r = compileTemplate({
        type: "div",
        style: "x:y",
        style_a: "b&",
    })();

    assert.equal(r.html, `<div style="x:y;a:b&amp;;"></div>`);

});

test("Element named style (static, null)", () => {

    let r = compileTemplate({
        type: "div",
        style: "x:y",
        style_a: null,
    })();

    assert.equal(r.html, `<div style="x:y;"></div>`);

});

test("Element named style (dynamic, value)", () => {

    let r = compileTemplate({
        type: "div",
        style: "x:y",
        style_a: () => "b&",
    })();

    assert.equal(r.html, `<div style="x:y;a:b&amp;;"></div>`);

});

test("Element named style (dynamic, null)", () => {

    let r = compileTemplate({
        type: "div",
        style: "x:y",
        style_a: () => null,
    })();

    assert.equal(r.html, `<div style="x:y;"></div>`);

});



test("Element Inner Text (static)", () => {

    let r = compileTemplate({
        type: "div",
        text: "Hello & World"
    })();

    assert.equal(r.html, `<div>Hello &amp; World</div>`);

});

test("Element Inner Text (dynamic)", () => {

    let r = compileTemplate({
        type: "div",
        text: () => "Hello & World"
    })();

    assert.equal(r.html, `<div>Hello &amp; World</div>`);

});

test("Element Inner HTML (static)", () => {

    let r = compileTemplate({
        type: "div",
        text: Html.raw("Hello &amp; World")
    })();

    assert.equal(r.html, `<div>Hello &amp; World</div>`);

});

test("Element Inner HTML (dynamic)", () => {

    let r = compileTemplate({
        type: "div",
        text: () => Html.raw("Hello &amp; World")
    })();

    assert.equal(r.html, `<div>Hello &amp; World</div>`);

});

test("Element Child Nodes", () => {

    let r = compileTemplate({
        type: "div",
        $: [
            { type: "p", text: "1" },
            { type: "p", text: "2" },
        ]
    })();

    assert.equal(r.html, `<div><p>1</p><p>2</p></div>`);

});

test("Text Child Nodes", () => {

    let r = compileTemplate({
        type: "div",
        $: [
            "Apples",
            " & ",
            "Pears",
            " & ",
            "Bananas"
        ]
    })();

    assert.equal(r.html, `<div>Apples &amp; Pears &amp; Bananas</div>`);

});


test("Fragment Child Nodes", () => {

    let r = compileTemplate({
        $: [
            { type: "p", text: "1" },
            { type: "p", text: "2" },
        ]
    })();

    assert.equal(r.html, `<p>1</p><p>2</p>`);

});

test("Fragment Text Nodes", () => {

    let r = compileTemplate({
        $: [
            "Apples",
            " & ",
            "Pears",
            " & ",
            "Bananas"
        ]
    })();

    assert.equal(r.html, `Apples &amp; Pears &amp; Bananas`);

});

test("Conditional (static, true)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            if: true,
            _: "span",
            text: "warning",
        }
    })();

    assert.equal(r.html, `<div><span>warning</span></div>`);

});

test("Conditional (static, false)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            if: false,
            _: "span",
            text: "warning",
        }
    })();

    assert.equal(r.html, `<div><!-- IfBlock placeholder --></div>`);

});


test("Conditional (dynamic, true)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            if: () => true,
            _: "span",
            text: "warning",
        }
    })();

    assert.equal(r.html, `<div><span>warning</span></div>`);

});

test("Conditional (dynamic, false)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            if: () => false,
            _: "span",
            text: "warning",
        }
    })();

    assert.equal(r.html, `<div><!-- IfBlock placeholder --></div>`);

});



test("List (static)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            foreach: [ 1, 2, 3 ],
            _: "p",
            text: i => i,
        }
    })();

    assert.equal(r.html, `<div><!-- enter foreach block --><p>1</p><p>2</p><p>3</p><!-- leave foreach block --></div>`);

});

test("List (dynamic)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            foreach: () => [ 1, 2, 3 ],
            _: "p",
            text: i => i,
        }
    })();

    assert.equal(r.html, `<div><!-- enter foreach block --><p>1</p><p>2</p><p>3</p><!-- leave foreach block --></div>`);

});


test("List (conditional)", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            foreach: {
                items: () => [ 1, 2, 3 ],
                condition: i => (i % 2) == 1,
            },
            _: "p",
            text: i => i,
        }
    })();

    assert.equal(r.html, `<div><!-- enter foreach block --><p>1</p><p>3</p><!-- leave foreach block --></div>`);

});

test("List (observable)", () => {

    let l = ObservableArray.from([ 1, 2, 3 ]);
    let r = compileTemplate({
        _: "div",
        $: {
            foreach: {
                items: () => l,
            },
            _: "p",
            text: i => i,
        }
    })();

    l.splice(1,1);
    l.push(4);

    assert.equal(r.html, `<div><!-- enter foreach block --><p>1</p><p>3</p><p>4</p><!-- leave foreach block --></div>`);

});




test("Embed Slot", () => {

    let r = compileTemplate({
        _: "div",
        $: {
            _: "embed-slot",
            $: [
                "Apples", " Pears", " Bananas",
            ]
        }
    })();

    assert.equal(r.html, `<div>Apples Pears Bananas</div>`);

});


test("Text Content", () => {

    let r = compileTemplate({
        _: "div",
        $: "Apples & Pears"
    })();

    assert.equal(r.html, `<div>Apples &amp; Pears</div>`);

});

test("Raw Content", () => {

    let r = compileTemplate({
        _: "div",
        $: Html.raw("Apples &amp; Pears"),
    })();

    assert.equal(r.html, `<div>Apples &amp; Pears</div>`);

});


class MyComponent extends Component
{
    #value = null;

    get value() { return this.#value; }
    set value(value)
    {
        this.#value = value;
        this.invalidate();
    }


    static template = {
        _: "div",
        text: c => c.value,
    }

}


test("Embedded Component", () => {

    let val = "Apples & Pears";

    let r = compileTemplate({
        _: MyComponent,
        value: () => val,
        update: "auto",
    })();

    assert.equal(r.html, `<div>Apples &amp; Pears</div>`);

    val = "Oranges";
    r.update();

    assert.equal(r.html, `<div>Oranges</div>`);
});
