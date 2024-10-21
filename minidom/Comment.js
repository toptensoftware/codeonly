import { CharacterData } from "./CharacterData.js";

export class Comment extends CharacterData
{
    constructor(document, data)
    {
        super(document, data);
    }

    get nodeType() { return 8; }
    get nodeName() { return "#comment"; }

    cloneNode(deep) 
    {
        return new Comment(this.document, this.data); 
    }

    get html()
    {
        return `<!--${this.data}-->`;
    }
}