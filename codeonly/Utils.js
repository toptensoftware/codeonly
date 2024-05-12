export function inplace_filter_array(arr, cb)
{
    for (let i=0; i<arr.length; i++)
    {
        if (!cb(arr[i], i))
        {
            arr.splice(i, 1);
            i--;
        }
    }
}

// Convert a camelCaseName to a dashed-name
export function camel_to_dash(name)
{
    return name.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);
}

// Check if a function is a constructor
export function is_constructor(x) 
{ 
    return x instanceof Function && !!x.prototype && !!x.prototype.constructor; 
}


/*
export function separate_array(array, selector)
{
    let extracted = [];
    for (let i=0; i<array.length; i++)
    {
        if (selector(array[i]))
        {
            extracted.push(array[i]);
            array.splice(i, 1);
            i--;
        }
    }
    return extracted;
}

// Returns an array of remaining ranges after subtracting a 
// set of sub-range
export function subtract_ranges(index, count, subtract)
{
    for (let s of subtract)
    {
        if (s.index < index || s.index + s.count > index + count)
            throw new Error(`subtracted range ${s.index} + ${s.count} is not within original range ${index} + ${count}`);
    }

    // Make sure ranges to be subtracted are sorted
    subtract.sort((a,b) => a.index - b.index);

    let pos = index;
    let subtractIndex = 0;
    let ranges = [];

    while (pos < index + count && subtractIndex < subtract.length)
    {
        let sub = subtract[subtractIndex];
        if (pos < sub.index)
        {
            ranges.push({ index: pos, count: sub.index - pos});
        }

        pos = sub.index + sub.count;
        subtractIndex++;
    }

    if (pos < index + count)
    {
        ranges.push({ index: pos, count: index + count - pos });
    }

    return ranges;
}


// Given a range from index to index + count, and
// an array of values to exclude, return a new set of ranges.
// exclude array will sorted upon return
export function split_range(index, count, exclude)
{
    exclude.sort();

    let pos = index;
    let excludeIndex = 0;
    let ranges = [];
    while (pos < index + count && excludeIndex < exclude.length)
    {
        if (pos < exclude[excludeIndex])
        {
            let to = Math.min(pos + count, exclude[excludeIndex]);
            ranges.push({ index: pos, count: to - pos});
            pos = to + 1;
            excludeIndex++;
            continue;
        }
        if (pos == exclude[excludeIndex])
        {
            pos++;
            excludeIndex++;
            continue;
        }

        pos++;
    }

    if (pos < index + count)
    {
        ranges.push({ index: pos, count: index + count - pos });
    }

    return ranges;
}

*/

// Converts a URL pattern string to a regex
export function urlPattern(pattern)
{
    let rx = "^";
    let len = pattern.length;

    for (let i=0; i<len; i++)
    {
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

            rx += `(?<${id}>${idrx})`;
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
        }
        else
        {
            rx += ch;
        }
    }

    if (!pattern.endsWith("/"))
        rx += "\\/?";

    rx += "$";

    return rx;

    function is_identifier_char(ch)
    {
        return (ch >= 'a' && ch <= 'z') || (ch >='A' && ch <= 'Z') 
            || (ch >= '0' && ch <= '9') || ch == '_' || ch == '$';
    }
}