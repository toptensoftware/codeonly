import { Component, Template, Style } from "./codeonly/codeonly.js";

class MainComponent extends Component
{
    constructor()
    {
        super();
        this.title = "Hello World";
    }

    get title() { return this._title; }
    set title(value) { this._title = value; this.invalidate(); }
}

Template.declare(MainComponent, {
    childNodes: [
        {
            type: "button",
            text: "Click Me",
            on_click: c => c.title = "Clicked",
        },
        {
            type: "div",
            text: c => c.title,
            class_clicked: c => c.title == "Clicked",
        },
    ]
});

Style.declare(`
#main
{
    .clicked
    {
        background-color: red;
        color: white;
    }
}
`)

export function main()
{
    new MainComponent().mount("#main");
}