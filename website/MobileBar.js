import { Component, Style } from "@toptensoftware/codeonly";

// The main header
export class MobileBar extends Component
{
    static template = {
        _: "header",
        id: "mobile-bar",
        $: [
            {
                type: "button",
                class: "subtle muted",
                id: "side-panel-menu-button",
                on_click: c => c.dispatchEvent(new Event("showPanel")),
                $: [
                    {
                        type: "svg",
                        attr_width: "20",
                        attr_height: "20",
                        attr_viewBox: "0 -960 960 960",
                        attr_preserveAspectRatio: "xMidYMid slice",
                        attr_role: "img",
                        $: {
                            type: "path",
                            attr_d: "M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z",
                        }
                    },
                    " Menu"
                ]
            },
            {
                type: "button",
                class: "subtle muted",
                id: "side-panel-menu-button",
                on_click: c => c.dispatchEvent(new Event("showSecondaryPanel")),
                text: "On this page ›"
            }
        ]
    }
}

Style.declare(`
#mobile-bar
{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gridline-color);
    padding-left: 10px;
    padding-right: 10px;
    background-color: rgb(from var(--back-color) r g b / 75%);
    z-index: 1;
    display: none;

}

#side-panel-menu-button
{
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    padding: 5px;

    svg
    {
        margin-right: 0.2rem;
    }
}
`);