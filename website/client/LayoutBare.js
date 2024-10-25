import { Component, Style, Transition } from "@toptensoftware/codeonly";
import { MobileBar } from "./MobileBar.js";
import { MainNavigation } from "./MainNavigation.js";
import { SecondaryNavigation } from "./SecondaryNavigation.js";

// Main application
export class LayoutBare extends Component
{
    constructor()
    {
        super();
    }

    loadRoute(route)
    {
        this.page = route.page;
        this.invalidate();
    }

    static template = {
        type: "div",
        id: "layoutBare",
        $: {
            type: "embed-slot",
            content: c => c.page,
        },
    };
}

Style.declare(`
#layoutBare
{
    max-width: 1050px;
    margin: 0 auto;
    padding-top: var(--header-height);
}
`);
