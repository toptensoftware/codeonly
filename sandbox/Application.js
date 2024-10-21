import { Component, Style } from "@toptensoftware/codeonly";
import { Header } from "./Header.js";
import { Editor } from "./Editor.js";
import { Preview } from "./Preview.js";

// Main application
class Application extends Component
{
    static template = [
        Header,
        {
            _: "main",
            id: "main",
            $: [
                Editor,
                Preview
            ]
        }
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
    new Application().mount("body");
}