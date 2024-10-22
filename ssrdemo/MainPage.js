import { Html, Component, Style } from "../codeonly.js";

export class MainPage extends Component
{
    pageTitle = "Main Page";

    static template = [
        Html.p("This is the main page"),
        Html.a("other", "Other"),
    ];
}
