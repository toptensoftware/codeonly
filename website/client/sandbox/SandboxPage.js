import { Component, Style, Html } from "@toptensoftware/codeonly";
import { router } from "../router.js";
import { CodeEditor } from "./CodeEditor.js";
import { Preview } from "./Preview.js";

let hello_world = `class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;

class SandboxPage extends Component
{
    constructor()
    {
        super();
        this.init();
        this.editor.value = hello_world;
        this.preview.script = this.editor.value;

        // Display errors from iFrame preview
        this.onIFrameMessage = this.onIFrameMessage.bind(this);
        window.addEventListener("message", this.onIFrameMessage);
    }

    destroy()
    {
        window.removeEventListener("message", this.onIFrameMessage);
    }

    onIFrameMessage(ev)
    {
        if (ev.data.action == "error")
        {
            this.error = `line: ${ev.data.error.lineno} col: ${ev.data.error.colno}: ${ev.data.error.message}`;
        }
    }

    // True when we're updating the script content
    #updating = false;

    // Error message to display
    #error = null;
    get error()
    {
        return this.#error;
    }
    set error(value)
    {
        this.#error = value;
        this.invalidate();
    }

    #timer = null;

    onCodeChange()
    {
        // Clear error
        this.error = null;

        if (this.#updating)
            return;

        // Coalesc updates into 1 second intervals
        if (this.#timer != null)
            clearTimeout(this.#timer);
        this.#timer = setTimeout(() => {
            
            this.#updating = true;
            this.preview.script = this.editor.value;
            this.#updating = false;

        }, 500);
    }

    
    static template = {
        type: "div",
        class: "sandbox",
        $:[
            {
                type: "div",
                style: "width: 50%; height: 100%; position: relative",
                $: [
                    {
                        type: CodeEditor,
                        bind: "editor",
                        on_input: c => c.onCodeChange(),
                    },
                    {
                        _: "div",
                        class: "error",
                        display: c => !!c.error,
                        text: c => c.error,
                    },
                ]
            },
            {
                type: Preview,
                bind: "preview",
            }
        ]
    };
}

Style.declare(`
.sandbox
{
    display: flex;
    align-items: stretch;
    height: calc(100% - var(--header-height));

    .error
    {
        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 2rem;
        padding: 0.5rem;
        background-color: rgb(from var(--danger-color) r g b / 10%);
        border: 1px solid var(--danger-color);
        border-radius: .3rem;
        z-index: 100;
    }
}
`);


router.register({
    pattern: "/sandbox",
    match: (to) => {
        to.page = new SandboxPage()
        return true;
    }
});

