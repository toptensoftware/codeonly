export function htmlEncode(str)
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
