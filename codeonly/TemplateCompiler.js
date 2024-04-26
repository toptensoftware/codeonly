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
    }

    get isMultiRoot()
    {
        return this.isFragment || this.isForEach;
    }

    get isFragment()
    {
        return !this.template.type;
    }

    get isForEach()
    {
        return !!this.template.foreach;
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

    get spreadNodes()
    {
        if (!this.isMultiRoot)
            return this.name;
        else
            return `...${this.name}`;
    }

    get spreadNodesFlat()
    {
        if (this.isForEach)
            return `...${this.name}`;

        if (this.isFragment)
            return this.spreadChildNodes;

        return this.name;
    }

    get spreadChildNodes()
    {
        return this.childNodes.map(x => {
            if (!x.isFragment && !x.isForEach)
                return x.name;
            if (!x.childNodes.some(x => x.isFragment))
                return `...${x.name}`;
            return `...${x.name}.flat(Infinity)`;
        });
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
    
    let rootClosure = new ClosureBuilder();
    rootClosure.callback_args = "ctx.model";
    rootClosure.outer_item = "null";
    compileNodeToClosure(rootClosure, rootNodeInfo);

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        ctx: {
            callbacks,
        }
    }

    function compileNodeToClosure(closure, ni)
    {
        // Setup closure
        closure.addLocal(ni.name);
        closure.attach = closure.addFunction("attach").code;
        closure.update = closure.addFunction("update").code;
        closure.detach = closure.addFunction("detach").code;
        closure.destroy = closure.addFunction("destroy").code;
        closure.create = closure.code;

        // Render code
        compileNode(closure, ni);

        let rnf = closure.addFunction('getRootNodesFlat');
        rnf.code.appendLine(`return [${ni.spreadNodesFlat}];`);

        // Return interface to the closure
        closure.code.appendLine(`return { rootNode: ${ni.name}, get rootNodesFlat() { return getRootNodesFlat(); }, attach, update, detach, destroy };`);
    }

    // Recursively compile a node from a template
    function compileNode(closure, ni)
    {
        // Normal text?
        if (typeof(ni.template) === 'string')
        {
            closure.create.appendLine(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
            return;
        }

        // HTML Text?
        if (ni.template instanceof HtmlString)
        {
            closure.create.appendLine(`${ni.name} = document.createElement("SPAN");`);
            closure.create.appendLine(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.html)};`);
            return;
        }

        // Dynamic text?
        if (ni.template instanceof Function)
        {
            closure.create.appendLine(`${ni.name} = helpers.createTextNode(${format_callback(callbacks.length)});`);
            closure.update.appendLine(`${ni.name} = helpers.setNodeText(${ni.name}, ${format_callback(callbacks.length)});`);
            callbacks.push(ni.template);
            return;
        }

        // Element node?
        if (ni.template.type)
        {
            // Create the element
            closure.create.appendLine(`${ni.name} = document.createElement(${JSON.stringify(ni.template.type)});`);

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
                    closure.create.appendLine(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.text.html)};`);
                }
                if (typeof(ni.template.text) === 'string')
                {
                    closure.create.appendLine(`${ni.name}.innerText = ${JSON.stringify(ni.template.text)};`);
                }
            }
        }
        else
        {
            // It's a fragment node, render the nodes and store them in an array
            closure.create.appendLine(`${ni.name} = [];`);
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
                                closure.create.appendLine(`${nn} = [ document.createComment(' omitted by condition ') ];`);
                            else
                                closure.create.appendLine(`${nn} = document.createComment(' omitted by condition ');`);
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
                let op = (ni.isFragment || ni.isForEach) ? "push" : "append";
                closure.create.appendLine(`${ni.name}.${op}(${ni.childNodes.map(x => x.name).join(", ")});`);
            }
        }

        function format_callback(index)
        {
            return `ctx.callbacks[${index}].call(${closure.callback_args})`
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
                formatter(codeBlock, format_callback(callbacks.length));

                // Append the code to both the main code block (to set initial value) and to 
                // the update function.
                closure.create.append(codeBlock);
                closure.update.append(codeBlock);

                // Store the callback in the context callback array
                callbacks.push(value);
            }
            else
            {
                // Static value, just output it directly
                formatter(closure.create, JSON.stringify(value));
            }
        }


        function compileConditionalNode(child_ni)
        {
            let callback_index = callbacks.length;
            callbacks.push(child_ni.template.condition);

            let nn = child_ni.name;

            // Before generating the node, generate the update code
            closure.update.appendLine(`if (${nn}_included != ${format_callback(callback_index)})`)
            closure.update.appendLine(`  ((${nn}_included = !${nn}_included) ? attach_${nn} : detach_${nn})();`);
            closure.update.appendLine(`if (${nn}_included) {`);
            closure.update.indent();

            // Generate code to create initial
            closure.addLocal(`${nn}_included`);
            closure.create.appendLine(`${nn}_included = ${format_callback(callback_index)};`);
            closure.create.appendLine(`if (${nn}_included)`);
            closure.create.appendLine(`  create_${nn}();`);
            closure.create.appendLine(`else`);
            if (child_ni.isFragment)
                closure.create.appendLine(`  ${nn} = [ document.createComment(' omitted by condition ') ];`);
            else
                closure.create.appendLine(`  ${nn} = document.createComment(' omitted by condition ');`);

            // Generate function to create the node
            let fn = closure.addFunction(`create_${nn}`);
            let oldCreate = closure.create;
            closure.create = fn.code;
            compileNode(closure, child_ni);
            closure.create = oldCreate;

            // Generate function to create and attach the node
            fn = closure.addFunction(`attach_${nn}`);
            fn.code.appendLine(`let save = ${nn};`);
            fn.code.appendLine(`create_${nn}();`);
            if (child_ni.isFragment)
                fn.code.appendLine(`helpers.insertFragment(save, ${nn});`);
            else
                fn.code.appendLine(`save.replaceWith(${nn});`);
            if (child_ni.parent.isFragment)
                fn.code.appendLine(`${child_ni.parent.name}[${child_ni.index}] = ${nn};`);

            // Generate function to detach the node
            fn = closure.addFunction(`detach_${nn}`);
            if (child_ni.isFragment)
            {
                fn.code.appendLine(`let replacement = [ document.createComment(" omitted by condition ") ];`);
                fn.code.appendLine(`helpers.removeFragment(${nn}, replacement);`);
            }
            else
            {
                fn.code.appendLine(`let replacement = document.createComment(" omitted by condition ");`);
                fn.code.appendLine(`${nn}.replaceWith(replacement)`);
            }
            fn.code.appendLine(`${nn} = replacement;`);
            if (child_ni.parent.isFragment)
                fn.code.appendLine(`${child_ni.parent.name}[${child_ni.index}] = replacement;`);
            let closureNodes = [];
            child_ni.getClosureNodes(closureNodes);
            if (closureNodes.length)
            {
                fn.code.appendLine(`${closureNodes.map(x => x.name).join(" = ")} = null;`);
            }


            closure.update.unindent();
            closure.update.appendLine(`}`);

        }

        function compileForEachNode(child_ni)
        {
            // Create a function for the item
            let itemClosureFn = closure.addFunction(`item_${child_ni.name}`, ["item", "index", "outer"]);
            itemClosureFn.code.appendLine("let itemCtx = { item, index, outer }");
            let itemClosure = new ClosureBuilder();
            itemClosure.callback_args = "ctx.model, item, itemCtx";
            itemClosure.outer_item = "outer";
            compileNodeToClosure(itemClosure, child_ni);
            itemClosure.appendTo(itemClosureFn.code);

            // Create the sentinal comment node
            closure.create.appendLine(`${child_ni.name} = [ document.createComment(' foreach ') ];`);

            // Create an array for all the items
            closure.create.appendLine(`let ${child_ni.name}_items = [];`);

            if (!(child_ni.template.foreach instanceof Function))
            {
                let items = child_ni.template.foreach;
                for (let i=0; i<items.length; i++)
                {
                    closure.create.appendLine(`${child_ni.name}_items.push(item_${child_ni.name}(${JSON.stringify(items[i])}, ${i}, ${closure.outer_item}));`);
                }
            }

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
        */
        }

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