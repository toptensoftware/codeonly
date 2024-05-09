import { Component, Style } from "../codeonly/codeonly.js";
import { Router } from "./Router.js";

class Demo1 extends Component
{
    static template = [
        "This is demo 1",
    ]

    static {
        Router.registerRoute("/demo1", "Demo 1", this);
    }
}