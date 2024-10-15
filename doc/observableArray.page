---
title: "ObservableArray Class"
subtitle: "A simple, lightweight, code-only front-end Web framework."
projectTitle: CodeOnly
---
# ObservableArray Class

The observable array class provides a way to manage an array of items and
receive callback notifications when the content of the array changes.

The API to ObservableArray is exactly the same as the standard JavaScript
Array with the following additions:

* An `underlying` property that returns the underlying JavaScript array
* An `isObservable` property that returns true
* The `addListener(callback)` and `removeListener(callback)` functions can be used to add and remove 
  listeners.
* The `touch(index)` method that fires a callback indicating the deep content of an item has changed.


## Listener Callback

The listener callback is passed three arguments:

* `index` - the position of the update operation
* `del` - the number of items deleted at index
* `ins` - the number of items inserted at index

(Note: the arguments are analogous to the the `Array.splice` function parameters) 

To register a listener, pass the listener callback function to `addListener`:

```js
let arr = new ObservableArray();
arr.addListener((index, del, ins) => {

});
```

## Touch and Item Change Callbacks

The `touch` method provides a way to notify that an item in the collection
has changed, without it's object reference actually changing.  Think of this
as a "deep change" notification.

The change notification is indicated to the listener callback as a callback 
with both `ins` and `del` set to `0`.

eg: suppose you have an observable array of objects like so with an listener:

```js
let arr = new ObservableArray(
    { id: 1, text: "apples" },
    { id: 2, text: "pears" },
    { id: 3, text: "bananas" },
);

arr.addListener(myListener);
```

Now lets say we modify an object and want to notify the listeners. Because
we're not actually modifying the collection, normally there would be no
notification callback.
 
By calling the `touch` method we can notify listeners of the array that 
something about that item changed:

```js
arr[1].text = "berries";    // This doesn't modify the array, so no notification
arr.touch(1);               // ... but we can force one with `touch`
```

The listener just needs to check for this special case:

```js
function myListener(index, del, ins) => 
{
    if (del == 0 && ins == 0)
    {
        // Item at index was "touched"
    }
}
```





