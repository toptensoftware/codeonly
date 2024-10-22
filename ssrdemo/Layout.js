import { Component, Html, Style } from "../codeonly.js";

export class Layout extends Component
{
    page = null;

    static template = {
        type: "html",
        $: [
            {
                type: "head",
                $: [
                    Html.title(c => c.page?.pageTitle ?? "Missing Page Title"),
                    Html.style(() => Style.all),
                    //Html.linkStyle("/styles.css"),
                ],
            },
            {
                type: "body",
                $: [
                    Html.h(1, "CodeOnly SSR!"),
                    {
                        type: "main",
                        $: Html.embed(c => c.page),
                    },
                ]
            },
        ]
    }
}


Style.declare(`
:root
{
    color-scheme: dark;
    font-family: sans-serif;
}
`);
