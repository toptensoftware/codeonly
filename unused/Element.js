import { ChildNodesWrapper } from "./ChildNodesWrapper.js";
import { wrapEventHandler } from "./EventHandlerWrapper.js";
import { shadow_to_node, camel_to_dash } from "../codeonly/Utils.js";

// Proxy handler for Element class
let elementHandler =
{
    set: function(object, key, value) 
    {
        if (key.startsWith("on_"))
        {
            // Get the event name
            let eventName = key.substring(3);

            // Create event handlers map
            if (!object._eventHandlers)
                object._eventHandlers = {};

            // Remove old listener
            if (object._eventHandlers[eventName])
                object.removeEventListener(eventName, object._eventHandlers[eventName]);

            // Store new event handler
            object._eventHandlers[eventName] = value;

            // Add new listener
            if (value)
                object.addEventListener(eventName, value);
            return true;
        }
        if (key.startsWith("attr_"))
        {
            object.node.setAttribute(camel_to_dash(key.substring(5)), value);
        }
        if (key.startsWith("class_"))
        {
            let className = camel_to_dash(key.substring(6));
            if (value)
            {
                object.node.classList.add(className);
            }
            else
            {
                object.node.classList.remove(className);
            }
        }
        return Reflect.set(...arguments);
    },            

    get: function(object, key)
    {
        if (key.startsWith("on_"))
        {
            // Get the event name
            let eventName = key.substring(3);

            // Look up handler
            if (!object._eventHandlers)
                return null;
            return object._eventHandlers[eventName];
        }
        if (key.startsWith("attr_"))
        {
            return object.node.getAttribute(camel_to_dash(key.substring(5)));
        }
        if (key.startsWith("class_"))
        {
            return object.node.classList.contains(camel_to_dash(key.substring(6)));
        }

        return Reflect.get(...arguments);
    }
}


export class Element
{
    constructor(el)
    {
        if (typeof(el) === 'string')
        {
            this.node = document.createElement(el);
        }
        else if (el instanceof HTMLElement)
        {
            this.node = type
        }

        let proxy = new Proxy(this, elementHandler);

        this.node.shadow = proxy;

        return proxy;
    }

    assign(props)
    {
        Object.assign(this, props);
        return this;
    }

    get nodeName()
    {
        return this.node.nodeName;
    }

    get childNodes()
    {
        if (!this._childNodes)
            this._childNodes = new ChildNodesWrapper(this.node);
        return this._childNodes;
    }

    set childNodes(value)
    {
        // Remove old child nodes from DOM
        while (this.node.firstChild)
            this.node.removeChild(this.node.firstChild);

        // Add child nodes to DOM
        for (let c of value)
        {
            this.node.appendChild(shadow_to_node(c));
        }
    }

    get text() { return this.node.innerText; }
    set text(value) { this.node.innerText = value; }
    get class() { this.node.getAttribute("class"); }
    set class(value) { this.node.setAttribute("class", value); }
    get style() { this.node.getAttribute("style"); }
    set style(value) { this.node.setAttribute("style", value); }

    addEventListener(name, handler)
    {
        // Create wrapper
        let wrapper = wrapEventHandler(handler);

        // Store Wrapper
        if (!this._eventWrappers)
            this._eventWrappers = {};
        if (!this._eventWrappers[name])
            this._eventWrappers[name] = [];
        this._eventWrappers[name].push({
                wrapper, handler
        });

        // Add listener
        this.node.addEventListener(name, wrapper);
    }

    removeEventListener(name, handler)
    {
        // Find wrapper function
        if (!this._eventWrappers)
            return;
        let wrappers = this._eventWrappers[name];
        for (let i=0; i<wrapper.length; i++)
        {
            if (wrappers[i].handler == handler)
            {
                // Remove listener
                this.node.removeEventListener(name, wrappers[i].wrapper);

                // Remove from wrapper collection
                wrappers.splice(i, 1);
                return;
            }
        }
    }

    static extend(name)
    {
        let dataName = "data-" + camel_to_dash(name);
        Object.defineProperty(this.prototype, name, {
            get () { return this.node.getAttribute(dataName)},
            set (value) { this.node.setAttribute(dataName, value)},
        })
    }
}
