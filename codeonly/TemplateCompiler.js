import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { helpers } from "./TemplateHelpers.js";

export function compileTemplateCode(rootTemplate)
{
    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Every callback value, will be stored here during compilation
    // These need to be passed back to the template runtime function
    // when the template is instantiated via ctx.callbacks
    let callbacks = [];

    // The names of any nodes that are fragments (as opposed to single nodes)
    let fragmentNodes = new Set();

    // Compile the template
    let rootClosure = compileNodeToClosure(rootTemplate);

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        ctx: {
            callbacks,
        }
    }

    function compileNodeToClosure(template)
    {
        // Setup closure
        let closure = new ClosureBuilder();
        let rootNodeName = `n${nodeId++}`;
        closure.addLocal(rootNodeName);
        closure.attach = closure.addFunction("attach").code;
        closure.update = closure.addFunction("update").code;
        closure.detach = closure.addFunction("detach").code;
        closure.destroy = closure.addFunction("destroy").code;

        // Render code
        compileNode(closure, template, rootNodeName);

        // Return interface to the closure
        closure.code.appendLine(`return { rootNode: ${rootNodeName}, attach, update, detach, destroy };`);

        return closure;
    }

    // Recursively compile a node from a template
    function compileNode(closure, template, nodeVar)
    {
        // Normal text?
        if (typeof(template) === 'string')
        {
            closure.code.appendLine(`${nodeVar} = document.createTextNode(${JSON.stringify(template)});`);
            return;
        }

        // HTML Text?
        if (template instanceof HtmlString)
        {
            closure.code.appendLine(`${nodeVar} = document.createElement("SPAN");`);
            closure.code.appendLine(`${nodeVar}.innerHTML = ${JSON.stringify(template.html)};`);
            return;
        }

        // Dynamic text?
        if (template instanceof Function)
        {
            closure.code.appendLine(`${nodeVar} = helpers.createTextNode(ctx.callbacks[${callbacks.length}].call(ctx.model));`);
            closure.update.appendLine(`${nodeVar} = helpers.setNodeText(${nodeVar}, ctx.callbacks[${callbacks.length}].call(ctx.model));`);
            callbacks.push(template);
            return;
        }

        // Element node?
        if (template.type)
        {
            // Create the element
            closure.code.appendLine(`${nodeVar} = document.createElement(${JSON.stringify(template.type)});`);

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

            // Boolean classes
            for (let cls of Object.keys(template).filter(x => x.startsWith("class_")))
            {
                let className = camel_to_dash(cls.substring(6));

                format_dynamic(template[cls], (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`helpers.setNodeClass(${nodeVar}, ${JSON.stringify(className)}, ${valueExpr});`);
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
                        codeBlock.appendLine(`helpers.setElementText(${nodeVar}, ${valueExpr});`);
                    });
                }
                else if (template.text instanceof HtmlString)
                {
                    closure.code.appendLine(`${nodeVar}.innerHTML = ${JSON.stringify(template.text.html)};`);
                }
                if (typeof(template.text) === 'string')
                {
                    closure.code.appendLine(`${nodeVar}.innerText = ${JSON.stringify(template.text)};`);
                }
            }
        }
        else
        {
            // It's a fragment node, render the nodes and store them in an array
            closure.code.appendLine(`${nodeVar} = [];`);

            // Remember this node is a fragment for special handling where required
            // (ie: special because the node variable is an array of domm nodes, not
            //  a single dom node)
            fragmentNodes.add(nodeVar);
        }

        // Child nodes?
        if (template.childNodes)
        {
            // Allocate names for all the child nodes
            let childNodeNames = [];
            for (let i=0; i<template.childNodes.length; i++)
            {
                let varName = `n${nodeId++}`;
                closure.addLocal(varName);
                childNodeNames.push(varName);
            }

            // Create the child nodes
            for (let i=0; i<template.childNodes.length; i++)
            {
                // Get the child node template
                let childNode = template.childNodes[i];
                let nn = childNodeNames[i];

                // Is it a foreach node?
                if (childNode.foreach !== undefined)
                {
                    compileForEachNode(childNode, nn);
                    continue;
                }

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
                                closure.code.appendLine(`${nn} = [ document.createComment(' omitted by condition ') ];`);
                            else
                                closure.code.appendLine(`${nn} = document.createComment(' omitted by condition ');`);
                            continue;
                        }
                    }
                }

                // Regular node (or static true condition)
                compileNode(childNode, nn);
            }

            // Add all the child nodes to this node
            if (childNodeNames.length)
            {
                let op = fragmentNodes.has(nodeVar) ? "push" : "append";
                closure.code.appendLine(`${nodeVar}.${op}(${childNodeNames.map(x => fragmentNodes.has(x) ? `...${x}` : x).join(", ")});`);
            }
        }

        // Helper to format a dynamic value on a node (ie: a callback)
        function format_dynamic(value, formatter)
        {
            if (value instanceof Function)
            {
                // It's a dynamic value.  Render the code to update the
                // value into a code block
                let codeBlock = CodeBuilder();
        
                // Render the update code
                formatter(codeBlock, `ctx.callbacks[${callbacks.length}].call(ctx.model)`);

                // Append the code to both the main code block (to set initial value) and to 
                // the update function.
                closure.code.append(codeBlock);
                closure.update.append(codeBlock);

                // Store the callback in the context callback array
                callbacks.push(value);
            }
            else
            {
                // Static value, just output it directly
                formatter(closure.code, JSON.stringify(value));
            }
        }


        function compileConditionalNode(childNode, nn)
        {
            let first_sub_node_id = nodeId;
            let callback_index = callbacks.length;
            callbacks.push(childNode.condition);

            // Before generating the node, generate the update code
            closure.update.appendLine(`if (${nn}_included != ctx.callbacks[${callback_index}].call(ctx.model))`)
            closure.update.appendLine(`  ((${nn}_included = !${nn}_included) ? attach_${nn} : detach_${nn})();`);
            closure.update.appendLine(`if (${nn}_included) {`);
            closure.update.indent();

            // Generate function to create the node
            closure.code.appendLine(`function create_${nn}() {`);
            closure.code.indent();
            compileNode(closure, childNode, nn);
            closure.code.unindent();
            closure.code.appendLine(`}`);
            let last_sub_node_id = nodeId;

            // Generate function to create and attach the node
            closure.code.appendLine(`function attach_${nn}() {`);
            closure.code.indent();
            closure.code.appendLine(`let save = ${nn};`);
            closure.code.appendLine(`create_${nn}();`);
            if (fragmentNodes.has(nn))
                closure.code.appendLine(`helpers.insertFragment(save, ${nn});`);
            else
                closure.code.appendLine(`save.replaceWith(${nn});`);
            closure.code.unindent();
            closure.code.appendLine(`}`);

            // Generate function to detach the node
            closure.code.appendLine(`function detach_${nn}() {`);
            closure.code.indent();
            if (fragmentNodes.has(nn))
            {
                closure.code.appendLine(`let replacement = [ document.createComment(" omitted by condition ") ];`);
                closure.code.appendLine(`helpers.removeFragment(${nn}, replacement);`);
            }
            else
            {
                closure.code.appendLine(`let replacement = document.createComment(" omitted by condition ");`);
                closure.code.appendLine(`${nn}.replaceWith(replacement)`);
            }
            closure.code.appendLine(`${nn} = replacement;`);
            let clear = "";
            for (let i=first_sub_node_id; i < last_sub_node_id; i++)
            {
                clear += `n${i} = `;
            }
            if (clear.length)
                closure.code.appendLine(`${clear}null;`);
            closure.code.unindent();
            closure.code.appendLine(`}`);

            // Generate code to create initial
            closure.addLocal(`${nn}_included`);
            closure.code.appendLine(`${nn}_included = ctx.callbacks[${callback_index}].call(ctx.model);`);
            closure.code.appendLine(`if (${nn}_included)`);
            closure.code.appendLine(`  create_${nn}();`);
            closure.code.appendLine(`else`);
            if (fragmentNodes.has(nn))
                closure.code.appendLine(`  ${nn} = [ document.createComment(' omitted by condition ') ];`);
            else
                closure.code.appendLine(`  ${nn} = document.createComment(' omitted by condition ');`);

            closure.update.unindent();
            closure.update.appendLine(`}`);

        }

    }

    function compileForEachNode(childNode, nn, varScope)
    {
    /*
        // Create a function to render the item
        closure.code.appendLine(`function create_${nn}_item(item)`)
        closure.code.appendLine(`{`);
        closure.code.indent();

        // Create a function to update the item and
        // temporarily replace the main closure.update target
        let updateItemCode = CodeBuilder();
        closure.update = updateItemCode;
        closure.update.appendLine(`function update_${nn}_item(item)`);
        closure.update.appendLine(`{`);
        closure.update.indent();

        // Render node
        compileNode(childNode, `${nn}`, 'item');

        closure.update.unindent();
        closure.update.appendLine(`}`);

        // Restore state
        closure.update = saveclosure.update;
        closure.code.unindent();
        closure.code.appendLine(`}`);

        // Add the update item function
        closure.code.append(updateItemCode);

        // Create the sentinal node
        closure.code.appendLine(`${nn} = document.createComment('foreach');`);
    */
    }


}



export function compileTemplate(rootTemplate)
{
    let code = compileTemplateCode(rootTemplate);
    console.log(code.code);

    let templateFunction = new Function("ctx", "helpers", "model", code.code);


    return function (model)
    {
        return templateFunction(code.ctx, helpers, model);
    }
}