import { Component, Style } from "@toptensoftware/codeonly";

// The main header
export class Header extends Component
{
    static template = {
        _: "header",
        id: "header",
        $: [
            {
                _: "a",
                class: "title",
                attr_href: "/",
                $: [
                    { 
                        type: "img", 
                        attr_src: "/favicon.svg",
                    },
                    "APPNAME",
                ]
            },
            {
                _: "div",
                class: "buttons",
                $: [
                    {
                        type: "input",
                        attr_type: "checkbox",
                        attr_checked: window.stylish.darkMode ? "checked" : undefined,
                        class: "theme-switch",
                        on_click: () => window.stylish.toggleTheme(),
                    },
                ]
            }
        ]
    }
}

Style.declare(`
:root
{
    --header-height: 50px;
}

#header
{
    position: fixed;
    top: 0;
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
        display: flex;
        align-items: center;
        color: var(--body-fore-color);
        transition: opacity 0.2s;

        &:hover
        {
            opacity: 75%;
        }

        img
        {
            height: calc(var(--header-height) - 25px);
            padding-right: 10px
        }
    }


    .buttons
    {
        font-size: 12pt;
        display: flex;
        gap: 10px;
        align-items: center;

        .theme-switch
        {
            transform: translateY(-1.5px);
        }
    }
}
`);