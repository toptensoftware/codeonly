---
title: "Dynamic Boolean Styles"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Dynamic Style Properties

To dynamically change a style property on an element, use the `style_` prefix:

```js
// when textColor returns 'red':
//    <div style="color: red" >
{ 
    type: "div",
    style_color: c => textColor,
}
```

To set style names that contain hyphens, use camelCase:

```js
// <div style="text-align: center" >
{ 
    type: "div",
    style_textAlign: "center",
}
```

or, use a string property key:

```js
// <div style="text-align: center" >
{ 
    type: "div",
    'style_text-align': "center",
}
```
