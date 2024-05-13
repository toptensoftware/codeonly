import { Component, Html } from "../codeonly/codeonly.js";
import { Router } from "./Router.js";
import { RouterLink } from "../codeonly/RouterLink.js";

class Demo1 extends Component
{
    static template = [
        Html.h(1, "This is demo 1"),
        {
            type: "p",
            $: {
                type: RouterLink,
                title: "Hello World",
                href: "/demo2",
            }
        }
    ]

    static {
        Router.registerRoute("/demo1", "Demo 1", this);
    }
}