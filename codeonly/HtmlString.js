export class HtmlString
{
    constructor(html)
    {
        this.html = html;
    }
}

export function html(html)
{
    return new HtmlString(html);
}
