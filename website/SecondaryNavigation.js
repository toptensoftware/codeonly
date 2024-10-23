import { Component, Style, Html } from "@toptensoftware/codeonly";
import { appState } from "./AppState.js";


// The main header
export class SecondaryNavigation extends Component
{
    constructor()
    {
        super();
        appState.addEventListener("documentChanged", () => {
            this.invalidate();
        });
    }
    static template = {
        type: "nav",
        id: "secondary-nav",
        $: [
            {
                if: () => appState.document?.headings?.length > 0,
                $: "On This Page",
            },
            {
                type: "ul",
                $: {
                    foreach: () => appState.document?.headings,
                    type: "li",
                    $: {
                        type: "a",
                        attr_href: i => `#${i.id}`,
                        text: i => i.text,
                    }
                }
            }
        ]
    }
}

Style.declare(`
#secondary-nav
{
    padding: 2.5rem 1rem 1rem 1rem;
}

`);