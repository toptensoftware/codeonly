export function CodeBuilder()
{
    let lines = [];
    let indentStr = "";
    function append(...code)
    {
        for (let i=0; i<code.length; i++)
        {
            let part = code[i];
            if (part.lines)
            {
                // Appending another code builder
                lines.push(...part.lines.map(x => indentStr + x));
            }
            else if (Array.isArray(part))
            {
                lines.push(...part.filter(x => x != null).map(x => indentStr + x));
            }
            else
            {
                lines.push(...part.split("\n").map(x => indentStr + x));
            }
        }
    }
    function indent()
    {
        indentStr += "  ";
    }
    function unindent()
    {
        indentStr = indentStr.substring(2);
    }
    function toString()
    {
        return lines.join("\n") + "\n";
    }
    function braced(cb)
    {
        append("{");
        indent();
        cb(this);
        unindent();
        append("}");
    }

    function enterCollapsibleBlock(...header)
    {
        let cblock = {
            pos: this.lines.length,
        }
        this.append(header);
        cblock.headerLineCount = this.lines.length - cblock.pos;
        return cblock;
    }

    function leaveCollapsibleBlock(cblock, ...footer)
    {
        // Was anything output to the blocK
        if (this.lines.length == cblock.pos + cblock.headerLineCount)
        {
            // No, remove the headers
            this.lines.splice(cblock.pos, cblock.headerLineCount);
        }
        else
        {
            this.append(footer);
        }
    }

    return {
        append,
        enterCollapsibleBlock,
        leaveCollapsibleBlock,
        indent,
        unindent,
        braced,
        toString,
        lines,
        get isEmpty() { return lines.length == 0; },
    }
}
