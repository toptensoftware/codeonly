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
`);

// Main entry point, create Application and mount
export function main()
{
    new Application().mount("body");
    router.start();
}