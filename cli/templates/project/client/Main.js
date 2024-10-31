import { Component, Style } from "@toptensoftware/codeonly";
import { router } from "./router.js";

import "NotFoundPage.js";

// Main application
class Main extends Component
{
    constructor()
    {
        super();

        router.addEventListener("didEnter", (from, to) => {

            // Load navigated page into router slot
            if (to.page)
            {
                this.layoutSlot.content = to.page;
            }

        });
    }

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
    new Main().mount("body");
    router.start();
}