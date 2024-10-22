---
title: "Templates"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Templates

Each component has a template that declares the DOM elements associated with that component.

Templates are declared as a static member of the component class.  This is because templates are compiled at runtime to JavaScript and would be inefficient to 
re-compile for each component instance.  The template is compiled the first time 
an instance of a component is constructed and re-used for all subsequent instances.

Declare HTML elements in the template as objects.  

* The `type` property specifies the tag type
* Properties prefixed  with `attr_` set the elements' attributes
* Inner Text/HTML is declared with the `text` property
* Child elements are declared with the `childNodes` property
* `$` can be used as an alias for the `text` or the `childNodes` properties.

eg:

```javascript
// <a href="/">Home</a>
{
    type: 'a',          // tag type
    attr_href: "/",     // href attribute
    $: [                // array of child nodes
        "Home",         // A text node
    ]
}
```

If an element only has a single child element the `$` or `childNodes` property need not be an array:

```javascript
// <a href="/">Home</a>
{
    type: 'a',
    attr_href: "/",
    $: { // Only a single child so doesn't need to be an array
        type: "div"
    }
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

