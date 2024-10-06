# CodeOnly

A simple, lightweight, code-only front-end Web framework.

Unlike other front-end frameworks, CodeOnly is not reactive so there are
no wrapper or proxy classes around your objects and everything is kept 
as close to pure JavaScript as possible.

Also, because there's no transpiling you can debug your code in the 
browser exactly as you wrote it. (but you can still of course package
it for distribution).

## Creating a Component

A component is the main way you work with CodeOnly.  A component
includes a DOM template, logic code and an optional set of CSS style
declarations.

By declaring code, template and styles in Javascript the entire
definition of a component can be collected into a single `.js` file.

Most components will conform to following basic structure.

```js
import { Component, Style } from "codeonly.js";

// Each component is implemented as class
// extending `Component`
export class MyComponent extends Component
{
    constructor()
    {
        super();
    }

    // This defines the DOM template
    // for this component
    static template = {
        type: "div",
        class: "mycomponent",
        $: [
            // Child elements here
            "Hello World, from my component"
        ]
    }
}


// Declare component specific styles here
Style.declare(`
.mycomponent 
{
    background-color: red;
}
`);

```

## Mounting Components

To mount a component against the DOM, call the component's `mount` method passing an element or selector for where the component should be attached to the DOM:

eg: 

`main.js`

```js
// Main entry point into the application
export function main()
{
    // Mount the root "Main" component on #main
    new Application().mount("#main");

    // Other app initialization goes here
    //  eg: setup router, load initial content etc...
}
```

`index.html`

```js
<html>
<head>
<meta name="viewport" content="initial-scale=1">
<link rel="icon" href="favicon.svg">
<style>
:root
{
    /* 
    It's a good idea to set anything that
    might affect initial load flicker here
    rather that in Style.declare code blocks
    */
    color-scheme: dark;
    font-family: sans-serif;
}
</style>
</head>
<body>
    <!-- This is where the Main component
         will be mounted --> 
    <div id="main"></div>
    
    <script type="module">  
        // Call main method to mount the component
        import { main } from "/main.js";
        main();
    </script>
</body>
</html>

```

## Templates

Each component has a template that declares the DOM elements associated with that component.

Note that templates are declared as a static member of the component class.  This is because they're compiled to JavaScript and would be inefficient to re-compile for each component instance.  The first time an instance of a Component is constructed, 
the template is compiled and re-used for all subsequence instances.

To declare a DOM element, use an object with a `type` property, prefix attributes with `attr_` and child elements using the `$` property.

```javascript
// <a href="/">Home</a>
{
    type: 'a',
    attr_href: "/",
    $: [
        "Home", 
    ]
}
```

If an element only has a single child element the `$` property need not be an array:

```javascript
// <a href="/">Home</a>
{
    type: 'a',
    attr_href: "/",
    $: "Home", 
}
```

The `id`, `class` and `style` attributes don't require the `attr_` prefix:

```js
// <div id="my-div" class="my-div" style="text-align: right"
{
    type: 'div',
    id: "my-div",
    class: "my-div",
    style: "text-align: right",
}
```

### Dynamic Properties

Most settings in a template can be set dynamically by providing a callback:

```js
{
    type: 'div',
    class: c => c.divClass,
}
```

Where `c` will be a reference to the component instance:


```js
class MyComponent extends Component
{
    get divClass()
    {
        return "MyComponentClass"
    }

    static template = {
        type: 'div',
        class: c => c.divClass,
    }
}
```

To update a component when any of it's dynamic properties have changed, call either

* `update()` to update the DOM immediately, or
* `invalidate()` to update the DOM on the next animation frame.

```js
class MyComponent extends Component
{
    #divClass = "MyComponentClass";

    get divClass()
    {
        return this.#divClass;
    }

    set divClass(value)
    {
        // Store new class
        this.#divClass = value;

        // Mark DOM for update
        this.invalidate();
    }

    static template = {
        type: 'div',
        class: c => c.divClass,
    }
}
```

### Event Handlers

To connect event handlers to elements in the template, use the `on_` prefix:

```javascript
class MyButton extends Component
{
    onClick(ev)
    {
        alert("Oi!");
        ev.preventDefault();
    }

    static template = {
        type: 'button',
        $: "Click Me!",
        on_click: (c, ev) => c.onClick(ev),
    }
}
```

### Text and Raw HTML Text

To create text elements, use a string instead of an object in the template:

```js
// <div>This is my &lt;Div^gt;</div>
{
    type: "div",
    $: "This is my <Div>",
}
```

To create unescaped HTML text use the `Html.raw()` helper:

```js
import { Html } from 'codeonly.js';

// <div><span class="myclass">Span</span></div>
{
    type: "div",
    $: Html.raw('<span class="myclass">Span</span>'),
}
```

Note, to include whitespace between elements just include the whitespace in the template:

