import { Element } from "./Element.js";

// Given an HTMLElement, return an Element
export function node_to_shadow(node)
{
    if (!node)
        return node;
    if (node.shadow)
        return node.shadow;
    switch (node.nodeType)
    {
        case 1: return new Element(node);
        case 3: return new TextNode(node);
    }
    throw new Error("Unsupported node");
}

export function shadow_to_node(el)
{   
    if (el instanceof Element)
        return el.node;
    if (typeof(el) === "string")
        return document.createTextNode(el);
    return el;
}
