---
title: "The Content ($) Property"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# The Content `$` Property

The `$` property is a special property for setting the inner content.

For HTML elements, if the `$` property is a string or raw HTML string 
then `$` is an alias for the `text` property:

```js
{
    type: 'div',
    $: "content"
}
```

is the same as

```js
{
    type: 'div',
    text: "content"
}
```

Similarly, `$: Html.raw("...")` is the same as `text: Html.raw("...")`;

Note, this only applies for non-callback strings and this:

```js
{
    type: 'div',
    $: c => c.title,
}
```

is equivalent to:

```js
{
    type: 'div',
    childNode: [ c => c.title ],
}
```

Since the `text` property is slightly more efficent, when using
callbacks for inner text values it's preferrable to use the `text` 
property directly:

```js
{
    type: 'div',

    // This is preferable
    text: c => c.title,

    // to this:
    $: c => c.title,
}
```

For HTML elements any non-string value of `$` is an alias for the `childNodes` property.

For components, the `$` property is an alias for a property called
`content`:

ie: 

```js
{
    type: MyComponent,
    $: "Hello World",
}
```

is equivalent to:

```js
{
    type: MyComponent,
    content: "Hello World",
}
```

Of course the meaning of a property `content` is completely
up to your component.


