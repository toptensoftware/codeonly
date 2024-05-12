
// Converts a URL pattern string to a regex
export function urlPattern(pattern)
{
    let rx = "^";
    let len = pattern.length;

    let allowTrailingSlash;
    for (let i=0; i<len; i++)
    {
        allowTrailingSlash = true;
        let ch = pattern[i];
        if (ch == '?')
        {
            rx += "[^\\/]";
        }
        else if (ch == '*')
        {
            rx += "[^\\/]+";
        }
        else if (ch == ':')
        {
            // :id
            i++;
            let start = i;
            while (i < len && is_identifier_char(pattern[i]))
                i++;
            let id = pattern.substring(start, i);
            if (id.length == 0)
                throw new Error("syntax error in url pattern: expected id after ':'");
            
            // RX pattern suffix?
            let idrx = "[^\\/]+";
            if (pattern[i] == '(')
            {
                i++;
                start = i;
                let depth = 0;
                while (i < len)
                {
                    if (pattern[i] == '(')
                        depth++;
                    else if (pattern[i] == ')')
                    {
                        if (depth == 0)
                            break;
                        else
                            depth--;
                    }
                    i++;
                }
                if (i >= len)
                    throw new Error("syntax error in url pattern: expected ')'");

                idrx = pattern.substring(start, i);
                i++;
            }

            // Repeat suffix?
            if (i < len && (pattern[i] == '*') || pattern[i] == '+')
            {
                let repeat = pattern[i];
                i++;
                /*
                if (start < 2 || pattern[start - 2] != '/')
                    throw new Error(`'${repeat}' must follow '/'`);
                if (i < len && pattern[i] != '/')
                    throw new Error(`'${repeat}' must be at end of pattern or before '/'`);
                */

                if (pattern[i] == '/')
                {
                    rx += `(?<${id}>(?:${idrx}\\/)${repeat})`;
                    i++
                }
                else if (repeat == '*')
                {
                    rx += `(?<${id}>(?:${idrx}\\/)*(?:${idrx})?\\/?)`;
                }
                else
                {
                    rx += `(?<${id}>(?:${idrx}\\/)*(?:${idrx})\\/?)`;
                }
                allowTrailingSlash = false;
            }
            else
            {
                rx += `(?<${id}>${idrx})`;
            }

            i--;
        }
        else if (ch == '/')
        {
            // Trailing slash is optional
            rx += '\\' + ch;
            if (i == pattern.length - 1)
            {
                rx += '?';
            }
        }
        else if (".$^{}[]()|*+?\\/".indexOf(ch) >= 0)
        {
            rx += '\\' + ch;
            allowTrailingSlash = ch != '/';
        }
        else
        {
            rx += ch;
        }
    }

    if (allowTrailingSlash)
        rx += "\\/?";

    rx += "$";

    return rx;

    function is_identifier_char(ch)
    {
        return (ch >= 'a' && ch <= 'z') || (ch >='A' && ch <= 'Z') 
            || (ch >= '0' && ch <= '9') || ch == '_' || ch == '$';
    }
}