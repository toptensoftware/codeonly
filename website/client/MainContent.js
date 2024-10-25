import { Component, Style, router } from "@toptensoftware/codeonly";

// The main header
export class MainContent extends Component
{
    constructor()
    {
        super();

    }
    
    static template = {
        type: "main",
        $: {
            type: "embed-slot",
            bind: "routerSlot",
        }
    }
}

Style.declare(`
main
{
}

`);

