import { Component, Style } from "../codeonly/codeonly.js";

export class Header extends Component
{
    constructor()
    {
        super();
    }

    static template = {
        type: "div",
        id: "header",
        $:[
            "Code Only Demo Sandbox",
        ]
    }
}


Style.declare(`
#header
{
    position: fixed;
    top: 0;
    height: calc(3rem - 1px);
    width: 100%;
    align-items: center;
    display: flex;
    padding-left: 10px;
    background-color: #222;
    border-bottom: 1px solid #333;
}
`);