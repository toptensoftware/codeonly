import { tokenizer } from "./tokenizer.js";

// Mini parser converts HTML to an array of nodes
// (lots of limitations, good enough for mocking)
export function parseHtml(document, str)
{
    let tokens = tokenizer(str);
    let token;

    function nextToken()
    {
        return token = tokens(...arguments);
    }

    nextToken();

    let finalNodes = parseNodes();

    if (token != '\0')
        throw new Error("syntax error: expected eof");

    return finalNodes;

    function parseNodes()
    {
        let nodes = [];
        while (token != '\0'  && token != '</')
        {
            // Text?
            if (token.text)
            {
                nodes.push(document.createTextNode(token.text));
                nextToken();
                continue;
            }

            // Comment?
            if (token.comment)
            {
                nodes.push(document.createComment(token.comment));
                nextToken();
                continue;
            }

            // Tag
            if (token == '<')
            {
                // Skip it
                nextToken();

                // Must be a tag identifier
                if (!token.identifier)
                {
                    throw new Error("syntax error: expected identifier after '<'");
                }

                let node = document.createElement(token.identifier);
                nodes.push(node);

                // Parse attributes
                while (token != '\0' && token != '>' && token != '/>')
                {
                    // Get attribute name, quit if tag closed
                    let attribName = nextToken(true);
                    if (attribName.string === undefined)
                        break;

                    // Store just the name
                    attribName = attribName.string;
                    let attribValue = attribName;

                    // Assigned value?
                    if (nextToken() == '=')
                    {
                        let val = nextToken(true);
                        if (val.string === undefined)
                            throw new Error("syntax error, expected value after '='");
                        attribValue = val.string;
                        nextToken();
                    }

                    // Set attribute value
                    node.setAttribute(attribName, attribValue);
                }

                // Self closing tag?
                if (token == '/>')
                {
                    nextToken();
                    continue;
                }

                if (token != '>')
                {
                    throw new Error("syntax error: expected '>' || '/>'");
                }
                nextToken();

                // Parse child nodes
                node.append(...parseNodes());

                if (token == '</')
                {
                    nextToken();
                    if (token.identifier != node.nodeName)
                        throw new Error("mismatched tags");
                    nextToken();
                    if (token != '>')
                        throw new Error("expected '>' for closing tag");
                    nextToken();
                }
            }
        }

        return nodes;
    }
}
