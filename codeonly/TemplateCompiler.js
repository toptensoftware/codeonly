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

    // Create node info        
    let rootNodeInfo = new NodeInfo(null, `n${nodeId++}`, rootTemplate, false);
    buildNodeGraph(rootNodeInfo);

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

    function buildNodeGraph(ni)
    {
        if (ni.isForEach)
        {
            ni.item = new NodeInfo(ni, `i${ni.name}`, ni.template, true);
            buildNodeGraph(ni.item);
            return;
        }

        // Child nodes?
        if (!ni.template.childNodes)
            return;

        // Create node infos for all children
        let conditionGroup = null;
        for (let i=0; i<ni.template.childNodes.length; i++)
        {
            let child = new NodeInfo(ni, `n${nodeId++}`, ni.template.childNodes[i], false);
            buildNodeGraph(child);

            // 'if' conditions on foreach blocks handled by the foreach manager
            if (child.isForEach)
            {
                ni.childNodes.push(child);
                conditionGroup = null;
                continue;
            }

            // Connect if/elseif/else elements into condition groups
            if (child.template.if !== undefined)
            {
                conditionGroup = [child];
                child.conditionGroup = conditionGroup;
                child.clause = 'if';
                child.condition = child.template.if;
                ni.childNodes.push(child);
            }
            else if (child.template.else !== undefined)
            {
                if (conditionGroup == null)
                    throw new Error("Element has an 'else' condition that doesn't follow and 'if' or 'elseif'");
                if (child.template.else !== true)
                    throw new Error("'else' key must have value 'true'");
                child.clause = 'else';
                child.condition = true;
                conditionGroup.push(child);
                conditionGroup = null;
            }
            else if (child.template.elseif !== undefined)
            {
                if (conditionGroup == null)
                    throw new Error("Element has an 'elseif' condition that doesn't follow and 'if' or 'elseif'");
                child.clause = 'else if';
                child.condition = child.template.elseif;
                conditionGroup.push(child);
            }
            else
            {
                ni.childNodes.push(child);
            }
        }

        // Handle static conditions
        for (let i = 0; i<ni.childNodes.length; i++)
        {
            let child = ni.childNodes[i];
            if (child.conditionGroup)
            {
                let group = child.conditionGroup;
                finalizeConditionGroup(group);
                if (group.length == 0)
                {
                    ni.childNodes.splice(i, 1);
                    i--;
                }
                else
                {
                    ni.childNodes[i] = group[0];
                }
            }
        }
    }

    function finalizeConditionGroup(conditionGroup)
    {
        for (let i=0; i<conditionGroup.length; i++)
        {
            let branch = conditionGroup[i];

            // Static value?
            if (!(branch.condition instanceof Function))
            {
                if (branch.condition)
                {
                    // True
                    if (i == 0)
                    {
                        // First branch is true, whole condition just goes away
                        delete branch.conditionGroup;
                        delete branch.condition;
                        delete branch.clause;
                        conditionGroup.splice(0, conditionGroup.length, branch);
                        return;
                    }
                    else
                    {
                        // Remaining branches can be deleted and this becomes the 'else' block
                        conditionGroup.splice(i + 1, conditionGroup.length);
                        branch.clause = 'else';
                    }
                }
                else
                {
                    if (i == 0)
                    {
                        // "if: false", change the following 'elseif' to if
                        if (i + 1 < conditionGroup.length && conditionGroup[i+1].clause == 'else if')
                        {
                            conditionGroup[i+1].clause = 'if';
                        }
                    }

                    // False, just remove the branch
                    conditionGroup.splice(i, 1);
                    i--;
                }
            }
        }

        if (conditionGroup.length == 0)
            return;

        // If there's no trailing else block, then add one
        if (conditionGroup[conditionGroup.length-1].clause != 'else')
        {
            let ni = new NodeInfo(conditionGroup[0].parent, `n${nodeId++}`, {
                clause: "else",
                condition: true,
                type: "comment",
                text: " implicit else ",
            }, false);
            ni.condition = true;
            ni.clause = "else";
            conditionGroup.push(ni);
        }

        // Assign branch indicies
        for (let i=0; i<conditionGroup.length; i++)
        {
            conditionGroup[i].branch_index = i;
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
        if (ni.childNodes)
        {
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

            closure.update.append(`${ni.name}_select(${ni.name}_resolve());`);

            // Generate code to create initially selected branch
            closure.addLocal(`${ni.name}_branch`);
            closure.create.append(`${ni.name}_branch = ${ni.name}_resolve();`);
            closure.create.append(`${ni.name}_branches[${ni.name}_branch].create();`);

            // Generate a function to resolve the selected branch
            let fnResolve = closure.addFunction(`${ni.name}_resolve`);
            for (let br of ni.conditionGroup)
            {
                if (br.clause != 'else')
                {
                    if (!(br.condition instanceof Function))
                        throw new Error("internal error - incorrectly configure condition group");

                    fnResolve.code.append(`${br.clause} (${format_callback(objrefs.length)})`);
                    fnResolve.code.append(`  return ${br.branch_index};`);
                    objrefs.push(br.condition);
                }
                else
                {
                    fnResolve.code.append(`else`);
                    fnResolve.code.append(`  return ${br.branch_index};`);
                }
            }

            // Generate function to create and attach the node
            let multiRoot = ni.conditionGroup.some(x => x.isMultiRoot);
            let fn = closure.addFunction(`${ni.name}_select`, ['branch']);
            fn.code.append(`if (${ni.name}_branch == branch)`);
            fn.code.append(`  return;`);
            fn.code.append(`let old_branch = ${ni.name}_branch;`);
            fn.code.append(`${ni.name}_branches[branch].create();`);
            if (multiRoot)
            {
                fn.code.append(`let old_nodes = [${ni.spreadDomNodes(false)}];`);
                fn.code.append(`${ni.name}_branch = branch;`);
                fn.code.append(`let new_nodes = [${ni.spreadDomNodes(false)}];`);
                fn.code.append(`helpers.replaceMany(old_nodes, new_nodes);`);
            }
            else
            {
                fn.code.append(`let old_node = ${ni.spreadDomNodes(false)};`);
                fn.code.append(`${ni.name}_branch = branch;`);
                fn.code.append(`let new_node = ${ni.spreadDomNodes(false)};`);
                fn.code.append(`old_node.replaceWith(new_node);`);
            }
            fn.code.append(`${ni.name}_branches[old_branch].destroy();`);

            // As we generate the update code for each of the branches, make sure it's wrapped
            // in appropriate check to make sure the branch is active
            let cblock = closure.update.enterCollapsibleBlock(`if (${ni.name}_branch == ${ni.branch_index}) {`);
            closure.update.indent();

            // Generate the branches create/destroy functions
            let prolog = closure.addProlog();
            prolog.append(`let ${ni.name}_branches = `);
            prolog.append(`[`);
            prolog.indent();
            for (let br of ni.conditionGroup)
            {
                // Generate function to create the node
                prolog.append(`{`);
                prolog.indent();
                prolog.append(`create: function()`);
                prolog.append(`{`);
                prolog.indent();
                let save = br.conditionGroup;
                delete br.conditionGroup;
                let saveCreate = closure.create;
                closure.create = prolog;
                compileNode(closure, br);
                closure.create = saveCreate;
                br.conditionGroup = save;
                prolog.unindent();
                prolog.append(`},`);
                prolog.append(`destroy: function()`);
                prolog.append(`{`);
                prolog.indent();
                for (let ln of br.enumLocalNodes())
                {
                    prolog.append(`${ln} = null;`);
                }
                for (let fe of br.enumLocalForEach())
                {
                    prolog.append(`${fe}_manager?.destroy();`);
                    prolog.append(`${fe}_manager = null;`);
                }
                prolog.unindent();
                prolog.append(`},`);
                prolog.unindent();
                prolog.append(`},`);
            }
            prolog.unindent();
            prolog.append(`];`);


            closure.update.unindent();
            closure.update.leaveCollapsibleBlock(cblock, `}`);
        }

        function compileForEachNode()
        {
            // Create a node item for the child
            let ni_item = ni.item;

            // Create a construction function for the items
            let itemClosureFn = closure.addFunction(`${ni.name}_item_constructor`, [ "itemCtx" ]);
            let itemClosure = new ClosureBuilder();
            itemClosure.callback_args = "ctx.model, itemCtx.item, itemCtx";
            itemClosure.outer = "itemCtx";
            compileNodeToClosure(itemClosure, ni_item);
            itemClosure.appendTo(itemClosureFn.code);

            // Create the "foreach" manager
            closure.create.append(`let ${ni.name}_manager = new helpers.ForEachManager({`);
            closure.create.append(`  item_constructor: ${ni.name}_item_constructor,`);
            closure.create.append(`  model: ctx.model,`);
            if (closure.outer)
                closure.create.append(`  outer: ${closure.outer},`);
            if (ni_item.isMultiRoot)
                closure.create.append(`  multi_root_items: true,`);
            closure.create.append(`  array_sensitive: ${ni.template.array_sensitive !== false},`);
            closure.create.append(`  index_sensitive: ${ni.template.index_sensitive !== false},`);
            closure.create.append(`  item_sensitive: ${ni.template.item_sensitive !== false},`);
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