```js
{
    type: "div",
    $: [
        { type: "button", $: "Button 1" },
        " ",
        { type: "button", $: "Button 2" },
        " ",
        { type: "button", $: "Button 3" },
    ]
}
```

### Dynamic Boolean Classes

To conditionally set a class on an element,use the `class_` prefix:

```js
// when isSelected is true:
//    <div class="selected" >
// otherwise
//    <div class="" >
{ 
    type: "div",
    class_selected: c => isSelected,
}
```

To set class names with a hyphen, use camelCase:

```js
{ 
    type: "div",
    class_isSelected: true,
}
```

or, a string property key:

```js
{ 
    type: "div",
    'class_is-selected': true,
}
```

### Dynamic Style Properties

To dynamically set a style property on an element, use the `style_` prefix:

```js
// when textColor returns 'red':
//    <div style="color: red" >
{ 
    type: "div",
    style_color: c => textColor,
}
```

To set style names with hyphens, use camelCase:

```js
// <div style="text-align: center" >
{ 
    type: "div",
    style_textAlign: "center",
}
```

or, use a string property key

```js
// <div style="text-align: center" >
{ 
    type: "div",
    'style_text-align': "center",
}
```

### Dynamically Hiding and Showing Elements

The `display` attribute can be used to contol the visibility of an element.

Set `display` to:

* `true` to remove any display style previously set by this attribute
* `false` to set `display:none`
* a string to set the `display` style explicitly.

```js
// when isVisible returns true:
//     <div style="">
// otherwise
//     <div style="display: none">
{ 
    type: "div",
    display: c => isVisible,
}
```

Note the display attribute is smart enough to remember the previous
display style setting:

```js
// when isVisible returns true:
//     <div style="display: flex">
// otherwise
//     <div style="display: none">
{ 
    type: "div",
    style_display: "flex",
    display: c => isVisible,
}
```



### Conditionally Including Elements

The `if` attribute can be used to dynamically include or exclude an element from the DOM:

(Note: while the `show` attribute just hides an element, `if` completely excludes it from the DOM)

```js
{
    type: "div",
    $: [
        {
            if: c => showError,
            type: "p",
            $: "Failed: ...",
        }
    ]
}
```

You can also include one or more `elseif` and `else` blocks:

```js
{
    type: "div",
    $: [
        {
            if: c => showError,
            type: "p",
            $: "Error: ...",
        },
        {
            elseif: c => showWarning,
            type: "p",
            $: "Warning: ...",
        },
        {
            else: null,
            type: "p",
            $: "All OK",
        }
    ]
}
```

Note: `if`, `elseif` and `else` conditional elements must all follow each other consecutively in the containing array.

### Fragments

If a template element doesn't have a type, it's considered a "fragment" element. Any child elements of the fragment will be included directly in the fragment's parent.

In this example, the `if` condition either includes or excludes all three paragraphs from the containing div:

```js
{
    type: 'div':
    $: {
        // No 'type' here, so this is a fragment
        if: c => someCondition,
        $: [
            { type: "p", $: "Para 1" }
            { type: "p", $: "Para 2" }
            { type: "p", $: "Para 3" }
        ]
    }
}
```

Another way to think of fragments is as multi-root elements.

## Element Binding

To access a DOM element from within the component use, use the `bind` attribute
to attach the element reference to the component.

```js
export class MyComponent extends Component
{
    onClick()
    {
        // this.inputField is a reference to the input DOM element
        // created by the 'bind' property in the template
        alert(this.inputField.value);
    }

    // This defines the DOM template
    // for this component
    static template = {
        type: "div",
        $: [
            { type: "input", attr_type: "text", bind: "inputField" }
            { type: "button", on_click: c => c.onClick(), $:"Click Me" }
        ]
    }
}
```

## ForEach Elements

To repeat elements, use the `foreach` attribute:

```js
export class MyComponent extends Component
{
    #items = [
        { id: "a", text: "Apples" },
        { id: "b", text: "Pears" },
        { id: "c", text: "Bananas" },
    ];

    get items()
    {
        return this.#items;
    }

    static template = {
        type: "section"
        $: {
            foreach: {
                items: c => items, 
            },
            type: "div",
            id: i => i.id,
            $: i => i.text,
        }
    }
}
```

gives:

```html
<section>
    <div id="a">Apples</div>
    <div id="b">Pears</div>
    <div id="c">Bananas</div>
</section>
```

The `foreach` attributes supports the following sub-attributes:

* `items` the set of items to be iterated over (or a callback to provide them)
* `itemKey` a callback function to return a unique key for an item
* `condition` a callback function that indicates if an item should be included
* `arraySensitive` set to true if the set of items should be updated when the component is updated (requires `itemKey`)
* `indexSensitive` true if collection items should be updated when their position in the array changes (ie: set this to true if the template uses `context.index`, see below).
* `itemSensitive` true if all collection items should be updated when the foreach block is updated.

