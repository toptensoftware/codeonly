
function is_whitespace(ch)
{
    return ch == '\r' || ch == '\n' || ch == ' ' || ch == '\t';
}

function is_letter(ch)
{
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

function is_identifier_lead_char(ch)
{
    return ch == '@' || ch == '$' || ch == '.' || ch == '#' || ch == '_' || ch == '-' || ch == '!' ||
        (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
}

function is_identifier_char(ch)
{
    return ch == '_' || ch == '-' || ch == '#' || ch == '.' || ch == '[' || ch == ']' || ch == '=' ||
        (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9');
}

function is_digit(ch)
{
    return ch >= '0' && ch <= '9';
}
function is_number_digit(ch)
{
    return (ch >= '0' && ch <= '9') || ch == '.';
}

function tokenize(str)
{
    let pos = 0;
    let len = str.length;
    let allowLineComments = true;

    return function()
    {
        let token = next();
        if (token == '(')
        {
            let start = pos - 1;
            let depth = 1;
            allowLineComments = false;
            while (token = next())
            {
                if (token == ')')
                {
                    depth--;
                    if (depth == 0)
                    {
                        allowLineComments = false;
                        return str.substring(start, pos);
                    }
                }
                if (token == '(')
                    depth++;
            }
            throw new Error("unterminated parens");
        }
        return token;
    }

    function next()
    {
        while (true)
        {
            // Whitespace
            while (is_whitespace(char()))
                pos++;

            // Comments
            if (allowLineComments && char() == '/' && char(1) == '/')
            {
                // C++ style comment
                pos+=2;
                while (pos < len && str[pos] != '\n' && str[pos] != '\r')
                    pos++;
                continue;
            }

            if (char() == '/' && char(1) == '*')
            {
                /* C style comment */
                pos+=2;
                while (!(char() == '*' && char(1) == '/'))
                    pos++;
                if (pos + 1 >= len)
                    throw new Error("unterminated comment");
                pos += 2;
                continue;
            }

            break;
        }

        // EOF?
        if (pos >= len)
            return null;

        // Number
        let ch = char();
        if (is_digit(ch) || 
            ((ch == '-' || ch == '+') && is_digit(char(1))))
        {
            let start = pos;
            pos++;
            while (is_number_digit(char()))
                pos++;
            if (char() == '%')
            {
                pos++;
            }
            else
            {
                while (is_letter(char()))
                    pos++;
            }
            return str.substring(start, pos);
        }

        // Identifier
        if (is_identifier_lead_char(char()))
        {
            let start = pos;
            pos++;
            while (is_identifier_char(char()))
                pos++;
            return str.substring(start, pos);
        }

        // String
        if (char() == '\'' || char() == '\"')
        {
            let start = pos;
            let quote = char();
            pos++;
            while (char() != quote)
            {
                if (char() == '\\')
                    pos++;
                pos++;
            }
            if (pos >= len)
                throw new Error("unterminated string");

            pos++;
            return str.substring(start, pos);
        }

        if (char() == '|' && char(1) == '|')
        {
            pos += 2;
            return "||";
        }


        return str[pos++];
    }

    function char(offset)
    {
        if (!offset)
            offset = 0;
        if (pos + offset >= len)
            return '\0';
        return str[pos + offset];
    }

}

function is_token_separator(ch)
{
    return ch == '(' || ch == ')' || ch == '\"' || ch == '\"' || ch == ';' || 
            ch == ':' || ch == '+' || ch == '>' || ch == '||' || ch == '~';
}

function is_math_operator(ch)
{
    return ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '&';
}

function append_token(str, token)
{
    if (str.length == 0)
        return token;

    if (token == ',')
        return str + ', ';
    
//    if (token == ':')
//        return str + ': ';

    if (token == ';')
        return str + ";\n";

    if (token == 'and' || token == 'or' || token == 'not' || token == 'only')
        token += ' ';
        
    if (is_whitespace(str[str.length-1]))
        return str + token;


    if (is_token_separator(str[str.length-1]) || is_token_separator(token[0]))
        return str + token;

    return str + ' ' + token;
}

function combine_selectors(a, b)
{
    let sep = ' ';
    if (b.startsWith('&'))
    {
        b = b.substring(1).trim();
        if (b.startsWith('.') || b.startsWith("#"))
        {
            sep = '';
        }
        else if (b.length >= 2 && b[0] == '|' && b[1] == '|')
        {
            sep = ' || ';
            b = b.substring(2);
        }
        else if (is_identifier_lead_char(b[0]))
        {
            sep = ' ';
        }
        else
        {
            sep = b[0];
            b = b.substring(1);
            if (sep == '+' || sep == '>' || sep == '~')
                sep = ' ' + sep + ' ';
        }
    }


    return `${a}${sep}${b}`;
}

export function processStyles(str)
{
    let out = '';

    // Read tokens
    let read_token = tokenize(str);
    let token;
    let pending = '';
    let pendingSelectors = [];
    let pendingSelectorBlocks = [];
    let openScopes = [];
    let indent = '';
    let isSelector = false;
    while (token = read_token())
    {
        if (token == '&')
        {
            isSelector = true;
        }
        
        if (token == ';')
        {
            addRule(pending);
            pending = "";
            isSelector = false;
            continue;
        }

        if (token == ',')
        {
            isSelector = true;
            pendingSelectors.push(pending);
            pending = "";
            continue;
        }

        if (token == ':' && !isSelector)
        {   
            if (pending == "")
            {
                isSelector = true;
                pending = append_token(pending, token);
                continue;
            }

            // Found a rule
            pending += ": ";
            token = read_token();
            while (token && token != ';' && token != '}')
            {
                pending = append_token(pending, token);
                token = read_token();
            }

            addRule(pending);
            pending = "";
            continue;
        }
        
        if (token == '{')
        {
            pendingSelectors.push(pending);
            enterScope(pendingSelectors);
            pendingSelectors = [];
            pending = "";
            isSelector = false;
            continue;
        }

        if (token == '}')
        {
            if (pendingSelectors.length > 0 || pending.length > 0)
            {
                throw new Error("Unexpected context before closing brace");
            }
            leaveScope();
            isSelector = false;
            continue;
        }

        pending = append_token(pending, token);
    }

    function addRule(rule)
    {
        // Get the current scope
        let scope = openScopes.length == 0 ? null : openScopes[openScopes.length-1];
        if (scope==null || !scope.isSelectorBlock)
        {
            out += `${indent}${rule};\n`;
            return;
        }

        // Just store in rule block for now
        scope.rules.push(rule);
    }

    function enterScope(selectors)
    {
        let currentScope = openScopes.length == 0 ? null : openScopes[openScopes.length-1];

        if (selectors.some(x => x[0] == '@'))
        {
            // Should never be multiple, but just in case
            let sel = selectors.join(", ");

            // AT rule block
            if (currentScope && currentScope.isSelectorBlock)
                throw new Error(`invalid '${sel}' in selector block`);

            // Open scope
            out += `${indent}${sel} {\n`;
            indent += "  ";
            openScopes.push({ isSelectorBlock: false });
            return;
        }

        // If nested selector block, combine selectors with outer
        if (currentScope && currentScope.isSelectorBlock)
        {
            let fullSelectors = [];
            for (let i=0; i<currentScope.selectors.length; i++)
            {
                for (let j=0; j<selectors.length; j++)
                {
                    fullSelectors.push(combine_selectors(currentScope.selectors[i], selectors[j]));
                }
            }
            selectors = fullSelectors;
        }

        // Create rule block
        openScopes.push({
            isSelectorBlock: true,
            selectors,
            rules: []
        });
    }


    function writePendingSelectorBlocks()
    {
        for (let block of pendingSelectorBlocks)
        {
            if (block.rules.length > 0)
            {
                out += block.selectors.map(x => `${indent}${x}`).join(", ");
                out += ` {\n`;
                for (let r of block.rules)
                {
                    out += `${indent}  ${r};\n`;
                }
                out += `${indent}}\n`;
            }
        }
        pendingSelectorBlocks = [];
    }

    function leaveScope()
    {
        if (openScopes.length == 0)
            throw new Error(`Unexpected '}}'`);

        let closingScope = openScopes.pop();

        if (closingScope.isSelectorBlock)
        {
            // Add this rule block to th
            pendingSelectorBlocks.unshift(closingScope);

            // Last selector block closed?
            if (openScopes.length == 0 || !openScopes[openScopes.length-1].isSelectorBlock)
            {
                // Write selector blocks
                writePendingSelectorBlocks();
            }
        }
        else
        {
            indent = indent.substring(2);
            out += `${indent}}\n`;
        }
    }

    return out;
}
