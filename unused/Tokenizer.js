import { html_entities } from "./htmlEntities.js";

function is_whitespace(char)
{
    return char == ' ' || char == '\t' || char == '\r' || char == '\n' || char == '\t';
}

function is_identifier_leadchar(char)
{
    return char == '$' || char == '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

function is_identifier_char(char)
{
    return is_identifier_leadchar(char) || (char >= '0' && char <= '9');
}

function is_digit(char)
{
    return char >= '0' && char <= '9';
}

function is_hex_digit(char)
{
    return (char >= '0' && char <= '9') || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
}

class Tokenizer
{
    constructor(str)
    {
        this.str = str;
        this.pos = 0;
        this.textMode = true;
    }

    nextToken()
    {
        if (this.textMode)
        {
            if (this.char == '<')
            {
                this.textMode = false;
                this.nextChar();
                if (this.char == '/')
                {
                    this.nextChar();
                    return { kind: '</' };
                }
                else
                    return { kind: '<' };
            }

            if (this.char == '\0')
                return null;  

            let value = "";
            while (this.char != '\0' && this.char != '<')
            {
                switch (this.char)
                {
                    case '&':
                        value += this.parseHtmlEntity();
                        break;

                    default:
                        value += this.char;
                        this.nextChar();
                }
            }

            return { kind: "text", value}

        }
        else
        {
            // Skip whitespace
            while (is_whitespace(this.char))
                this.nextChar();

            // Identifier
            if (is_identifier_leadchar(this.char))
            {
                let value = this.char;
                this.nextChar();
                while (is_identifier_char(this.char))
                {
                    value += this.char;
                    this.nextChar();
                }
                return { kind: "identifier", value }
            }        

            // Other characters
            switch (this.char)
            {
                case '\0':
                    return null;

                case '>':
                    this.nextChar();
                    this.textMode = true;
                    return { kind: ">" };

                case '/':
                    this.nextChar();
                    if (this.char == '>')
                    {
                        this.textMode = true;
                        this.nextChar();
                        return { kind: "/>" }
                    }
                    else
                        throw new Error("syntax error");

                case '=':
                    this.nextChar();
                    return { kind: '=' };

                case '\"':
                {
                    this.nextChar();
                    let value = "";
                    while (this.char != '\0' && this.char != '\"')
                    {
                        switch (this.char)
                        {
                            case '&':
                                value += this.parseHtmlEntity();
                                break;

                            default:
                                value += this.char;
                                this.nextChar();
                        }
                    }
                    if (this.char == '\"')
                        this.nextChar();

                    return { kind: "string", value }
                }

                case '(':
                {
                    this.nextChar()
                    let value = "";
                    let depth = 0;
                    while (this.char != '\0')
                    {
                        if (this.char == ')')
                        {
                            if (depth == 0)
                                break;
                            else
                                depth--;
                        }
                        else if (this.char =='(')
                            depth++;
                        value += this.char;
                        this.nextChar();
                    }
                    if (this.char == '\0')
                        throw new Error("syntax error: non-terminated expression");
                    this.nextChar();
                    return { kind: "expression", value }
                }

                default:
                    throw new Error(`syntax error: unexpected character '${this.char}'`)
            }
        }
    }

    parseHtmlEntity()
    {
        let result;
        this.nextChar();
        let start = this.pos;
        if (this.char == '#')
        {
            this.nextChar();

            if (this.char == 'x')
            {
                // Hex entity
                this.nextChar();

                while (is_hex_digit(this.char))
                    this.nextChar();
                
                let entity = this.str.substring(start + 2, this.pos);
                result = String.fromCharCode(parseInt(entity, 16));
            }
            else
            {
                // Decimal entity 
                while (is_digit(this.char))
                    this.nextChar();
                
                let entity = this.str.substring(start + 1, this.pos);
                result = String.fromCharCode(parseInt(entity));
            }
        }
        else
        {
            // Named entity
            while (is_identifier_leadchar(this.char))
                this.nextChar();

            let entity = this.str.substring(start, this.pos);
            result = html_entities[entity];
            if (!result)
                result = "&" + entity + ";";
        }
        if (this.char != ';')
            throw new Error("expected semicolon after HTML entity");
        this.nextChar();

        return result;        
    }

    get char()
    {
        if (this.pos >= this.str.length)
            return '\0';
        return this.str[this.pos];
    }

    nextChar()
    {
        if (this.pos < this.str.length)
            this.pos++;
    }
}

let token;
let tokenizer = new Tokenizer(`<b>before</b> &copy; <div attr="Hello World" on_click=(this.onClick()) /> after`);
while (token = tokenizer.nextToken())
{
    console.log(token);
}
