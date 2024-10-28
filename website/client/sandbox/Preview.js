import { Component, Style } from "@toptensoftware/codeonly";
import { PreviewIFrame } from "./PreviewIFrame.js";

// The preview pane
export class Preview extends Component
{
    constructor()
    {
        super();
    }

    #script="";
    set script(value)
    {
        this.#script = value;
        this.invalidate();
    }

    // Helper to create a new iFrame component each time
    // the script changes
    createIframe()
    {
        // Create an iframe component for this script
        return new PreviewIFrame(this.#script);
    }

    static template = {
        _: "div",
        id: "preview",
        $: {
            _: "embed-slot",
            content: c => c.createIframe(),
        }
    }
}


Style.declare(`
#preview
{
    position: relative;
    flex-grow: 1;
    background: var(--body-back-color);
    iframe
    {
        width: 100%;
        height: 100%;
        border: none;
    }
}
`);

