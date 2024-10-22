import { Html, Component, Style } from "../codeonly.js";

export class OtherPage extends Component
{
    static template = [
        Html.h(2, "This is the other page"),
        
        {
            type: "ul",
            class: "danger",
            $: {
                foreach : [ "apples", "pears", "bananas" ],
                type: "li",
                text: i => i,
            },
        },

        ...["W", "O", "W... it works"].map(x => ({ type: "div", text: `${x}` })),

        Html.a("/", "Home"),
    ];
}

Style.declare(`
.danger
{
    color: tomato;
}
`);