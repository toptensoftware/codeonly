import { Component, Style, Html } from "@toptensoftware/codeonly";

function fake_content()
{
    let r = [];
    for (let i=0; i<10; i++)
    {
        r.push({ type: "li", text: `Nav ${i}`});
    }
    return r;
}

// The main header
export class SecondaryNavigation extends Component
{
    static template = {
        type: "nav",
        $: [
            "On This Page",
            {
                type: "ul",
                $: fake_content(),
            }
        ]
    }
}

Style.declare(`
`);