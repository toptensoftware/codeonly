---
title: "Event Handlers"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Event Handlers

To connect event handlers to elements in the template, use the `on_` prefix. 
The callback will be passed two parameters:

1. the component instance
2. the event object

eg: 

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
