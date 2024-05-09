import { Component, Style, Html } from "../codeonly/codeonly.js";
import { Router } from "./Router.js";

export class SidePanel extends Component
{
    constructor()
    {
        super();
    }

    static template = {
        type: "div",
        id: "side-panel",
        $:{ 
            type: "ul",
            $:{
                foreach: Router.routes,
                type: "li",
                $:Html.a(x => "#" + x.url, x => x.name),
            }
        }
    }
}


Style.declare(`
#side-panel
{
    width: 25%;
    background-color: #222;
    overflow-y: auto;
    padding: .5rem;
}
`);