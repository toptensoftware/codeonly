---
title: "Dynamic Boolean Classes"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Dynamic Boolean Classes

To conditionally set or remove a class on an element, use the `class_` prefix:

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

To set class names that contain hyphens, use camelCase:

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

