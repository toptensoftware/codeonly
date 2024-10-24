import { Component, Style } from "@toptensoftware/codeonly";

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
                text: "CodeOnly",
            },
            {
                _: "div",
                class: "buttons",
                $: [
                ]
            }
        ]
    }
}

Style.declare(`
:root
{
    --header-height: 40px;
}

#header
{
    position: fixed;
    width: 100%;
    height: var(--header-height);

    display: flex;
    justify-content: start;
    align-items: center;
    border-bottom: 1px solid var(--gridline-color);
    padding-left: 10px;
    padding-right: 10px;
    background-color: rgb(from var(--back-color) r g b / 75%);
    z-index: 1;

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