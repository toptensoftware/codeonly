import { HtmlString } from "./HtmlString.js";

export let helpers = {
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
            this.removeNode(fragmentNodes[i]);
        }
    },
    removeNode(node)
    {
        if (Array.isArray(node))
        {
            for (let n of node)
                this.removeNode(n);
        }
        else
        {
            node.parentNode.removeChild(node);
        }
    }
}

