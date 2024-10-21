import { Node } from "./Node.js";

export class CharacterData extends Node
{
    constructor(document, data)
    {
        super(document)
        this.#data = data;
    }

    #data;
    get data() { return this.#data; }
    get length() { return this.#data.length; }
    get nodeValue() { return this.#data; }
    set nodeValue(value) { this.#data = value; }
}