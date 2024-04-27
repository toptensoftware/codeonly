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


    insertFragment(placeholder, fragmentNodes)
    {
        // Capture the parent
        let parent = placeholder.parentNode;

        placeholder.after(...fragmentNodes);
        placeholder.remove();
    },

    removeFragment(fragmentNodes, placeholder)
    {
        // Insert the place holder
        fragmentNodes[0].replaceWith(placeholder);

        // Remove the other fragment nodes
        for (let i=1; i<fragmentNodes.length; i++)
        {
            fragmentNodes[i].remove();
        }
    },
}

