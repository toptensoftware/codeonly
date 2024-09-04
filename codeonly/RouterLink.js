import { Component } from "./Component.js";
import { EmbedSlot } from "./EmbedSlot.js";

export class RouterLink extends Component
{
    #title;
    #href;

    constructor()
    {
        super();
    }

    get href() { return this.#href; }
    set href(value) { this.#href = value; this.invalidate() }
    get title() { return this.#title; }
    set title(value) { this.#title = value; this.invalidate() }

    get content() { return this.dom.content }

    on_click(ev)
    {
        alert("Oi!");
        ev.preventDefault();
        return false;
    }

    static template = {
        type: "a",
        attr_href: c => c.href,
        on_click: c => c.on_click(ev),
        $: {
            type: EmbedSlot,
            bind: "content",
            placeholder: c => c.title,
        }
    };

    static slots = [ "content" ];
}
