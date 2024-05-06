import { Component, Style } from "./codeonly/codeonly.js";

class UpDownComponent extends Component
{
    constructor()
    {
        super();
        this.value = 1;
    }
}

Component.declareProperty(UpDownComponent, "value");
Component.declareTemplate(UpDownComponent, {
    type: "div",
    childNodes: [
        {
            type: "button",
            text: "<",
            on_click: c => c.value--,
        },
        {
            type: "div",
            style: "display: inline-block; width: 40px; text-align: center",
            text: c => c.value,
        },
        {
            type: "button",
            text: ">",
            on_click: c => c.value++,
        }
    ]
});



class MainComponent extends Component
{
    constructor()
    {
        super();
        this.update();
    }

}

Component.declareProperty(MainComponent, "clicked");

Component.declareTemplate(MainComponent, {
    childNodes: [
        {
            type: "button",
            text: "Click Me",
            on_click: c => c.clicked = !c.clicked,
        },
        {
            type: "div",
            text: c => c.clicked ? "On" : "Off",
            class_clicked: c => c.clicked,
        },
        {
            type: UpDownComponent,
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