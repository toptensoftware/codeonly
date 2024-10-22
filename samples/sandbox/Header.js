import { Component, Style } from "@toptensoftware/codeonly";
import { appState } from "./AppState.js";

// The main header
export class Header extends Component
{
    static template = {
        _: "header",
        id: "header",
        $: [
            {
                _: "div",
                class: "title",
                text: "CodeOnly Sandbox",
            },
            {
                _: "div",
                class: "buttons",
                $: [
                    {
                        _: "a",
                        class: "small button",
                        attr_href: "https://www.toptensoftware.com/codeonly/",
                        attr_target: "_blank",
                        text: "Documentation",
                    },
                    {
                        _: "button",
                        class: "small",
                        text: "Save Link",
                        on_click: () => appState.onSaveLink(),
                    }
                ]
            }
        ]
    }
}

Style.declare(`
#header
{
    display: flex;
    justify-content: start;
    align-items: center;
    height: var(--header-height);
    border-bottom: 5px solid var(--back-color);
    padding-left: 10px;
    padding-right: 10px;

    .title 
    {
        flex-grow: 1;
    }


    .buttons
    {
        font-size: 12pt;
        display: flex;
        gap: 10px;
    }
}
`);