import { compress, decompress, bufferToBase64, base64ToBuffer } from "./Utils.js";

let hello_world = `class Main extends Component
{
    static template = {
        type: "DIV",
        text: "Hello World from CodeOnly!",
    }
}`;

class AppState extends EventTarget
{
    constructor()
    {
        super();

        // Display errors from iFrame preview
        window.addEventListener("message", evIn => {
            if (evIn.data.action == "error")
            {
                let ev = new Event("scriptError");
                ev.error = evIn.data.error;
                this.dispatchEvent(ev);
            }
        });

        // On hash change, reload editor with new script
        window.addEventListener("hashchange", ev => {
            this.loadFromHash();
        });

        // Load initial script
        this.loadFromHash();
    }

    // Default "Hello World" script
    #script = hello_world;

    // Script property
    get script()
    {
        return this.#script;
    }
    set script(value)
    {
        // Ignore if redundant
        if (this.#script == value)
            return;
        this.#script = value;
        this.dispatchEvent(new Event("scriptChanged"));
    }

    // Get the current script as a data link
    async getDataLink()
    {
        return bufferToBase64(await compress(this.script));
    }

    // Restore the script from a data link
    async restoreDataLink(value)
    {
        this.script = await decompress(await base64ToBuffer(value));
    }

    // Called from Header "Save Link" button
    async onSaveLink()
    {
        window.location.hash = await appState.getDataLink();
    }

    // Load script from current hash
    async loadFromHash()
    {
        if (window.location.hash.length > 1)
            this.restoreDataLink(window.location.hash.substring(1));
    }

}

// Export singleton instance
export let appState = new AppState();

