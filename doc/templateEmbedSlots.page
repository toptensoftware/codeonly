---
title: "Embed Slots"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Embed Slots

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

But, how do we show an image in a `MyLink` when it only supports 
setting a text title?

We can modify the above class to support embedding arbitary content 
with the built in `EmbedSlot` component:

(either import `EmbedSlot` and use the class directly, or set the type 
to `embed-slot`)


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
            type: "embed-slot",            
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
* Because `$` is an alias for a component's `content` property, we
  could have used `$: [...]` instead of `content: [...]`.


