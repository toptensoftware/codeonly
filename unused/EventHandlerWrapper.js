import { node_to_shadow } from "../codeonly/Utils.js";

// Proxy handler for HTML Event class
let eventWrapperProxyHandler =
{
    get: function(object, key) 
    {
        if (key == "target")
        {
            return node_to_shadow(object.target);
        }

        return Reflect.get(...arguments);
    }
}

export function wrapEventHandler(handler)
{
    return function(ev)
    {
        return handler(new Proxy(ev, eventWrapperProxyHandler));
    }
}