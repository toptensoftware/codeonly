import { Component, Style } from "@toptensoftware/codeonly";
import { appState } from "./AppState.js";

// The editor!
export class Editor extends Component
{
    constructor()
    {
        super();
        this.init();

        // Load Monaco
        require(['vs/editor/editor.main'], () => {

            // Create editor
            this.editor = monaco.editor.create(this.editorContainer, {
                value: appState.script,
                language: 'javascript',
                theme: 'vs-dark'
            });

            // Watch for script changes
            this.editor.getModel().onDidChangeContent((event) => {
                this.onCodeChange();
            });

            // Initial resize of editor
            this.resizeEditor();
        });

        // Watch for resizing and update editor size
        let ro = new ResizeObserver(() => {
            this.resizeEditor();
        });
        ro.observe(this.editorContainer);

        // When the script changes, (restore data link) load it 
        // into the editor
        appState.addEventListener("scriptChanged", (ev) => {
            if (!this.#updating && this.editor)
                this.editor.setValue(appState.script);
        });

        // When script error occurs, display in popup
        appState.addEventListener("scriptError", (ev) => {
            this.error = `line: ${ev.error.lineno} col: ${ev.error.colno}: ${ev.error.message}`;
        });
    }

    // Helper to resize the monaco editor
    resizeEditor()
    {
        if (!this.editor)
            return;
        this.editor.layout();
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

    // Handle notification that user edited the code
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
            appState.script = this.editor.getValue();
            this.#updating = false;

        }, 500);

    }

    static template = {
        _: "div",
        id: "editor",
        $: [
            {
                _: "div",
                class: "editorContainer",
                bind: "editorContainer",
            },
            {
                _: "div",
                class: "error",
                display: c => !!c.error,
                text: c => c.error,
            },
        ]
    }
}


Style.declare(`

#editor
{
    position: relative;
    width: 50%;

    .editorContainer
    {
        width: 100%;
        height: 100%;
    }

    .error
    {

        position: absolute;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        padding: 0.5rem;
        background-color: rgb(from var(--danger-color) r g b / 10%);
        border: 1px solid var(--danger-color);
        border-radius: .3rem;
        z-index: 100;
    }
}
`);