import { shadow_to_node, node_to_shadow } from "../codeonly/Utils.js";

let childNodesProxyHandler = {
    get: function(object, key)
    {
        if (typeof(key) === "string")
        {
            let index = parseInt(key);
            if (!isNaN(index))
                return object.at(index);
        }
        return Reflect.get(...arguments);
    },
    set: function(object, key, value)
    {
        if (typeof(key) === "string")
        {
            let index = parseInt(key);
            if (!isNaN(index))
                return object.setAt(index, value);
        }
        return Reflect.get(...arguments);
    }
}


export class ChildNodesWrapper
{
    constructor(el)
    {
        this.el = el;
        return new Proxy(this, childNodesProxyHandler);
    }

    get length() 
    { 
        return this.el.childNodes.length;
    }

    splice(index, count)
    {
        // Remove items
        if (count)
        {
            let child = this.el.childNodes[index];
            while (child && i)
            {
                let next = child.nextSibling;
                this.el.removeChild(child);
                child = next;
                i--;
            }
        }

        // Insert items
        let before = index < this.el.childNodes.length ? this.el.childNodes[index] : null;
        for (let i=2; i<arguments.length; i++)
        {
            this.el.insertBefore(shadow_to_node(arguments[i]), before);
        }
    }

    push()
    {
        this.splice(this.length, 0, ...arguments);
    }

    pop()
    {
        if (this.length == 0)
            return;
        let el = this.el.childNodes[this.el.childNodes.length - 1];
        this.splice(this.length - 1, 1);
        return node_to_shadow(el);
    }

    shift()
    {
        if (this.length == 0)
            return;
        let el = this.el.childNodes[0];
        this.splice(0, 1);
        return node_to_shadow(el);
    }

    unshift()
    {
        this.splice(0, 0, ...arguments);
    }

    at(index)
    {
        return node_to_shadow(this.el.childNodes[index]);
    }

    setAt(index, value)
    {
        let child = this.el.childNodes[index];
        this.el.replaceChild(value, shadow_to_node(child));
    }

    forEach(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        while (child)
        {
            let next = child.nextSibling;
            callback.call(thisArg, node_to_shadow(child), index, this);
            child = next;
            index++;
        }
    }

    some(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        while (child)
        {
            let next = child.nextSibling;
            if (callback.call(thisArg, node_to_shadow(child), index, this))
                return true;
            child = next;
            index++;
        }
        return false;
    }

    every(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        while (child)
        {
            let next = child.nextSibling;
            if (!callback.call(thisArg, node_to_shadow(child), index, this))
                return false;
            child = next;
            index++;
        }
        return true;
    }

    filter(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        let result = [];
        while (child)
        {
            let next = child.nextSibling;
            let shadow = node_to_shadow(child);
            if (callback.call(thisArg, shadow, index, this))
                result.push(shadow);
            child = next;
            index++;
        }
        return result;
    }

    map(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        let result = [];
        while (child)
        {
            let next = child.nextSibling;
            let shadow = node_to_shadow(child);
            result.push(callback.call(thisArg, shadow, index, this));
            child = next;
            index++;
        }
        return result;
    }

    find(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        let result = [];
        while (child)
        {
            let next = child.nextSibling;
            let shadow = node_to_shadow(child);
            if (callback.call(thisArg, shadow, index, this))
                return shadow;
            child = next;
            index++;
        }
        return undefined;
    }

    findIndex(callback, thisArg)
    {
        let index = 0;
        let child = this.el.firstChild;
        let result = [];
        while (child)
        {
            let next = child.nextSibling;
            let shadow = node_to_shadow(child);
            if (callback.call(thisArg, shadow, index, this))
                return index;
            child = next;
            index++;
        }
        return -1;
    }

    findLast(callback, thisArg)
    {
        let index = this.length - 1;
        let child = this.el.lastChild;
        let result = [];
        while (child)
        {
            let next = child.previousSibling;
            let shadow = node_to_shadow(child);
            if (callback.call(thisArg, shadow, index, this))
                return shadow;
            child = next;
            index--;
        }
        return undefined;
    }

    findLastIndex(callback, thisArg)
    {
        let index = this.length - 1;
        let child = this.el.lastChild;
        let result = [];
        while (child)
        {
            let next = child.previousSibling;
            let shadow = node_to_shadow(child);
            if (callback.call(thisArg, shadow, index, this))
                return index;
            child = next;
            index--;
        }
        return -1;
    }

    indexOf(node)
    {
        return this.findIndex(x => x == node);
    }

    includes(node)
    {
        return this.findIndex(x => x == node) >= 0;
    }

    *entries()
    {
        let child = this.el.firstChild;
        let index = 0;
        while (child != null)
        {
            let next = child.nextSibling;
            yield [ index, node_to_shadow(child) ];
            child = next;
            index++;
        }
    }

    *keys()
    {
        let index = 0;
        while (index < this.el.childNodes.length)
        {
            yield index;
            index++;
        }
    }

    *values()
    {
        let child = this.el.firstChild;
        while (child != null)
        {
            let next = child.nextSibling;
            yield node_to_shadow(child);
            child = next;
        }
    }

    [Symbol.iterator]()
    {
        return this.values();
    }

    slice()
    {
        return Array.from(this).slice(...arguments);
    }

    reduce()
    {
        return Array.from(this).reduce(...arguments);
    }

    reduceRight()
    {
        return Array.from(this).reduceRight(...arguments);
    }

    toReversed()
    {
        let array = Array.from(this);
        array.reverse();
        return array;
    }

    toSorted()
    {
        let array = Array.from(this);
        array.sort(...arguments);
        return array;
    }

    toSpliced()
    {
        let array = Array.from(this);
        array.splice(...arguments);
        return array;
    }
}

