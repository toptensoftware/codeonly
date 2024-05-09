import { Component, Style, Html } from "../codeonly/codeonly.js";
import { Router } from "./Router.js";

class UpDownComponent extends Component
{
    constructor()
    {
        super();
        this.value = 1;
    }

    static template = {
        type: "div",
        $:[
            {
                type: "button",
                text: Html.raw("&larr;"),
                on_click: c => c.value--,
            },
            {
                type: "span",
                class: "up-down-value",
                text: c => c.value,
            },
            {
                type: "button",
                text: Html.raw("&rarr;"),
                on_click: c => c.value++,
            }
        ]
    }
}

Component.declareProperty(UpDownComponent, "value");

Style.declare(`
.up-down-value
{
    display: inline-block;
    width: 40px; 
    text-align: center;
}
`);

class Demo2 extends Component
{
    static template = [
        Html.h(1, "Up/Down Counter"),
        Html.p("A simple up/down counter component"),
        UpDownComponent,
    ]

    static {
        Router.registerRoute("/updown", "Up/Down", this);
    }
}