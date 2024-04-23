export class TextNode
{
    constructor(text)
    {
        if (typeof(text) === 'string')
        {
            this.node = document.createTextNode(text);
        }
        else if (text.nodeType == 3)
        {
            this.node = text;
        }
        else
        {
            throw new Error("Unsupported node type");
        }

        this.node.shadow = this;
    }
}

