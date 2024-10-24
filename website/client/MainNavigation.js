import { Component, Style, Html } from "@toptensoftware/codeonly";

export function fake_content()
{
    let r = [];
    for (let i=0; i<100; i++)
    {
        r.push(Html.p(`Line ${i}`));
    }
    return r;
}

// The main header
export class MainNavigation extends Component
{
    static template = {
        _: "nav",
        id: "nav-main",
        $: [
            "Navigation Pane",
            ...fake_content(),
        ]
    }
}

Style.declare(`
#nav-main
{
    x-background-color: purple;
    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px;
}
`);