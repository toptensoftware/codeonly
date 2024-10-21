import { HTMLElement } from "./HTMLElement.js";
import { Text } from "./Text.js";
import { Comment } from "./Comment.js";

export class Document
{
    constructor()
    {
    }

    createElement(tagName)
    {
        return new HTMLElement(this, tagName);
    }
    createTextNode(data)
    {
        return new Text(this, data);
    }
    createComment(data)
    {
        return new Comment(this, data);
    }
}


