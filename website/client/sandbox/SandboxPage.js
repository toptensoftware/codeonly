import { Component, Style, Html } from "@toptensoftware/codeonly";
import { router } from "../router.js";
import { CodeEditor } from "./CodeEditor.js";
import { Preview } from "./Preview.js";
import { compress, decompress, bufferToBase64, base64ToBuffer } from "./Utils.js";
import { downloadScript } from "./downloadScript.js";
import { CopyButton } from "./CopyButton.js";

let hello_world = `class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;

class SandboxPage extends Component
{
    constructor(initData)
    {
        super();
        this.init();
        this.editor.value = initData?.code ?? hello_world;
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

    async onCopyLink()
    {
        if (navigator.clipboard) {
            let url = new URL(window.location);
            let data = JSON.stringify({
                code: this.editor.value
            });
            url.hash = await bufferToBase64(await compress(data));
            navigator.clipboard.writeText(url.href);
            window.location.hash = url.hash;
        }
    }

    showErrors = true;

    onShowErrorsChanged(ev)
    {
        this.showErrors = ev.target.checked;
        this.invalidate();
    }

    onDownload()
    {
        downloadScript(this.editor.value);
    }

    static template = {
        type: "div",
        class: "sandbox",
        $:[
            {
                type: "div",
                class: "editor-container",
                $: [
                    {
                        type: CodeEditor,
                        bind: "editor",
                        on_input: c => c.onCodeChange(),
                    },
                    {
                        _: "div",
                        class: "error",
                        display: c => !!c.error && c.showErrors,
                        text: c => c.error,
                    },
                ]
            },
            {
                type: "div",
                class: "preview-container",
                $: [
                    {
                        type: Preview,
                        bind: "preview",
                    },
                    {
                        type: "footer",
                        $: [
                            {
                                type: "label",
                                $: [
                                    {
                                        type: "input",
                                        attr_type: "checkbox",
                                        attr_checked: "checked",
                                        class: "switch",
                                        on_click: (c, ev) => c.onShowErrorsChanged(ev),
                                    },
                                    "Show Errors",
                                ]
                            },
                            { 
                                type: CopyButton,
                                class: "subtle",
                                text: "Copy Link",
                                on_click: c => c.onCopyLink(),
                            },
                            { 
                                type: "button",
                                class: "subtle",
                                text: "Download",
                                on_click: c => c.onDownload(),
                            },
                        ]
                    }
                ]
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

    .editor-container
    {
        width: 50%; 
        height: 100%; 
        position: relative;
        border-right: 1px solid var(--gridline-color);
        padding-right: 1px;
    }


    .preview-container
    {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        align-items: stretch;
    }

    footer
    {
        display: flex;
        gap: 10px;
        width: 100%;
        padding: 10px;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--gridline-color);
    }

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
    match: async (to) => {
        let initData = null;
        if (to.url.hash.length > 1)
        {
            initData = JSON.parse(
                await decompress(
                    await base64ToBuffer(to.url.hash.substring(1))
                )
            );
        }
        to.page = new SandboxPage(initData);
        return true;
    }
});


export async function openSandboxWithCode(code)
{
    let data = JSON.stringify({ code });
    let hash = await bufferToBase64(await compress(data));
    router.navigate(`/sandbox#${hash}`);
}


