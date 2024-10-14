---
title: "Text and Raw HTML Text"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Text and Raw HTML Text

To create text elements, use the `text` property:

```js
// <div>This is my &lt;Div^gt;</div>
{
    type: "div",
    text: "This is my <Div>",
}
```

To create unescaped HTML text use the `Html.raw()` helper:

```js
import { Html } from 'codeonly.js';

// <div><span class="myclass">Span</span></div>
{
    type: "div",
    text: Html.raw('<span class="myclass">Span</span>'),
}
```

Since inner text can also be expressed as child nodes, the
`$` property can also be used to set the text of an element:

```js
{
    type: "div",
    $: "inner text",
}
```

Caveat: when using a callback for the inner text of an element,
the `text` property is slightly more efficient than the `$` property.

ie: use `text: c => c.text` in preference to `$: c => c.text` for 
performance critical applications.  

When the value is not a callback, the two approaches are identical.


### Whitespace Between Elements

Templates don't include any whitespace between HTML elements.  Often this
doesn't matter, but when it does, simply include the spaces in the template:

```js
{
    type: "div",
    $: [
        // Without spaces, these buttons would have no gaps between them
        { type: "button", $: "Button 1" },
        " ",
        { type: "button", $: "Button 2" },
        " ",
        { type: "button", $: "Button 3" },
    ]
}
```
