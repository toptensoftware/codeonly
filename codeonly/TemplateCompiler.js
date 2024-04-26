import { camel_to_dash } from "./Utils.js";
    import { HtmlString } from "./HtmlString.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { helpers } from "./TemplateHelpers.js";

class NodeInfo
{
    constructor(parent, name, template)
    {
        this.parent = parent;
        this.name =  name;
        this.template = template;
        this.childNodes = [];
        this.isFragment = false;
    }

    getClosureNodes(result)
    {
        for (let c of this.childNodes)
        {
            // Ignore item nodes
            if (c.foreach)
                continue;
            result.push(c);
            c.getClosureNodes(result);
        }
    }
}

export function compileTemplateCode(rootTemplate)
{
    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Every callback value, will be stored here during compilation
    // These need to be passed back to the template runtime function
    // when the template is instantiated via ctx.callbacks
    let callbacks = [];

    // Map of info about all nodes
    // NodeName => NodeInfo
    let nodeMap = new Map();

    // Create node info        
    let rootNodeInfo = new NodeInfo(null, `n${nodeId++}`, rootTemplate);
    nodeMap.set(rootNodeInfo.name, rootNodeInfo);
    
    let rootClosure = compileNodeToClosure(rootNodeInfo);

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        ctx: {
            callbacks,
        }
    }

    function compileNodeToClosure(ni)
    {
        // Setup closure
        let closure = new ClosureBuilder();
        closure.addLocal(ni.name);
        closure.attach = closure.addFunction("attach").code;
        closure.update = closure.addFunction("update").code;
        closure.detach = closure.addFunction("detach").code;
        closure.destroy = closure.addFunction("destroy").code;

        // Render code
        compileNode(closure, ni);

        // Return interface to the closure
        closure.code.appendLine(`return { rootNode: ${ni.name}, attach, update, detach, destroy };`);

        return closure;
    }

    // Recursively compile a node from a template
    function compileNode(closure, ni)
    {
        // Normal text?
        if (typeof(ni.template) === 'string')
        {
            closure.code.appendLine(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
            return;
        }

        // HTML Text?
        if (ni.template instanceof HtmlString)
        {
            closure.code.appendLine(`${ni.name} = document.createElement("SPAN");`);
            closure.code.appendLine(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.html)};`);
            return;
        }

        // Dynamic text?
        if (ni.template instanceof Function)
        {
            closure.code.appendLine(`${ni.name} = helpers.createTextNode(ctx.callbacks[${callbacks.length}].call(ctx.model));`);
            closure.update.appendLine(`${ni.name} = helpers.setNodeText(${ni.name}, ctx.callbacks[${callbacks.length}].call(ctx.model));`);
            callbacks.push(ni.template);
            return;
        }

        // Element node?
        if (ni.template.type)
        {
            // Create the element
            closure.code.appendLine(`${ni.name} = document.createElement(${JSON.stringify(ni.template.type)});`);

            // ID
            if (ni.template.id)
            {
                format_dynamic(ni.template.id, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${ni.name}.setAttribute("id", ${valueExpr});`);
                });
            }

            // Class
            if (ni.template.class)
            {
                format_dynamic(ni.template.class, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${ni.name}.setAttribute("class", ${valueExpr});`);
                });
            }

            // Boolean classes
            for (let cls of Object.keys(ni.template).filter(x => x.startsWith("class_")))
            {
                let className = camel_to_dash(cls.substring(6));

                format_dynamic(ni.template[cls], (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`helpers.setNodeClass(${ni.name}, ${JSON.stringify(className)}, ${valueExpr});`);
                });
            }

            // Style
            if (ni.template.style)
            {
                format_dynamic(ni.template.style, (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${ni.name}.setAttribute("style", ${valueExpr});`);
                });
            }

            // Attributes
            for (let attr of Object.keys(ni.template).filter(x => x.startsWith("attr_")))
            {
                let attrName = camel_to_dash(attr.substring(5));

                format_dynamic(ni.template[attr], (codeBlock, valueExpr) => {
                    codeBlock.appendLine(`${ni.name}.setAttribute(${JSON.stringify(attrName)}, ${valueExpr});`);
                });
            }

            // Set inner text
            if (ni.template.text)
            {
                if (ni.template.text instanceof Function)
                {
                    format_dynamic(ni.template.text, (codeBlock, valueExpr) => {
                        codeBlock.appendLine(`helpers.setElementText(${ni.name}, ${valueExpr});`);
                    });
                }
                else if (ni.template.text instanceof HtmlString)
                {
                    closure.code.appendLine(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.text.html)};`);
                }
                if (typeof(ni.template.text) === 'string')
                {
                    closure.code.appendLine(`${ni.name}.innerText = ${JSON.stringify(ni.template.text)};`);
                }
            }
        }
        else
        {
            // It's a fragment node, render the nodes and store them in an array
            closure.code.appendLine(`${ni.name} = [];`);
            ni.isFragment = true;
        }

        // Child nodes?
        if (ni.template.childNodes)
        {
            // Create node infos for all children
            for (let i=0; i<ni.template.childNodes.length; i++)
            {
                let child_ni = new NodeInfo(ni, `n${nodeId++}`, ni.template.childNodes[i]);
                child_ni.index = i;
                ni.childNodes.push(child_ni);
                closure.addLocal(child_ni.name);
            }

            // Create the child nodes
            for (let child_ni of ni.childNodes)
            {
                // Get the child node template
                let nn = child_ni.name;

                // Is it a foreach node?
                if (child_ni.template.foreach !== undefined)
                {
                    compileForEachNode(child_ni);
                    continue;
                }

                // Is it a conditional node?
                if (child_ni.template.condition !== undefined)
                {
                    if (child_ni.template.condition instanceof Function)
                    {
                        // Dynamic conditional...
                        compileConditionalNode(child_ni);
                        continue;
                    }
                    else
                    {
                        // Static conditional, either include it or not?
                        if (!child_ni.template.condition)
                        {
                            if (child_ni.isFragment)
                                closure.code.appendLine(`${nn} = [ document.createComment(' omitted by condition ') ];`);
                            else
                                closure.code.appendLine(`${nn} = document.createComment(' omitted by condition ');`);
                            continue;
                        }
                    }
                }

                // Regular node (or static true condition)
                compileNode(closure, child_ni);
            }

            // Add all the child nodes to this node
            if (ni.childNodes.length)
            {
                let op = ni.isFragment ? "push" : "append";
                closure.code.appendLine(`${ni.name}.${op}(${ni.childNodes.map(x => x.isFragment ? `...${x.name}` : x.name).join(", ")});`);
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


        function compileConditionalNode(child_ni)
        {
            let callback_index = callbacks.length;
            callbacks.push(child_ni.template.condition);

            let nn = child_ni.name;

            // Before generating the node, generate the update code
            closure.update.appendLine(`if (${nn}_included != ctx.callbacks[${callback_index}].call(ctx.model))`)
            closure.update.appendLine(`  ((${nn}_included = !${nn}_included) ? attach_${nn} : detach_${nn})();`);
            closure.update.appendLine(`if (${nn}_included) {`);
            closure.update.indent();

            // Generate function to create the node
            closure.code.appendLine(`function create_${nn}() {`);
            closure.code.indent();
            compileNode(closure, child_ni);
            closure.code.unindent();
            closure.code.appendLine(`}`);
            let last_sub_node_id = nodeId;

            // Generate function to create and attach the node
            closure.code.appendLine(`function attach_${nn}() {`);
            closure.code.indent();
            closure.code.appendLine(`let save = ${nn};`);
            closure.code.appendLine(`create_${nn}();`);
            if (child_ni.isFragment)
                closure.code.appendLine(`helpers.insertFragment(save, ${nn});`);
            else
                closure.code.appendLine(`save.replaceWith(${nn});`);
            if (child_ni.parent.isFragment)
                closure.code.appendLine(`${child_ni.parent.name}[${child_ni.index}] = ${nn};`);
            closure.code.unindent();
            closure.code.appendLine(`}`);

            // Generate function to detach the node
            closure.code.appendLine(`function detach_${nn}() {`);
            closure.code.indent();
            if (child_ni.isFragment)
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
            if (child_ni.parent.isFragment)
                closure.code.appendLine(`${child_ni.parent.name}[${child_ni.index}] = replacement;`);
            let closureNodes = [];
            child_ni.getClosureNodes(closureNodes);
            if (closureNodes.length)
            {
                closure.code.appendLine(`${closureNodes.map(x => x.name).join(" = ")} = null;`);
            }
            closure.code.unindent();
            closure.code.appendLine(`}`);

            // Generate code to create initial
            closure.addLocal(`${nn}_included`);
            closure.code.appendLine(`${nn}_included = ctx.callbacks[${callback_index}].call(ctx.model);`);
            closure.code.appendLine(`if (${nn}_included)`);
            closure.code.appendLine(`  create_${nn}();`);
            closure.code.appendLine(`else`);
            if (child_ni.isFragment)
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

    let templateFunction = new Function("ctx", "helpers", "model", code.code);


    return function (model)
    {
        return templateFunction(code.ctx, helpers, model);
    }
}