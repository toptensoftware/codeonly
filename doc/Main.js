import { Component, Style, Html } from "@toptensoftware/codeonly";

// Main application
class Main extends Component
{
    static template = [
        Html.h(1, "CodeOnly Docs!!"),
    ];
}

Style.declare(`
body
{
    padding: 0;
    margin: 0;

    --header-height: 40px;
}

#main
{
    display: flex;
    height: calc(100vh - var(--header-height));
    gap: 10px;
    background: var(--back-color);

}
`);

// Main entry point, create Application and mount
export function main()
{
    new Main().mount("body");
}