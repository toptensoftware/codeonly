import { Component, Style, Transition, router } from "@toptensoftware/codeonly";
import { Header } from "./Header.js";

import "./ArticlePage.js";
import "./NotFoundPage.js";

// Main application
class Application extends Component
{
    constructor()
    {
        super();

        router.addEventListener("navigateLoaded", (ev) => {

            // Load navigated page into router slot
            if (ev.route.page)
            {
                if (!ev.route.layout)
                {
                    this.layoutSlot.content = ev.route.page;
                }
                else
                {
                    // Different layout?
                    if (ev.route.layout != this.#currentLayout?.constructor)
                    {
                        // Create new layout component
                        this.#currentLayout = new ev.route.layout();
                        this.layoutSlot.content = this.#currentLayout;
                    }

                    this.#currentLayout.loadRoute(ev.route);
                }
            }
        });

        router.addEventListener("navigateCancelled", (ev) => {
            ev.route.page?.destroy();
        });
    }

    #currentLayout = null;

    static template = {
        type: "div",
        id: "layoutRoot",
        $: [
            Header,
            {
                type: "embed-slot",
                bind: "layoutSlot",
            }
        ]
    }
}

Style.declare(`
#layoutRoot
{
    padding-top: var(--header-height);
}
`);

// Main entry point, create Application and mount
export function main()
{
    new Application().mount("body");
    router.start();
}