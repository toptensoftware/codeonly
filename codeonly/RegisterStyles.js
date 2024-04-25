import { nextFrame } from "./NextFrame.js";

let pendingStyles = [];
let styleNode = null;

export function registerStyles(css)
{
    pendingStyles.push(css);
    nextFrame(mountStyles);
}

export function mountStyles()
{
    // Quit if nothing to do
    if (pendingStyles.length == 0)
        return;
    
    // First time, create style element
    if (styleNode == null)
        styleNode = document.createElement("style");

    // Append and new pending styles
    styleNode.innerHTML += pendingStyles.join("\n");
    pendingStyles = [];

    // Mount the node
    if (!styleNode.parentNode)
        document.head.appendChild(styleNode);
}