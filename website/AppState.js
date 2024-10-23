class AppState extends EventTarget
{
    #document = null;

    get document() { return this.#document };
    set document(value)
    {
        this.#document = value;
        this.dispatchEvent(new Event("documentChanged"));
    }
}

export let appState = new AppState();