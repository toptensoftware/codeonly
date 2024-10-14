---
title: "Dynamic Properties"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Dynamic Properties

Most settings in a template can be set dynamically by providing a callback:

```js
{
    type: 'div',
    class: c => c.divClass,
}
```

Where `c` is a reference to the component instance:


```js
class MyComponent extends Component
{
    get divClass()
    {
        return "MyComponentClass"
    }

    static template = {
        type: 'div',
        class: c => c.divClass,     // call the component instance
    }
}
```

To update a component when any of its dynamic properties have changed, 
call either:

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


