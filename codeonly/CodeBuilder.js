export function CodeBuilder()
{
    let lines = [];
    let indentStr = "";
    function append(code)
    {
        if (code.lines)
        {
            // Appending another code builder
            lines.push(...code.lines.map(x => indentStr + x));
        }
        else if (Array.isArray(code.lines))
        {
            lines.push(...code.map(x => indentStr + x));
        }
        else
        {
            lines.push(...code.split("\n").map(x => indentStr + x));
        }
    }
    function appendLines(arr)
    {
        arr.forEach(x => { if (x) appendLine(x) });
    }
    function appendLine(str)
    {
        lines.push(...str.split("\n").map(x => indentStr + x));
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
        appendLine("{");
        indent();
        cb(this);
        unindent();
        appendLine("}");
    }

    function enterCollapsibleBlock(...header)
    {
        let cblock = {
            pos: this.lines.length,
        }
        this.appendLines(header);
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
            this.appendLines(footer);
        }
    }

    return {
        append,
        appendLines,
        appendLine,
        enterCollapsibleBlock,
        leaveCollapsibleBlock,
        indent,
        unindent,
        braced,
        toString,
        lines,
    }
}
