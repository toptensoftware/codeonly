import { Component, Style, Html } from "@toptensoftware/codeonly";
import { appState } from "./AppState.js";


// The main header
export class SecondaryNavigation extends Component
{
    constructor()
    {
        super();
    }

    #inPageLinks;
    get inPageLinks()
    {
        return this.#inPageLinks;
    }
    set inPageLinks(value)
    {
        this.#inPageLinks = value;
        this.invalidate();
    }

    static template = {
        type: "nav",
        id: "secondary-nav",
        $: [
            {
                if: c => c.inPageLinks?.length > 0,
                $: Html.h(6, "On This Page"),
            },
            {
                type: "ul",
                $: {
                    foreach: c => c.inPageLinks,
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