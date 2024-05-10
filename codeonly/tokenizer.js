// HTML tokenizer
export function tokenizer(str)
{
    let pos = 0;
    let end = str.length;
    let intag = false;

    return function nextToken(attributeValue)
    {
        if (pos >= end)
            return '\0';


        if (!intag && char() == '<')
            {
            // Comment?
            if (char(1) == '!' && char(2) == '-' && char(3) == '-')
            {
                pos += 4;
                let start = pos;
                while (pos < end && !(char() == '-' && char(1) == '-' && char(2) == '>'))
                    pos++;
                let comment = str.substring(start, pos);
                if (pos < end)
                    pos+=3;
                return { comment };
            }
            
            intag = true;
            if (char(1) == '/')
            {
                pos += 2;
                return "</";
            }
        }
            
        if (intag)
        {
            // Skip whitespace
            while (is_whitespace(char()))
                pos++;

            // Quoted string
            if (char() == '\"' || char() == '\'')
            {
                let term = char();
                pos++;
                let start = pos;
                while (pos < end && str[pos] != term)
                    pos++;
                let val = str.substring(start, pos);
                if (str[pos] == term)
                    pos++;
                return { string: val }
            }

            // Unquoted attribute value
            if (attributeValue && is_attribute_value_char(char()))
            {
                let start = pos;
                pos++;
                while (is_attribute_value_char(char()))
                    pos++;
                return { string: str.substring(start, pos) }
            }

            // Identifier
            if (is_identifier_leadchar(char()))
            {
                let start = pos;
                pos++;
                while (is_identifier_char(char()))
                    pos++;
                return { identifier: str.substring(start, pos) };
            }

            switch (char())
            {
                case '/':
                    if (char(1) == '>')
                    {
                        pos += 2;
                        intag = false;
                        return '/>';
                    }
                    else
                    {
                        pos++;
                        return '/';
                    }
                
                case '>':
                    intag = false;
                    break;
            }

            return str[pos++];
        }
        else
        {
            let start = pos;
            while (pos < end && str[pos] != '<')
                pos++;

            return { text: str.substring(start, pos) };
        }
    }

    function char(offset)
    {
        if (!offset)
            offset = 0;
        if (pos + offset >= 0 && pos + offset < end)
            return str[pos + offset];
        return '\0';
    }

    function is_whitespace(char)
    {
        return char == ' ' || char == '\t' || char == '\r' || char == '\n' || char == '\t';
    }

    function is_identifier_leadchar(char)
    {
        return char == ':' || char == '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
    }
    
    function is_identifier_char(char)
    {
        return is_identifier_leadchar(char) || is_digit(char) || char == '.' || char == '-';
    }

    function is_attribute_value_char(char)
    {
        return !(is_whitespace(char) || char == '\"' || char == '\'' || char == '=' || char == '<' || char == '>' || char == '`' || char == '/')
    }

    function is_digit(char)
    {
        return char >= '0' && char <= '9';
    }
}