```js
static template = {
    type: "section"
    $: {
        foreach: {
            items: c => items, 
            itemKey: i => i.id,     // provide a unique value for each item
            indexSensitive: true,   // true because we use ctx.index
            arraySensitive: true,   // because we want to be able to update the list
        },
        type: "div",
        id: i => i.id,
        // See below about the (i,ctx) callback parameters
        $: (i,ctx) => `#${ctx.index+1}: ${i.text}`,
    }
}
```

gives:

```html
<section>
    <div id="a">#1: Apples</div>
    <div id="b">#2: Pears</div>
    <div id="c">#3: Bananas</div>
</section>
```

Further, because we've marked it `arraySensitive` and `indexSensitive` we can do this:

```js
// Method in the component...
addItem()
{
    this.#items.splice(0, 0, { id: "d", text: "berries" });
    this.invalidate();
}
```

producing this:

```html
<section>
    <div id="d">#1: Berries</div>
    <div id="a">#2: Apples</div>
    <div id="b">#3: Pears</div>
    <div id="c">#4: Bananas</div>
</section>
```

When an element has a `foreach` attribute, the parameters to any dynamic callback
functions change from `(component) => ` to `(item, context) => ` where:

* `item` is the value of the item in the foreach.items collection
* `context` a context that describes other attributes of the loop iteration:
    - `context.outer` - the outer loop context (either an enclosing foreach loop context, or the component instance)
    - `context.model` - the current item
    - `context.key` - the current item's key
    - `context.index` - the current item's zero based index in the collection


### Components in Templates

To use a component in a template, set the `type` attribute to a constructor
or class reference.

eg: suppose you have a component called "MyButton", with a title property.

```js
class MyButton extends Component
{
    #title;
    get title()
    {
        return this.#title;
    }
    set title()
    {
        this.#title = value;
        invalidate();
    }

    // etc...
}
```

To use this component in another component's template:

```js
{
    type: "div",
    $: [
        { type: MyButton, title: "Button 1" },
        { type: MyButton, title: "Button 2" },
    ]
}
```

Components support the `bind`, `export`, `if` and `foreach` attributes, 
and events can be connected using the `on_` prefix (`Component` extends 
`EventTarget` and can raise their own events).  All other properties
are assigned directly to the component instance.



### Embed Slots

Embed slots let a template push down dynamic DOM elements into a child
component.

Consider the following component which implements a custom anchor 
link that has special click handling (eg: this could be a router link
that invokes a custom routing mechanism rather than normal browser navigation)

```js
export class MyLink extends Component
{
    #title = "link";
    #href = "#";

    constructor()
    {
        super();
    }

    get href() { return this.#href; }
    set href(value) { this.#href = value; this.invalidate() }
    get title() { return this.#title; }
    set title(value) { this.#title = value; this.invalidate() }

    on_click(ev)
    {
        // Custom link click handling code goes here
    }

    static template = {
        type: "a",
        attr_href: c => c.href,
        on_click: c => c.on_click(ev),
        $: c => c.title
    };
}
```

This component might be used like this to create `<a ...>` anchor
links with special click handling.

```js
{
    type: "div",
    $: [
        { type: MyLink, href: "/", title: "Home" },
        { type: MyLink, href: "/profile", title: "Profile" },
    ]
}
```

But, suppose we now wanted a link with this click behaviour but
for an image?  The class only supports setting a text title.

We can modify the above class to support embedding arbitary
embedded content with the built it `EmbedSlot` component:


```js
export class MyLink extends Component
{
    // everything else as before

    static template = {
        type: "a",
        attr_href: c => c.href,
        on_click: c => c.on_click(ev),
        $: {
            // EmbedSlot lets outer content be embedded here
            type: EmbedSlot,            
            // Make this slot available as 'content' property on the component
            bind: "content",            
            // Use this if the content slot isn't used.
            placeholder: c => c.title,
        }
    }

    // The template compiler needs to know about slots
    // so declare them like this.
    static slots = [ "content" ];
}
```

We can now use this like so:

```js
{
    type: "div",
    $: [
        { 
            type: MyLink, 
            href: "/", 
            content: [
                {
                    type: "img",
                    attr_src: "home_button.png",
                },
                " Home",
            ]
        },
    ]
}
```

Note:

* Instead of setting the text `title` property, we can now provide
  templated DOM elements via the `content` property
* If we don't set the content property, the `title` property still 
  works thanks to the `placeholder` property on the `EmbedSlot`.
* The embedded content could have dynamic properties referencing the 
  outer component class instance and they would update as per any 
  other template content.
* A component that has embed slots must declare them using the static
  `slots` property on the component class.  The template compiler
  needs to generate special code for embed slots and needs to up front
  which properties are templates.