import { Style, Component } from "../codeonly/codeonly.js";
import { Header } from "./Header.js";
import { SidePanel} from "./SidePanel.js";
import { MainContent} from "./MainContent.js"
import "./Router.js"

import "./Demo1.js"
import "./Demo2.js"

class Application extends Component
{
    static template = [
        Header,
        {
            type: "div",
            id: "main-container",
            $:[
                SidePanel,
                MainContent,
            ]
        }
    ]
}

Style.declare(`
#main-container
{
    width: 100%;
    height: calc(100% - 3rem);
    position: fixed;
    top: 3rem;
    display: flex;
}
`);

export function main()
{
    new Application().mount("#main");
}