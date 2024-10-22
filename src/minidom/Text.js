import { CharacterData } from "./CharacterData.js";

export class Text extends CharacterData
{
    constructor(document, data)
    {
        super(document, data);
    }

    get nodeType() { return 3; }
    get nodeName() { return "#text"; }
    
    cloneNode(deep) 
    {
        return new Text(this.document, this.data); 
    }

    get html()
    {
        return this.data;
    }
}