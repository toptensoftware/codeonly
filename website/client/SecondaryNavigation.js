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
                $: Html.h(6, "On This Page"),
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
    padding: 0rem 1rem 1rem 1rem;

    ul
    {
        font-size: 0.8rem;
        li
        {
            padding-top: 0.5rem;
            line-height: 1.2rem;
        }
    }
}

`);