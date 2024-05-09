import { Component, Style, EmbedSlot } from "../codeonly/codeonly.js";
import { Router } from "./Router.js";

export class MainContent extends Component
{
    constructor()
    {
        super();
        Router.addListener((route) => {
            if (route)
                this.contentSlot.content = new route.componentClass();
            else
                this.contentSlot.content = null;
        });
    }

    static template = {
        type: "div",
        id: "content",
        $:{
            type: EmbedSlot,
            bind: "contentSlot",
        }
    }
}


Style.declare(`
#content
{
    width: 75%;
    height: 100%;
    overflow-y: auto;
    padding: .5rem;
}
`);