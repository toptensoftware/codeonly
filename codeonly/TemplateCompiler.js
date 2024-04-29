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

    // Create condition group for root 'if' block
    if (rootTemplate.if !== undefined && rootTemplate.foreach === undefined)
        rootNodeInfo.conditionGroup = [ rootNodeInfo ];
    
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
        closure.update = closure.addFunction("update").code;
        closure.destroy = closure.addFunction("destroy").code;
        closure.create = closure.code;

        // Render code
        compileNode(closure, ni);

        let rnf = closure.addFunction('getRootNodes');
        rnf.code.append(`return [${ni.spreadDomNodes()}];`);

        // Return interface to the closure
        if (ni.isItemNode)
        {
            closure.code.append([
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
            closure.code.append([
                `return { `,
                ni.isMultiRoot ? null : `  get rootNode() { return ${ni.name}; },`,
                `  get rootNodes() { return getRootNodes(); },`,
                `  isMultiRoot: ${ni.isMultiRoot},`,
                `  update,`,
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
            closure.create.append(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
            return true;
        }

        // HTML Text?
        if (ni.template instanceof HtmlString)
        {
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = document.createElement("SPAN");`);
            closure.create.append(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.html)};`);
            return true;
        }

        // Dynamic text?
        if (ni.template instanceof Function)
        {
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = helpers.createTextNode(${format_callback(objrefs.length)});`);
            closure.update.append(`${ni.name} = helpers.setNodeText(${ni.name}, ${format_callback(objrefs.length)});`);
            objrefs.push(ni.template);
            return true;
        }

        // Embedded component
        if (is_constructor(ni.template.type))
        {
            throw new Error("Embedded components not implemented");
        }

        // Is it a foreach node?
        if (ni.isForEach)
        {
            compileForEachNode();
            return true;
        }

        // Is it a conditional node?
        if (ni.conditionGroup !== undefined)
        {
            compileConditionalNode();
            return true;
        }

        // Comment?
        if (ni.template.type == 'comment')
        {
            closure.addLocal(ni.name);

            if (ni.template.text instanceof Function)
            {
                closure.create.append(`${ni.name} = document.createComment(${format_callback(objrefs.length)});`);
                closure.update.append(`${ni.name} = ${ni.name}.nodeValue = ${format_callback(objrefs.length)};`);
                objrefs.push(ni.template.text);
            }
            else
            {
                closure.create.append(`${ni.name} = document.createComment(${JSON.stringify(ni.template.text)});`);
            }
            return true;
        }
        
        // Element node?
        if (ni.template.type)
        {
            // Create the element
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = document.createElement(${JSON.stringify(ni.template.type)});`);

            // ID
            if (ni.template.id)
            {
                format_dynamic(ni.template.id, (codeBlock, valueExpr) => {
                    codeBlock.append(`${ni.name}.setAttribute("id", ${valueExpr});`);
                });
            }

            // Class
            if (ni.template.class)
            {
                format_dynamic(ni.template.class, (codeBlock, valueExpr) => {
                    codeBlock.append(`${ni.name}.setAttribute("class", ${valueExpr});`);
                });
            }

            // Boolean classes
            for (let cls of Object.keys(ni.template).filter(x => x.startsWith("class_")))
            {
                let className = camel_to_dash(cls.substring(6));

                format_dynamic(ni.template[cls], (codeBlock, valueExpr) => {
                    codeBlock.append(`helpers.setNodeClass(${ni.name}, ${JSON.stringify(className)}, ${valueExpr});`);
                });
            }

            // Style
            if (ni.template.style)
            {
                format_dynamic(ni.template.style, (codeBlock, valueExpr) => {
                    codeBlock.append(`${ni.name}.setAttribute("style", ${valueExpr});`);
                });
            }

            // Attributes
            for (let attr of Object.keys(ni.template).filter(x => x.startsWith("attr_")))
            {
                let attrName = camel_to_dash(attr.substring(5));

                format_dynamic(ni.template[attr], (codeBlock, valueExpr) => {
                    codeBlock.append(`${ni.name}.setAttribute(${JSON.stringify(attrName)}, ${valueExpr});`);
                });
            }

            // Set inner text
            if (ni.template.text)
            {
                if (ni.template.text instanceof Function)
                {
                    format_dynamic(ni.template.text, (codeBlock, valueExpr) => {
                        codeBlock.append(`helpers.setElementText(${ni.name}, ${valueExpr});`);
                    });
                }
                else if (ni.template.text instanceof HtmlString)
                {
                    closure.create.append(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.text.html)};`);
                }
                if (typeof(ni.template.text) === 'string')
                {
                    closure.create.append(`${ni.name}.innerText = ${JSON.stringify(ni.template.text)};`);
                }
            }
        }

        // Child nodes?
        if (ni.template.childNodes)
        {
            // Create node infos for all children
            let conditionGroup = null;
            for (let i=0; i<ni.template.childNodes.length; i++)
            {
                let child = new NodeInfo(ni, `n${nodeId++}`, ni.template.childNodes[i], false);
                ni.childNodes.push(child);

                // Connect if/elseif/else elements
                if (child.template.if !== undefined)
                {
                    conditionGroup = [child];
                    child.conditionGroup = conditionGroup;
                }
                else if (child.template.else !== undefined || child.template.elseif != undefined)
                {
                    if (conditionGroup == null)
                        throw new Error("Element has an 'else' or 'elseif' condition but doesn't follow and 'if' or 'elseif' item");

                    conditionGroup.push(child);

                    if (child.template.else != undefined)
                        conditionGroup = null;
                }
                else
                {
                    conditionGroup = null;
                }
            }

            // Create the child nodes
            for (let i=0; i<ni.childNodes.length; i++)
            {
                if (!compileNode(closure, ni.childNodes[i]))
                {
                    ni.childNodes.splice(i, 1);
                    i--;
                }
            }

            // Add all the child nodes to this node
            if (ni.childNodes.length && !ni.isFragment)
            {
                closure.create.append(`${ni.name}.append(${ni.spreadChildDomNodes()});`);
            }
        }

        return true;

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


        function compileConditionalNode()
        {
            let nn = ni.name;

            // Setup the clause kind, branch index and callback
            ni.callback_index = objrefs.length;
            ni.branch_index = ni.conditionGroup.indexOf(ni);
            if (ni.template.if !== undefined)
            {
                ni.clause = "if";
                objrefs.push(ni.template.if);
            }
            else if (ni.template.elseif !== undefined)
            {
                ni.clause = "else if";
                objrefs.push(ni.template.elseif);
            }
            else if (ni.template.else !== undefined)
            {
                ni.clause = "else";
                objrefs.push(ni.template.else);
            }
            else
            {
                throw new Error(`internal error configuring if/elseif/else blocks`);
            }

            if (!(objrefs[ni.callback_index] instanceof Function))
            {
                let val = objrefs[ni.callback_index];
                objrefs[ni.callback_index] = () => val;
            }
    
            let ni_if = ni.conditionGroup[0];

            // Is this the first, primary "if" element?
            let isFirst = ni.conditionGroup[0] == ni;
            let isLast = ni.conditionGroup[ni.conditionGroup.length-1] == ni;

            let prolog = ni_if.prolog;
            if (isFirst)
            {
                ni_if.prolog = prolog = closure.addProlog();
                prolog.append(`let ${ni.name}_branches = `);
                prolog.append(`[`);
                prolog.indent();

                closure.update.append(`${ni_if.name}_select(${ni_if.name}_resolve());`);
            }



            let cblock = closure.update.enterCollapsibleBlock(`if (${ni_if.name}_branch == ${ni.branch_index}) {`);
            closure.update.indent();

            // Generate function to create the node
            prolog.append(`{`);
            prolog.indent();
            prolog.append(`create: function()`);
            prolog.append(`{`);
            prolog.indent();
            let save = ni.conditionGroup;
            delete ni.conditionGroup;
            let saveCreate = closure.create;
            closure.create = prolog;
            compileNode(closure, ni);
            closure.create = saveCreate;
            ni.conditionGroup = save;
            prolog.unindent();
            prolog.append(`},`);
            prolog.append(`destroy: function()`);
            prolog.append(`{`);
            prolog.indent();
            for (let ln of ni.enumLocalNodes())
            {
                prolog.append(`${ln} = null;`);
            }
            for (let fe of ni.enumLocalForEach())
            {
                prolog.append(`${fe}_manager?.destroy();`);
                prolog.append(`${fe}_manager = null;`);
            }
            prolog.unindent();
            prolog.append(`},`);
            prolog.unindent();
            prolog.append(`},`);


            if (isLast)
            {
                if (ni.conditionGroup[ni.conditionGroup.length-1].clause != 'else')
                {
                    closure.addLocal(`${ni_if.name}_placeholder`);
                    prolog.append(`{`);
                    prolog.indent();
                    prolog.append(`create: function()`);
                    prolog.append(`{`);
                    prolog.indent();
                    prolog.append(`${ni_if.name}_placeholder = document.createComment(" omitted if ");`);
                    prolog.unindent();
                    prolog.append(`},`);
                    prolog.append(`destroy: function()`);
                    prolog.append(`{`);
                    prolog.indent();
                    prolog.append(`${ni_if.name}_placeholder = null;`);
                    prolog.unindent();
                    prolog.append(`},`);
                    prolog.unindent();
                    prolog.append(`}`);
                }

                prolog.unindent();
                prolog.append(`];`);

                // Generate code to create initial items
                closure.addLocal(`${ni_if.name}_branch`);
                closure.create.append(`${ni_if.name}_branch = ${ni_if.name}_resolve();`);
                closure.create.append(`${ni_if.name}_branches[${ni_if.name}_branch].create();`);


                let fnResolve = closure.addFunction(`${ni_if.name}_resolve`);

                for (let i=0; i<ni.conditionGroup.length; i++)
                {
                    let ni_branch = ni.conditionGroup[i];

                    fnResolve.code.append(`${ni_branch.clause} (${format_callback(ni_branch.callback_index)})`);
                    fnResolve.code.append(`  return ${ni_branch.branch_index};`);
                }
                if (ni.conditionGroup[ni.conditionGroup.length-1].clause != 'else')
                {
                    fnResolve.code.append(`else`);
                    fnResolve.code.append(`  return ${ni.conditionGroup.length};`);
                }

                // Generate function to create and attach the node
                let multiRoot = ni.conditionGroup.some(x => x.isMultiRoot);
                let fn = closure.addFunction(`${ni_if.name}_select`, ['branch']);
                fn.code.append(`if (${ni_if.name}_branch == branch)`);
                fn.code.append(`  return;`);
                fn.code.append(`let old_branch = ${ni_if.name}_branch;`);
                fn.code.append(`${ni_if.name}_branches[branch].create();`);
                if (multiRoot)
                {
                    fn.code.append(`let old_nodes = [${ni_if.spreadDomNodes(false)}];`);
                    fn.code.append(`${ni_if.name}_branch = branch;`);
                    fn.code.append(`let new_nodes = [${ni_if.spreadDomNodes(false)}];`);
                    fn.code.append(`helpers.replaceMany(old_nodes, new_nodes);`);
                }
                else
                {
                    fn.code.append(`let old_node = ${ni_if.spreadDomNodes(false)};`);
                    fn.code.append(`${ni_if.name}_branch = branch;`);
                    fn.code.append(`let new_node = ${ni_if.spreadDomNodes(false)};`);
                    fn.code.append(`old_node.replaceWith(new_node);`);
                }
                fn.code.append(`${ni_if.name}_branches[old_branch].destroy();`);
            }

            closure.update.unindent();
            closure.update.leaveCollapsibleBlock(cblock, `}`);

        }

        function compileForEachNode()
        {
            // Create a node item for the child
            let child_item_ni = new NodeInfo(null, `i${ni.name}`, ni.template, true);

            // Create a construction function for the items
            let itemClosureFn = closure.addFunction(`${ni.name}_item_constructor`, [ "itemCtx" ]);
            let itemClosure = new ClosureBuilder();
            itemClosure.callback_args = "ctx.model, itemCtx.item, itemCtx";
            itemClosure.outer = "itemCtx";
            compileNodeToClosure(itemClosure, child_item_ni);
            itemClosure.appendTo(itemClosureFn.code);

            // Create the "foreach" manager
            closure.create.append(`let ${ni.name}_manager = new helpers.ForEachManager({`);
            closure.create.append(`  item_constructor: ${ni.name}_item_constructor,`);
            closure.create.append(`  model: ctx.model,`);
            if (closure.outer)
                closure.create.append(`  outer: ${closure.outer},`);
            if (child_item_ni.isMultiRoot)
                closure.create.append(`  multi_root_items: true,`);
            closure.create.append(`  array_sensitive: ${ni.template.array_sensitive !== false},`);
            closure.create.append(`  index_sensitive: ${ni.template.index_sensitive !== false},`);
            closure.create.append(`  item_sensitive: ${!!ni.template.item_sensitive},`);
            if (ni.item_key)
            {
                let itemkey_index = objrefs.length;
                objrefs.push(ni.template.item_key);
                closure.create.append(`  item_key: ctx.objrefs[${itemkey_index}],`);
            }
            if (ni.template.if)
            {
                let condition_index = objrefs.length;
                objrefs.push(ni.template.if);
                closure.create.append(`  condition: ctx.objrefs[${condition_index}],`);
            }
            closure.create.append(`});`);

            let objref_index = objrefs.length;
            objrefs.push(ni.template.foreach);
            if (!(ni.template.foreach instanceof Function))
            {
                closure.create.append(`${ni.name}_manager.loadItems(ctx.objrefs[${objref_index}]);`);
            }
            else
            {
                closure.create.append(`${ni.name}_manager.loadItems(${format_callback(objref_index)});`);
                closure.update.append(`${ni.name}_manager.updateItems(${format_callback(objref_index)});`);
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