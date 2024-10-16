---
title: "Debug Directives"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Debug Directives

Sometimes you might want to debug through the code generated for a template, but
finding that code in the debugger can be difficult.

To help with this the following two properties can be used to insert `debugger`
statements into the generated code.

`debug_create` - inserts a debugger break when the element is created
`debug_update` - inserts a debugger break when the element is updated

eg:

```js
{
    type: "div",
    debug_create: true,
}
```

You can also break based on a callback. eg: this will break when the component
is created, but only when the `productId` is "123";

```js
{
    type: "div",
    debug_create: c => c.productId == "123",
}
```