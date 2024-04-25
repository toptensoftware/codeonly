// Convert a camelCaseName to a dashed-name
export function camel_to_dash(name)
{
    return name.replace(/[A-Z]/g, x => `-${x.toLowerCase()}`);
}


export function escapeJavascriptString(str)
{
    let result = "\"";

    for (let i=0; i<str.length; i++)
    {
        let char = str[i];
        switch (char)
        {
            case '\r': result += "\\r"; break;
            case '\n': result += "\\n"; break;
            case '\t': result += "\\t"; break;
            case '\0': result += "\\0"; break;
            case '\\': result += "\\\\"; break;
            case '\"': result += "\\\""; break;
            case '\'': result += "\\'"; break;
            default:
                result += char;
        }
    }

    result += "\"";
    return result;
}
