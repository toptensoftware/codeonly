import { HtmlString } from "./HtmlString.js";

export class Html
{
    static h(level, text)
    {
        return {
            type: `h${level}`,
            text: text,
        }
    }
    
    static p(text)
    {
        return {
            type: `p`,
            text: text,
        }
    }

    static a(href, text)
    {
        return {
            type: "a",
            attr_href: href,
            text: text,
        }        
    }

    static raw(text)
    {
        return new HtmlString(text);
    }

    static encode(str)
    {
        if (str === null || str === undefined)
            return "";
        return (""+str).replace(/["'&<>]/g, function(x) {
            switch (x) 
            {
            case '\"': return '&quot;';
            case '&': return '&amp;';
            case '\'':return '&#39;';
            case '<': return '&lt;';
            case '>': return'&gt;';
            }
        });
    }


}