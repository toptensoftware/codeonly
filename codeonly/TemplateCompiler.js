import { camel_to_dash, is_constructor } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";
import { NodeInfo } from "./NodeInfo.js";


export function compileTemplateCode(rootTemplate)
{
    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Every callback value, will be stored here during compilation
    // These need to be passed back to the template runtime function
    // when the template is instantiated via ctx.objrefs;
    let objrefs = [];

    // Map of info about all nodes
    // NodeName => NodeInfo
    let nodeMap = new Map();

    // Create node info        
    let rootNodeInfo = new NodeInfo(null, `n${nodeId++}`, rootTemplate, false);
    nodeMap.set(rootNodeInfo.name, rootNodeInfo);
    
    let rootClosure = new ClosureBuilder();
    rootClosure.callback_args = "ctx.model";
    compileNodeToClosure(rootClosure, rootNodeInfo);

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        ctx: {
            objrefs,
        }
    }

    function compileNodeToClosure(closure, ni)
    {
        // Setup closure functions
        if (!ni.isItemNode)
        {
            closure.attach = closure.addFunction("attach").code;
            closure.detach = closure.addFunction("detach").code;
        }
        closure.update = closure.addFunction("update").code;
        closure.destroy = closure.addFunction("destroy").code;
        closure.create = closure.code;

        // Render code
        compileNode(closure, ni);

        let rnf = closure.addFunction('getRootNodes');
        rnf.code.appendLine(`return [${ni.spreadDomNodes()}];`);

        // Return interface to the closure
        if (ni.isItemNode)
        {
            closure.code.appendLines([
                `return { `,
                ni.isMultiRoot ? null : `  get rootNode() { return ${ni.name}; },`,
                `  get rootNodes() { return getRootNodes(); },`,
                `  itemCtx,`,
                `  update,`,
                `  destroy`,
                `};`]);
        }
        else
        {
            closure.code.appendLines([
                `return { `,
                ni.isMultiRoot ? null : `  get rootNode() { return ${ni.name}; },`,
                `  get rootNodes() { return getRootNodes(); },`,
                `  isMultiRoot: ${ni.isMultiRoot},`,
                `  attach,`,
                `  update,`,
                `  detach,`,
                `  destroy`,
                `};`]);
        }
    }

    // Recursively compile a node from a template
    function compileNode(closure, ni)
    {
        // Normal text?
        if (typeof(ni.template) === 'string')
        {
            closure.addLocal(ni.name);
            closure.create.appendLine(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
            return;
        }

        // HTML Text?
        if (ni.template instanceof HtmlString)
        {
            closure.addLocal(ni.name);
            closure.create.appendLine(`${ni.name} = document.createElement("SPAN");`);
            closure.create.appendLine(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.html)};`);
            return;
        }

        // Dynamic text?
        if (ni.template instanceof Function)
        {
            closure.addLocal(ni.name);
            closure.create.appendLine(`${ni.name} = helpers.createTextNode(${format_callback(objrefs.length)});`);
            closure.update.appendLine(`${ni.name} = helpers.setNodeText(${ni.name}, ${format_callback(objrefs.length)});`);
            objrefs.push(ni.template);
            return;
        }

        // Embedded component
        if (is_constructor(ni.template.type))
        {
            throw new Error("Embedded components not implemented");
        }

        // Element node?
        if (ni.template.type)
        {

            // Create the element
            closure.addLocal(ni.name);
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

        // Child nodes?
        if (ni.template.childNodes)
        {
            // Create node infos for all children
            for (let i=0; i<ni.template.childNodes.length; i++)
            {
                let child_ni = new NodeInfo(ni, `n${nodeId++}`, ni.template.childNodes[i], false);
                child_ni.index = i;
                ni.childNodes.push(child_ni);
            }

            // Create the child nodes
            for (let i=0; i<ni.childNodes.length; i++)
            {
                // Get the child node
                let child_ni = ni.childNodes[i];
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
                            ni.childNodes.splice(i, 1);
                            i--;
                            continue;
                        }
                    }
                }

                // Regular node (or static true condition)
                compileNode(closure, child_ni);
            }

            // Add all the child nodes to this node
            if (ni.childNodes.length && !ni.isFragment)
            {
                closure.create.appendLine(`${ni.name}.append(${ni.spreadChildDomNodes()});`);
            }
        }

        function format_callback(index)
        {
            return `ctx.objrefs[${index}].call(${closure.callback_args})`
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
                formatter(codeBlock, format_callback(objrefs.length));

                // Append the code to both the main code block (to set initial value) and to 
                // the update function.
                closure.create.append(codeBlock);
                closure.update.append(codeBlock);

                // Store the callback in the context callback array
                objrefs.push(value);
            }
            else
            {
                // Static value, just output it directly
                formatter(closure.create, JSON.stringify(value));
            }
        }


        function compileConditionalNode(child_ni)
        {
            let callback_index = objrefs.length;
            objrefs.push(child_ni.template.condition);

            let nn = child_ni.name;
            child_ni.isConditional = true;

            // Before generating the node, generate the update code
            closure.update.appendLine(`if (${nn}_included != ${format_callback(callback_index)})`)
            closure.update.appendLine(`  ((${nn}_included = !${nn}_included) ? attach_${nn} : detach_${nn})();`);
            let cblock = closure.update.enterCollapsibleBlock(`if (${nn}_included) {`);
            closure.update.indent();

            // Generate code to create initial
            closure.addLocal(`${nn}_included`);
            closure.addLocal(`${nn}_placeholder`);
            closure.create.appendLine(`${nn}_included = ${format_callback(callback_index)};`);
            closure.create.appendLine(`if (${nn}_included)`);
            closure.create.appendLine(`  create_${nn}();`);
            closure.create.appendLine(`else`);
            closure.create.appendLine(`  ${nn}_placeholder = document.createComment(' omitted by condition ');`);

            // Generate function to create the node
            let fn = closure.addFunction(`create_${nn}`);
            let oldCreate = closure.create;
            closure.create = fn.code;
            compileNode(closure, child_ni);
            closure.create = oldCreate;

            // Generate function to create and attach the node
            fn = closure.addFunction(`attach_${nn}`);
            fn.code.appendLine(`create_${nn}();`);
            fn.code.appendLine(`${nn}_placeholder.replaceWith(${child_ni.spreadDomNodes(true)});`);
            fn.code.appendLine(`${nn}_placeholder = null`);

            // Generate function to detach the node
            fn = closure.addFunction(`detach_${nn}`);
            fn.code.appendLine(`${nn}_placeholder = document.createComment(" omitted by condition ");`);
            if (child_ni.isFragment)
            {
                fn.code.appendLine(`helpers.replaceMany([${child_ni.spreadDomNodes(true)}], ${nn}_placeholder);`);
            }
            else
            {
                fn.code.appendLine(`${nn}.replaceWith(${nn}_placeholder)`);
            }

            for (let ln of child_ni.enumLocalNodes())
            {
                fn.code.appendLine(`${ln} = null;`);
            }
            for (let fe of child_ni.enumLocalForEach())
            {
                fn.code.appendLine(`${fe}_manager?.destroy();`);
                fn.code.appendLine(`${fe}_manager = null;`);
            }

            closure.update.unindent();
            closure.update.leaveCollapsibleBlock(cblock, `}`);
        }

        function compileForEachNode(child_ni)
        {
            // Create a node item for the child
            let child_item_ni = new NodeInfo(null, `i${child_ni.name}`, child_ni.template, true);

            // Create a construction function for the items
            let itemClosureFn = closure.addFunction(`${child_ni.name}_item_constructor`, [ "itemCtx" ]);
            let itemClosure = new ClosureBuilder();
            itemClosure.callback_args = "ctx.model, itemCtx.item, itemCtx";
            itemClosure.outer = "itemCtx";
            compileNodeToClosure(itemClosure, child_item_ni);
            itemClosure.appendTo(itemClosureFn.code);

            // Create the "foreach" manager
            closure.create.appendLine(`let ${child_ni.name}_manager = new helpers.ForEachManager({`);
            closure.create.appendLine(`  item_constructor: ${child_ni.name}_item_constructor,`);
            closure.create.appendLine(`  model: ctx.model,`);
            if (closure.outer)
                closure.create.appendLine(`  outer: ${closure.outer},`);
            if (child_item_ni.isMultiRoot)
                closure.create.appendLine(`  multi_root_items: true,`);
            closure.create.appendLine(`  array_sensitive: ${child_ni.template.array_sensitive !== false},`);
            closure.create.appendLine(`  index_sensitive: ${child_ni.template.index_sensitive !== false},`);
            closure.create.appendLine(`  item_sensitive: ${child_ni.template.item_sensitive !== false},`);
            if (child_ni.item_key)
            {
                let itemkey_index = objrefs.length;
                objrefs.push(child_ni.template.item_key);
                closure.create.appendLine(`  item_key: ctx.objrefs[${itemkey_index}],`);
            }
            if (child_ni.template.condition)
            {
                let condition_index = objrefs.length;
                objrefs.push(child_ni.template.condition);
                closure.create.appendLine(`  condition: ctx.objrefs[${condition_index}],`);
            }
            closure.create.appendLine(`});`);

            let objref_index = objrefs.length;
            objrefs.push(child_ni.template.foreach);
            if (!(child_ni.template.foreach instanceof Function))
            {
                closure.create.appendLine(`${child_ni.name}_manager.loadItems(ctx.objrefs[${objref_index}]);`);
            }
            else
            {
                closure.create.appendLine(`${child_ni.name}_manager.loadItems(${format_callback(objref_index)});`);
                closure.update.appendLine(`${child_ni.name}_manager.updateItems(${format_callback(objref_index)});`);
            }
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
        return templateFunction(code.ctx, TemplateHelpers, model);
    }
}