import { Component, Style } from "@toptensoftware/codeonly";
import { Header } from "./Header.js";
import { router } from "./router.js";

import "./ArticlePage.js";
import "./sandbox/SandboxPage.js";
import "./NotFoundPage.js";

// Main application
class Application extends Component
{
    constructor()
    {
        super();

        router.addEventListener("didEnter", (from, to) => {

            // Load navigated page into router slot
            if (to.page)
            {
                if (!to.page.layout)
                {
                    this.layoutSlot.content = to.page;
                    this.#currentLayout = null;
                }
                else
                {
                    // Different layout?
                    if (to.page.layout != this.#currentLayout?.constructor)
                    {
                        // Create new layout component
                        this.#currentLayout = new to.page.layout();
                        this.layoutSlot.content = this.#currentLayout;
                    }

                    this.#currentLayout.loadRoute(to);
                }
            }
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
    padding-top: var(--fixed-header-height);
}
`);

// Main entry point, create Application and mount
export function main()
{
    new Application().mount("body");
    router.start();
}