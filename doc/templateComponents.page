---
title: "Using Components in Templates"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Using Components in Templates

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
`EventTarget` and can raise their own events).  

The `update` property controls if the component should be updated when
this template is updated - see [Component Updates](componentUpdates).

The `$` property on a component reference is a short-cut alias for a 
component property called `content`.

All other properties are assigned directly to the component instance.


