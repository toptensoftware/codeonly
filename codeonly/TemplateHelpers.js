import { HtmlString } from "./HtmlString.js";
import { ForEachManager } from "./ForEachManager.js";

export let TemplateHelpers = {
    // The foreach manager class
    ForEachManager,

    // Create either a text node from a string, or
    // a SPAN from an HtmlString
    createTextNode(text)
    {
        if (text instanceof HtmlString)
        {
            let span = document.createElement("SPAN");
            span.innerHTML = text.html;
            return span;
        }
        else
        {
            return document.createTextNode(text);
        }
    },

    // Set either the inner text of an element to a string
    // or the inner html to a HtmlString
    setElementText(node, text)
    {
        if (text instanceof HtmlString)
        {
            node.innerHTML = text.html;
        }
        else
        {
            node.innerText = text;
        }
    },

    // Set a node to text or HTML, replacing the 
    // node if it doesn't match the supplied text.
    setNodeText(node, text)
    {
        if (text instanceof HtmlString)
        {
            if (node.nodeType == 1)
            {
                node.innerHTML = text.html;
                return node;
            }

            let newNode = document.createElement("SPAN");
            newNode.innerHTML = text.html;
            node.replaceWith(newNode);
            return newNode;
        }
        else
        {
            if (node.nodeType == 3)
            {
                node.nodeValue = text;
                return node;
            }
            let newNode = document.createTextNode(text);
            node.replaceWith(newNode);
            return newNode;
        }
    },

    // Set or remove a class on an element
    setNodeClass(node, cls, set)
    {
        if (set)
            node.classList.add(cls);
        else
            node.classList.remove(cls);
    },

    // Set or remove a style on an element
    setNodeStyle(node, style, value)
    {
        if (value === undefined || value === null)
            node.style.removeProperty(style);
        else
            node.style[style] = value;
    },

    setNodeDisplay(node, show, prev_display)
    {
        if (show)
        {
            // Null means the property didn't previously exist so remove it
            // Undefined means we've not looked at the property before so leave it alone
            if (prev_display === null)
            {
                node.style.removeProperty("display");
            }
            else if (prev_display !== undefined)
            {
                if (node.style.display != prev_display)
                    node.style.display = prev_display;
            }
            return undefined;
        }
        else
        {
            let prev = node.style.display;
            if (node.style.display != "none")
                node.style.display = "none";
            return prev ?? null;
        }
    },

    replaceMany(oldNodes, newNodes)
    {
        // Insert the place holder
        oldNodes[0].replaceWith(...newNodes);

        // Remove the other fragment nodes
        for (let i=1; i<oldNodes.length; i++)
        {
            oldNodes[i].remove();
        }
    },

    addEventListener(model, el, eventName, handler)
    {
        function wrapped_handler(ev)
        {
            return handler(model, ev);
        }

        el.addEventListener(eventName, wrapped_handler);

        return function() { el.removeEventListener(eventName, wrapped_handler); }
    }


}

