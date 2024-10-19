---
title: "Update Semantics"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# Update Semantics

This page describes how compiled templates apply updates.

When a template is updated, all dynamic settings (ie: template properties
using a callback) in the part of the DOM managed by the template are
updated.  ie: there's no ability to update part of the template's DOM.

## Changed Value Checks

The template maintains a copy of the last assigned value for any dynamic
property.  When updating a template, if the property value hasn't changed,
the property isn't re-assigned to the target element or component.

This improves performance particularly when updating the DOM.

For properties of Component elements nested in the template note:

* Your component instance won't receive a property set accessor call unless 
  the property value actually changes.

* Changing the instance of an object reference property - even if all the 
  object's properties are the same will trigger a property assignment to 
  the component.

* Assigning new object reference to a component property with mostly the
  same object properties will often reduce to a fairly efficent operation
  since the component's internal template will do property value change
  detection itself.



## Updating `foreach` Lists

Updating of `foreach` blocks has two aspects:

* Updating the set of items in the DOM
* Updating the DOM for each item


## Updating the Set of DOM Elements for  a `foreach` List

In this discussion, the following terms are used:

* The old list - the previous set of items supplied to the foreach block
* The new list - the new set of items supplied to the foreach
* DOM elements - the set of DOM elements or components (if using a foreach
    block on a nested component).

When updating the set of items, the template operates uses one of three
strategies for updates:

* If the `foreach` block uses an `ObservableArray` for the set of items
    the list will be updated directly in response to items being added and
    removed from the observable array.  ie: No changes are made to the set 
    of DOM elements during `update`.

* If the `foreach` block has a `itemKey` property:

    * items with the same key in both the old and new list will re-use the
        existing DOM elements
    * DOM elements for items in the old list that aren't in the new list (ie: 
        deleted items) will be re-used for other new items, or destroyed 
        if not needed.
    * items in the new list that aren't in the old list (ie: new items) will 
        either use a deleted DOM element, or a new DOM element will be created.

* If the `foreach` block doesn't have an `itemKey` property, the list
    will be updated by using the existing DOM elements and "over-patching"
    the new items onto each element.

    Overpatching is where the elements in the DOM are re-used in-order
    for the items in the list.  New DOM elements are created if the new
    list is larger, old DOM elements are deleted if the new list is smaller.

    ie: the first DOM element will be re-used for the first item in the list,
    the second DOM element for the second, etc...


## Updating the DOM Elements for Items in a `foreach` List

If the elements created by a `foreach` block are regular HTML template items
they will be updated at he same time the foreach blocks is updated.

If the elements created by a `foreach` block are components, each item's
properties will be updated (if changed) but the component is not updated
or invalidated.  

ie: it's the Components reponsibility to determine if an update
is required.

