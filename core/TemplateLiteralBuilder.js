import { htmlEncode } from "./htmlEncode.js";

export class TemplateLiteralBuilder
{
    #str = "`";

    text(text)
    {
        this.raw(htmlEncode(text));
    }

    raw(text)
    {
        this.#str += text.replace(/[\\`]/g, "\\$&");
    }

    expr(expr)
    {
        this.#str += "${" + expr + "}";
    }

    resolve()
    {
        let r = this.#str + "`";
        this.#str = "`"
        return r;
    }
}