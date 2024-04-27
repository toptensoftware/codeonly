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
        fragmentNodes = fragmentNodes.flat(Infinity);

        // Capture the parent
        let parent = placeholder[0].parentNode;

        // Insert nodes before the place holder
        for (let i=0; i<fragmentNodes.length-1; i++)
        {
            parent.insertBefore(fragmentNodes[i], placeholder[0]);
        }

        // Replace the place holder with the last node
        placeholder[0].replaceWith(fragmentNodes[fragmentNodes.length - 1]);
    },
    removeFragment(fragmentNodes, placeholder)
    {
        fragmentNodes = fragmentNodes.flat(Infinity);

        // Capture the parent
        let parentNode = fragmentNodes[0].parentNode;

        // Insert the place holder
        fragmentNodes[0].replaceWith(placeholder[0]);

        // Remove the other fragment nodes
        for (let i=1; i<fragmentNodes.length; i++)
        {
            this.complexRemove(fragmentNodes[i]);
        }
    },

    // Replace a complex set of nodes with another, keeping
    // a placeholder to manage the position of empty sets.
    complexReplace(oldNodes, newNodes)
    {
        if (!Array.isArray(oldNodes) || !Array.isArray(newNodes))
            throw new Error("complexReplace expects both parameters to be arrays of nodes");

        // Handle old node is a placeholder
        if (oldNodes.length == 0)
        {
            if (oldNodes.placeholder)
                oldNodes = [ oldNodes.placeholder ];
        }
        else
        {
            oldNodes = oldNodes.flat(Infinity);
        }

        // Handle new nodes needs a placeholder
        newNodes = newNodes.flat(Infinity);
        if (newNodes.length == 0)
        {
            // Create a place holder and store it in the supplied array
            newNodes.placeholder = document.createComment(" placeholder ");

            // Create a new array that's just got the place holder as a normal
            // indexed element
            newNodes = [ newNodes.placeholder ];
        }

        // We should now have two flat arrays, each of at least one node
        
        // Remove the old nodes (except the first)
        if (oldNodes.length > 1)
        {
            for (let i=1; i < oldNodes.length; i++)
                oldNodes[i].remove();
        }

        // Replace the 1 remaining old node with the new nodes
        oldNodes[0].replaceWith(...newNodes);
    },

    // Remove a complex set of nodes
    complexRemove(node)
    {
        if (Array.isArray(node))
        {
            for (let i=0; i<node.length; i++)
                this.complexRemove(node[i]);
        }
        else
        {
            node.remove();
        }
    },

    // Insert a complex set of nodes before node
    complexInsertBefore(node, before)
    {
        if (Array.isArray(node))
        {
            for (let i=0; i<node.length; i++)
            {
                this.complexInsertBefore(node[i], before);
            }
        }
        else
        {
            before.parentNode.insertBefore(node, before);
        }
    },

    // Insert a complex set of nodes after a node
    complexInsertAfter(node, after)
    {
        if (Array.isArray(node))
        {
            for (let i=node.length - 1; i >= 0; i--)
            {
                this.complexInsertBefore(node[i], after);
            }
        }
        else
        {
            after.parentNode.insertAfter(node, after);
        }
    }
}

