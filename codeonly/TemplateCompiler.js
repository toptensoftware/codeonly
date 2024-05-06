import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CloakedValue} from "./CloakedValue.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";
import { NodeInfo } from "./NodeInfo.js";


export function compileTemplateCode(rootTemplate, options)
{
    let initOnCreate = options?.initOnCreate ?? true;

    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Any callbacks, arrays etc... referenced directly by the template
    // will be stored here and passed back to the compile code via ctx.objrefs
    let objrefs = [];

    // Create root node info        
    let rootNodeInfo = new NodeInfo(null, `n${nodeId++}`, rootTemplate, false);

    // Create condition group for root 'if' block
    if (rootTemplate.if !== undefined && rootTemplate.foreach === undefined)
    {
        rootNodeInfo.conditionGroup = [ rootNodeInfo ];
        rootNodeInfo.condition = rootTemplate.if;
        rootNodeInfo.clause = 'if';
        finalizeConditionGroup(rootNodeInfo.conditionGroup);
        if (rootNodeInfo.conditionGroup)
            rootNodeInfo = rootNodeInfo.conditionGroup[0];
    }

    // Build the node graph
    buildNodeGraph(rootNodeInfo);
    
    let rootClosure = new ClosureBuilder();
    rootClosure.callback_args = "model";
    compileNodeToClosure(rootClosure, rootNodeInfo);

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        isMultiRoot: rootNodeInfo.isMultiRoot,
        ctx: {
            objrefs,
        }
    }

    function buildNodeGraph(ni)
    {
        // ForEach items have a second node info for the item itself.
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

        // Handle static 'if' conditions and finalize condition groupds
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

    // Finalize a condition group (ie: a set of related if/else-if/else nodes)
    // by removing redantant branches due to static eg: "if: true" or "if: false"
    // and also ensuring that every condition group has an trailing else branch.
    // This method might modify the conditionGroup array and after processing
    // the first element in the array should become the root condition element.
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

                    // Removing last?
                    if (conditionGroup.length == 1)
                    {
                        // Replace with a comment
                        conditionGroup[0] = new NodeInfo(conditionGroup[0].parent, `n${nodeId++}`, {
                            type: "comment",
                            text: " !if ",
                        }, false);
                    }
                    else
                    {
                        // False, just remove the branch
                        conditionGroup.splice(i, 1);
                        i--;
                    }
                }
            }
        }

        if (conditionGroup.length == 0)
            throw new Error("internal error, condition group became empty")

        // Reduced to a placeholder?
        if (conditionGroup.length == 1 && conditionGroup[0].condition === undefined)
            return;

        // If there's no trailing else block, then add one
        if (conditionGroup[conditionGroup.length-1].clause != 'else')
        {
            let ni = new NodeInfo(conditionGroup[0].parent, `n${nodeId++}`, {
                clause: "else",
                condition: true,
                type: "comment",
                text: " !if ",
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

        // Setup exports array (unless it's an item node)
        if (!ni.isItemNode)
        {
            closure.exports = new Map();
            closure.bindings = new Map();
        }

        // Render code
        compileNode(closure, ni);

        for (let ln of ni.enumLocalNodes())
        {
            closure.destroy.append(ln.renderDestroy());
        }

        // Return interface to the closure
        if (ni.isItemNode)
        {
            closure.code.append([
                `return { `,
                ni.isMultiRoot ? null : `  get rootNode() { return ${ni.spreadDomNodes()}; },`,
                `  get rootNodes() { return [${ni.spreadDomNodes()}]; },`,
                `  itemCtx,`,
                `  update,`,
                `  destroy`,
                `};`]);
        }
        else
        {
            let exports = [];
            closure.exports.forEach((value, key) => exports.push(`  get ${key}() { return ${value}; },`));

            closure.code.append([
                `return { `,
                ni.isMultiRoot ? null : `  get rootNode() { return ${ni.spreadDomNodes()}; },`,
                `  get rootNodes() { return [${ni.spreadDomNodes()}]; },`,
                `  isMultiRoot: ${ni.isMultiRoot},`,
                `  update,`,
                `  destroy,`,
                ...exports,
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
            if (initOnCreate)
                closure.create.append(`${ni.name} = helpers.createTextNode(${format_callback(objrefs.length)});`);
            else
                closure.create.append(`${ni.name} = helpers.createTextNode("");`);
            closure.update.append(`${ni.name} = helpers.setNodeText(${ni.name}, ${format_callback(objrefs.length)});`);
            objrefs.push(ni.template);
            return true;
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
        if (ni.template.type === 'comment')
        {
            closure.addLocal(ni.name);

            if (ni.template.text instanceof Function)
            {
                if (initOnCreate)
                    closure.create.append(`${ni.name} = document.createComment(${format_callback(objrefs.length)});`);
                else
                    closure.create.append(`${ni.name} = document.createComment("");`);
                closure.update.append(`${ni.name} = ${ni.name}.nodeValue = ${format_callback(objrefs.length)};`);
                objrefs.push(ni.template.text);
            }
            else
            {
                closure.create.append(`${ni.name} = document.createComment(${JSON.stringify(ni.template.text)});`);
            }
            return true;
        }

        // Embedded component
        if (ni.isComponent)
        {
            // Create component
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = ctx.objrefs[${objrefs.length}]();`);
            objrefs.push(ni.template.type);

            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(key))
                    continue;

                // All other properties, assign to the object
                let propType = typeof(ni.template[key]);
                if (propType == 'string' || propType == 'number' || propType == 'boolean')
                {
                    // Simple literal property
                    closure.create.append(`${ni.name}[${JSON.stringify(key)}] = ${JSON.stringify(ni.template[key])}`);
                }
                else if (propType === 'function')
                {
                    // Dynamic property
                    let callback_index = objrefs.length;
                    if (initOnCreate)
                        closure.create.append(`${ni.name}[${JSON.stringify(key)}] = ${format_callback(callback_index)};`);
                    closure.update.append(`${ni.name}[${JSON.stringify(key)}] = ${format_callback(callback_index)};`);
                    objrefs.push(ni.template[key]);
                }
                else
                {
                    // Unwrap cloaked value
                    let val = ni.template[key];
                    if (val instanceof CloakedValue)
                        val = val.value;

                    // Object property
                    closure.create.append(`${ni.name}[${JSON.stringify(key)}] = ctx.objrefs[${objrefs.length}];`);
                    objrefs.push(val);
                }
            }

            return true;
        }
        
        // Element node?
        if (ni.template.type)
        {
            // Create the element
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = document.createElement(${JSON.stringify(ni.template.type)});`);

            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(key))
                    continue;

                if (key == "id")
                {
                    format_dynamic(ni.template.id, (codeBlock, valueExpr) => {
                        codeBlock.append(`${ni.name}.setAttribute("id", ${valueExpr});`);
                    });
                    continue;
                }

                if (key == "class")
                {
                    format_dynamic(ni.template.class, (codeBlock, valueExpr) => {
                        codeBlock.append(`${ni.name}.setAttribute("class", ${valueExpr});`);
                    });
                    continue;
                }

                if (key.startsWith("class_"))
                {
                    let className = camel_to_dash(key.substring(6));

                    format_dynamic(ni.template[key], (codeBlock, valueExpr) => {
                        codeBlock.append(`helpers.setNodeClass(${ni.name}, ${JSON.stringify(className)}, ${valueExpr});`);
                    });
                    continue;
                }

                if (key == "style")
                {
                    format_dynamic(ni.template.style, (codeBlock, valueExpr) => {
                        codeBlock.append(`${ni.name}.setAttribute("style", ${valueExpr});`);
                    });
                    continue;
                }

                if (key.startsWith("style_"))
                {
                    let styleName = camel_to_dash(key.substring(6));
                    format_dynamic(ni.template[key], (codeBlock, valueExpr) => {
                        codeBlock.append(`helpers.setNodeStyle(${ni.name}, ${JSON.stringify(styleName)}, ${valueExpr});`);
                    });
                    continue;
                }

                if (key == "show")
                {
                    if (ni.template.show instanceof Function)
                    {
                        closure.addLocal(`${ni.name}_prev_display`);
                        format_dynamic(ni.template[key], (codeBlock, valueExpr) => {
                            codeBlock.append(`${ni.name}_prev_display = helpers.setNodeDisplay(${ni.name}, ${valueExpr}, ${ni.name}_prev_display);`);
                        });
                    }
                    else
                    {
                        if (!ni.template.show)
                            closure.create.append(`${ni.name}.style.display = 'none';`);
                    }
                    continue;
                }

                if (key.startsWith("attr_"))
                {
                    let attrName = camel_to_dash(key.substring(5));

                    format_dynamic(ni.template[key], (codeBlock, valueExpr) => {
                        codeBlock.append(`${ni.name}.setAttribute(${JSON.stringify(attrName)}, ${valueExpr});`);
                    });
                    continue;
                }

                if (key == "text")
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
                    continue;
                }


                throw new Error(`Unknown template object key: ${key}`);
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
                closure.create.append(`${ni.name}.append(${ni.spreadChildDomNodes(initOnCreate)});`);
            }
        }

        return true;

        function process_common_property(key)
        {
            if (is_known_property(key))
                return true;

            if (key == "export")
            {
                if (!closure.exports)
                    throw new Error("'export' can't be used inside 'foreach'");
                if (typeof(ni.template.export) !== 'string')
                    throw new Error("'export' must be a string");
                if (closure.exports.has(ni.template.export))
                    throw new Error(`duplicate export name '${ni.template.export}'`);
                closure.exports.set(ni.template.export, ni.name);
                return true;
            }

            if (key == "bind")
            {
                if (!closure.bindings)
                    throw new Error("'bind' can't be used inside 'foreach'");
                if (typeof(ni.template.bind) !== 'string')
                    throw new Error("'bind' must be a string");
                if (closure.bindings.has(ni.template.export))
                    throw new Error(`duplicate bind name '${ni.template.bind}'`);

                // Remember binding
                closure.bindings.set(ni.template.bind, true);

                // Generate it
                closure.create.append(`model[${JSON.stringify(ni.template.bind)}] = ${ni.name};`);
                return true;
            }

            if (key.startsWith("on_"))
            {
                let eventName = key.substring(3);
                if (!(ni.template[key] instanceof Function))
                    throw new Error(`event handler for '${key}' is not a function`);

                // create a variable name for the listener
                if (!ni.listeners)
                    ni.listenerCount = 0;
                ni.listenerCount++;
                let listener_name = `${ni.name}_ev${ni.listenerCount}`;
                closure.addLocal(listener_name);

                // Add listener
                closure.create.append(`${listener_name} = helpers.addEventListener(model, ${ni.name}, ${JSON.stringify(eventName)}, ctx.objrefs[${objrefs.length}]);`);
                objrefs.push(ni.template[key]);
                return true;
            }

            return false;
        }

        function is_known_property(key)
        {
            if (key == "type" || key == "childNodes" || key == "if" || key == "elseif" || key == "else" || key == "foreach")
                return true;
            if (ni.isItemNode)
            {
                if (key == "index_sensitive")
                    return true;
                if (key == "array_sensitive")
                    return true;
                if (key == "item_sensitive")
                    return true;
            }
            return false;
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
                if (initOnCreate)
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
            closure.update.append(`${ni.name}_select(${ni.name}_resolve());`);

            // Generate code to create initially selected branch
            closure.addLocal(`${ni.name}_branch`);
            if (initOnCreate)
            {
                closure.create.append(`${ni.name}_branch = ${ni.name}_resolve();`);
                closure.create.append(`${ni.name}_branches[${ni.name}_branch].create();`);
            }
            else
            {
                closure.addLocal(`${ni.name}_placeholder`);
                closure.create.append(`${ni.name}_placeholder = document.createComment(" if place holder");`);
            }

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

            // Generate function to switch branches
            let multiRoot = ni.conditionGroup.some(x => x.isMultiRoot);
            let fn = closure.addFunction(`${ni.name}_select`, ['branch']);
            if (!initOnCreate)
            {
                fn.code.append(`if (${ni.name}_placeholder)`);
                fn.code.append(`{`);
                fn.code.append(`  ${ni.name}_branch = branch;`);
                fn.code.append(`  ${ni.name}_branches[branch].create();`);
                if (multiRoot)
                    fn.code.append(`  ${ni.name}_placeholder.replaceWith(...[${ni.spreadDomNodes(false)}]);`);
                else
                    fn.code.append(`  ${ni.name}_placeholder.replaceWith(${ni.spreadDomNodes(false)});`);
                fn.code.append(`  ${ni.name}_placeholder = null;`);
                fn.code.append(`  return;`);
                fn.code.append(`}`);
            }
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
                    prolog.append(ln.renderDestroy());
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
            itemClosure.callback_args = "model, itemCtx.item, itemCtx";
            itemClosure.outer = "itemCtx";
            let saveInitOnCreate = initOnCreate;
            initOnCreate = true;
            compileNodeToClosure(itemClosure, ni_item);
            initOnCreate = saveInitOnCreate;
            itemClosure.appendTo(itemClosureFn.code);

            // Create the "foreach" manager
            closure.addLocal(`${ni.name}_manager`);
            closure.create.append(`${ni.name}_manager = new helpers.ForEachManager({`);
            closure.create.append(`  item_constructor: ${ni.name}_item_constructor,`);
            closure.create.append(`  model: model,`);
            if (closure.outer)
                closure.create.append(`  outer: ${closure.outer},`);
            closure.create.append(`  multi_root_items: ${!!ni_item.isMultiRoot},`);
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
                if (initOnCreate)
                    closure.create.append(`${ni.name}_manager.loadItems(${format_callback(objref_index)});`);
                else
                    closure.create.append(`${ni.name}_manager.loadItems([]]);`);
                closure.update.append(`${ni.name}_manager.updateItems(${format_callback(objref_index)});`);
            }
        }
    }    
}



export function compileTemplate(rootTemplate)
{
    // Compile code
    let code = compileTemplateCode(rootTemplate);
    console.log(code.code);

    // Put it in a function
    let templateFunction = new Function("ctx", "helpers", "model", code.code);

    // Wrap it in a constructor function
    let templateConstructor = function(model)
    {
        return templateFunction(code.ctx, TemplateHelpers, model);
    }

    // Store meta data about the component on the function since we need this before 
    // construction
    templateConstructor.isMultiRoot = code.isMultiRoot;

    return templateConstructor;
}