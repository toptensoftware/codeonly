import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CodeBuilder } from "./CodeBuilder.js";

let helpers = {
    setNodeText(node, text)
    {
        if (text instanceof HtmlString)
            node.innerHTML = text.html;
        else
            node.innerText = text;
    },
    setNodeClass(node, cls, set)
    {
        if (set)
            node.classList.add(cls);
        else
            node.classList.remove(cls);
    },
    insertFragment(placeholder, fragmentNodes)
    {
        // Capture the parent
        let parent = placeholder[0].parentNode;

        // Insert nodes before the place holder
        for (let i=0; i<fragmentNodes.length-1; i++)
        {
            parent.insertBefore(fragmentNodes[i], placeholder[0]);
        }

        // Replace the place holder with the last node
        placeholder[0].replaceWith(fragmentNodes[fragmentNodes.length - 1]);
    },
    removeFragment(fragmentNodes, placeholder)
    {
        // Capture the parent
        let parentNode = fragmentNodes[0].parentNode;

        // Insert the place holder
        fragmentNodes[0].replaceWith(placeholder[0]);

        // Remove the other fragment nodes
        for (let i=1; i<fragmentNodes.length; i++)
        {
            parentNode.removeChild(fragmentNodes[i]);
        }
    }
}


export function compileTemplateCode(rootTemplate)
{
    let mainCode = CodeBuilder()
    let updateCode = CodeBuilder();
    let nodeId = 1;
    let callbacks = [];
    let fragmentNodes = new Set();

    // Render the main code block
    compileNode(rootTemplate, "rootNode");

    // Append the update function
    mainCode.appendLine(`function update()`);
    mainCode.braced(() => mainCode.append(updateCode));

    // Return the root node and update method
    mainCode.appendLine(`return { rootNode, update };`);

    // Create the prolog
    let prolog = `let rootNode`;
    for (let i=1; i<nodeId; i++)
    {
        prolog += `, n${i}`;
    }
    prolog += ";";

    let finalCode = CodeBuilder();
    finalCode.append(prolog);
    finalCode.append(mainCode);

    return { 
        code: finalCode.toString(), 
        ctx: {
            callbacks,
        }
    }

    function format_dynamic(value, formatter)
    {
        if (value instanceof Function)
        {
            let codeBlock = CodeBuilder();
    
            formatter(codeBlock, `ctx.callbacks[${callbacks.length}].call(ctx.model)`);
    
            mainCode.append(codeBlock);
            updateCode.append(codeBlock);
            callbacks.push(value);
        }
        else
        {
            formatter(mainCode, JSON.stringify(value));
        }
    }

    function compileNode(template, nodeVar)
    {
        // Normal text?
        if (typeof(template) === 'string')
        {
            mainCode.appendLine(`${nodeVar} = document.createTextNode(${JSON.stringify(template)});`);
            return nodeVar;
        }

        // HTML Text?
        if (template instanceof HtmlString)
        {
            mainCode.appendLine(`${nodeVar} = document.createElement("SPAN");`);
            mainCode.appendLine(`${nodeVar}.innerHTML = ${JSON.stringify(template.html)};`);
            return nodeVar;
        }

        // Function call back text?
        if (template instanceof Function)
        {
            mainCode.appendLine(`${nodeVar} = document.createElement("SPAN");`);
            format_dynamic(template, (codeBlock, valueExpr) => {
                codeBlock.appendLine(`helpers.setNodeText(${nodeVar}, ${valueExpr});`);
            });
            return nodeVar;
        }

        if (template.type)
        {
            // Create the element
            mainCode.appendLine(`${nodeVar} = document.createElement(${JSON.stringify(template.type)});`);

            // ID
            if (template.id)
            {
                format_dynamic(template.class, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${nodeVar}.setAttribute("id", ${valueExpr});`);
                });
            }

            // Class
            if (template.class)
            {
                format_dynamic(template.class, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${nodeVar}.setAttribute("class", ${valueExpr});`);
                });
            }

            // Style
            if (template.style)
            {
                format_dynamic(template.style, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${nodeVar}.setAttribute("style", ${valueExpr});`);
                });
            }

            // Attributes
            for (let attr of Object.keys(template).filter(x => x.startsWith("attr_")))
            {
                let attrName = camel_to_dash(attr.substring(5));

                format_dynamic(template[attr], (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${nodeVar}.setAttribute(${JSON.stringify(attrName)}, ${valueExpr});`);
                });
            }

            // Set inner text
            if (template.text)
            {
                if (template.text instanceof Function)
                {
                    format_dynamic(template.text, (codeBlock, valueExpr) => {
                        codeBlock.appendLine(`helpers.setNodeText(${nodeVar}, ${valueExpr});`);
                    });
                }
                else if (template.text instanceof HtmlString)
                {
                    mainCode.appendLine(`${nodeVar}.innerHTML = ${JSON.stringify(template.text.html)};`);
                }
                if (typeof(template.text) === 'string')
                {
                    mainCode.appendLine(`${nodeVar}.innerText = ${JSON.stringify(template.text)};`);
                }
            }

            // Boolean classes
            for (let cls of Object.keys(template).filter(x => x.startsWith("class_")))
            {
                let className = camel_to_dash(cls.substring(6));

                format_dynamic(template[cls], (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`helpers.setNodeClass(${nodeVar}, ${JSON.stringify(className)}, ${valueExpr});`);
                });
            }
        }
        else
        {
            // Create a fragment
            mainCode.appendLine(`${nodeVar} = [];`);
            fragmentNodes.add(nodeVar);
        }

        if (template.childNodes)
        {
            // Compile child nodes
            let childNodeNames = [];
            for (let i=0; i<template.childNodes.length; i++)
            {
                childNodeNames.push(`n${nodeId++}`);
            }
            for (let i=0; i<template.childNodes.length; i++)
            {
                // Get the child node template
                let childNode = template.childNodes[i];
                let nn = childNodeNames[i];

                // Is it a conditional node?
                if (childNode.condition !== undefined)
                {
                    if (childNode.condition instanceof Function)
                    {
                        // Dynamic conditional...
                        compileConditionalNode(childNode, nn);
                        continue;
                    }
                    else
                    {
                        // Static conditional, either include it or not?
                        if (!childNode.condition)
                        {
                            if (fragmentNodes.has(nn))
                                mainCode.appendLine(`${nn} = [ document.createComment(' omitted by condition ') ];`);
                            else
                                mainCode.appendLine(`${nn} = document.createComment(' omitted by condition ');`);
                            continue;
                        }
                    }
                }

                // Regular node
                compileNode(childNode, nn);
            }

            // Add to this node
            if (childNodeNames.length)
            {
                let op = fragmentNodes.has(nodeVar) ? "push" : "append";
                mainCode.appendLine(`${nodeVar}.${op}(${childNodeNames.map(x => fragmentNodes.has(x) ? `...${x}` : x).join(", ")});`);
            }
        }

        return nodeVar;
    }

    function compileConditionalNode(childNode, nn)
    {
        let first_sub_node_id = nodeId;
        let callback_index = callbacks.length;
        callbacks.push(childNode.condition);

        // Before generating the node, generate the update code
        updateCode.appendLine(`if (${nn}_included != ctx.callbacks[${callback_index}].call(ctx.model))`)
        updateCode.appendLine(`  ((${nn}_included = !${nn}_included) ? attach_${nn} : detach_${nn})();`);
        updateCode.appendLine(`if (${nn}_included) {`);
        updateCode.indent();

        // Generate function to create the node
        mainCode.appendLine(`function create_${nn}() {`);
        mainCode.indent();
        compileNode(childNode, nn);
        mainCode.unindent();
        mainCode.appendLine(`}`);
        let last_sub_node_id = nodeId;

        // Generate function to create and attach the node
        mainCode.appendLine(`function attach_${nn}() {`);
        mainCode.indent();
        mainCode.appendLine(`let save = ${nn};`);
        mainCode.appendLine(`create_${nn}();`);
        if (fragmentNodes.has(nn))
            mainCode.appendLine(`helpers.insertFragment(save, ${nn});`);
        else
            mainCode.appendLine(`save.replaceWith(${nn});`);
        mainCode.unindent();
        mainCode.appendLine(`}`);

        // Generate function to detach the node
        mainCode.appendLine(`function detach_${nn}() {`);
        mainCode.indent();
        if (fragmentNodes.has(nn))
        {
            mainCode.appendLine(`let replacement = [ document.createComment(" omitted by condition ") ];`);
            mainCode.appendLine(`helpers.removeFragment(${nn}, replacement);`);
        }
        else
        {
            mainCode.appendLine(`let replacement = document.createComment(" omitted by condition ");`);
            mainCode.appendLine(`${nn}.replaceWith(replacement)`);
        }
        mainCode.appendLine(`${nn} = replacement;`);
        let clear = "";
        for (let i=first_sub_node_id; i < last_sub_node_id; i++)
        {
            clear += `n${i} = `;
        }
        if (clear.length)
            mainCode.appendLine(`${clear}null;`);
        mainCode.unindent();
        mainCode.appendLine(`}`);

        // Generate code to create initial
        mainCode.appendLine(`let ${nn}_included = ctx.callbacks[${callback_index}].call(ctx.model);`);
        mainCode.appendLine(`if (${nn}_included)`);
        mainCode.appendLine(`  create_${nn}();`);
        mainCode.appendLine(`else`);
        if (fragmentNodes.has(nn))
            mainCode.appendLine(`  ${nn} = [ document.createComment(' omitted by condition ') ];`);
        else
            mainCode.appendLine(`  ${nn} = document.createComment(' omitted by condition ');`);

        updateCode.unindent();
        updateCode.appendLine(`}`);

    }

}



export function compileTemplate(rootTemplate)
{
    let code = compileTemplateCode(rootTemplate);

    let templateFunction = new Function("ctx", "helpers", "model", code.code);

    return function (model)
    {
        return templateFunction(code.ctx, helpers, model);
    }
}