import { Component  } from "@toptensoftware/codeonly";

export class CodeEditor extends Component
{
    constructor()
    {
        super();
        this.init();

        // Load Monaco
        require(['vs/editor/editor.main'], () => {

            // Create editor
            this.#editor = monaco.editor.create(this.editorContainer, {
                value: this.#pendingValue,
                language: 'javascript',
                theme: 'vs-dark'
            });
            this.#pendingValue = null;

            // Watch for script changes
            this.#editor.getModel().onDidChangeContent((event) => {
                this.dispatchEvent(new Event("input"));
            });

            // Initial resize of editor
            this.resizeEditor();
        });

        // Watch for resizing and update editor size
        let ro = new ResizeObserver(() => {
            this.resizeEditor();
        });
        ro.observe(this.editorContainer);

    }

    // Helper to resize the monaco editor
    resizeEditor()
    {
        if (!this.#editor)
            return;
        this.#editor.layout();
    }

    #editor;
    #pendingValue = "";

    get editor()
    {
        return this.#editor;
    }

    get value()
    {
        if (this.#editor)
            return this.#editor.getValue();
        else
            return this.#pendingValue;
    }
    set value(value)
    {
        if (this.#editor)
            this.#editor.setValue(value);
        else
            this.#pendingValue = value;
    }

    static template = {
        type: "div",
        class: "editorContainer",
        style: "width: 100%; height: 100%;",
        bind: "editorContainer",
    };
}


