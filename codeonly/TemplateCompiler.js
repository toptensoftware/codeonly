import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";

class NodeInfo
{
    constructor(parent, name, template, isItemNode)
    {
        this.parent = parent;
        this.name =  name;
        this.template = template;
        this.childNodes = [];
        this.isItemNode = isItemNode;
    }

    get isMultiRoot()
    {
        return this.isFragment || this.isForEach;
    }

    get isFragment()
    {
        if (typeof(this.template) != 'object')
            return false;
        if (this instanceof HtmlString)
            return false;
        if (this instanceof Function)
            return false;
        return !this.template.type;
    }

    get isForEach()
    {
        return !!this.template.foreach && !this.isItemNode;
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

    *enumChildDomNodes()
    {
        for (let i=0; i<this.childNodes.length; i++)
        {
            yield *this.childNodes[i].enumDomNodes();
        }
    }

    // Generate code to list out all this nodes dom nodes
    *enumDomNodes(excludeConditional)
    {
        if (this.isForEach)
        {
            yield `...${this.name}_manager.enumDomNodes()`;
            return;
        }

        if (this.isConditional)
        {
            if (this.isFragment)
            {
                yield `...[${this.name}_included ? [${Array.from(this.enumDomNodes(true)).join(", ")}] : [${this.name}_placeholder])`;
            }
            else
            {
                yield `(${this.name}_included ? ${this.name} : ${this.name}_placeholder)`;
            }
            return;
        }

        if (this.isFragment)
        {
            for (let i=0; i<this.childNodes.length; i++)
            {
                yield *this.childNodes[i].enumNodes();
            }
            return;
        }

        yield this.name;
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

    renderYieldRootNodes(code)
    {
        if (!this.isMultiRoot)
        {
            code.appendLine(`yield ${this.name};`);
            return;
        }
        if (this.isForEach)
        {
            code.appendLine(`yield ${this.name};`);
            code.appendLine(`for (let i=0, len=${this.name}_items.length; i < len; i++)`);
            code.appendLine(`  yield ${this.name}_items[i].item;`);
        }
        if (this.isFragment)
        {
            if (this.isConditional)
            {
                code.appendLine(`if (${this.name}_included)`);
                code.braced(() => {
                    this.childNodes.forEach(x => x.renderYieldRootNodes(code));   
                });
                code.appendLine(`else`);
                code.braced(() => {
                    code.appendLine(`yield ${this.name}[0];`);
                })
            }
            else
            {
                this.childNodes.forEach(x => x.renderYieldRootNodes(code));   
            }
            return;
        }
    }
}

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
        rnf.code.appendLine(`return [${Array.from(ni.enumDomNodes()).join(", ")}];`);

        // Return interface to the closure
        if (ni.isItemNode)
        {
            closure.code.appendLines([
                `return { `,
                `  get rootNodes() { return getRootNodes(); },`,
                `  get itemCtx() { return itemCtx; },`,
                `  update,`,
                `  destroy`,
                `};`]);
        }
        else
        {
            closure.code.appendLines([
                `return { `,
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
            if (ni.childNodes.length && !ni.isFragment)
            {
                closure.create.appendLine(`${ni.name}.append(${Array.from(ni.enumChildDomNodes()).join(", ")});`);
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
            // Create a node item for the child
            let child_item_ni = new NodeInfo(null, `i${child_ni.name}`, child_ni.template, true);

            // Create a construction function for the items
            let itemClosureFn = closure.addFunction(`${child_ni.name}_item_constructor`, [ "itemCtx" ]);
            let itemClosure = new ClosureBuilder();
            itemClosure.callback_args = "ctx.model, itemCtx.item, itemCtx";
            itemClosure.outer_item = "outer";
            compileNodeToClosure(itemClosure, child_item_ni);
            itemClosure.appendTo(itemClosureFn.code);

            // Create the "foreach" manager
            closure.create.appendLine(`let ${child_ni.name}_manager = new helpers.ForEachManager({`);
            closure.create.appendLine(`  item_constructor: ${child_ni.name}_item_constructor,`);
            closure.create.appendLine(`  model: ctx.model,`);
            if (closure.outer_item)
                closure.create.appendLine(`  outer_item: ${closure.outer_item},`);
            if (child_item_ni.isMultiRoot)
                closure.create.appendLine(`  multi_root_items: true,`);
            if (child_ni.item_key)
            {
                let itemkey_index = objrefs.length;
                objrefs.push(child_ni.template.item_key);
                closure.create.appendLine(`  item_key: ctx.objrefs[${itemkey_index}],`);
            }
            if (child_ni.condition)
            {
                let condition_index = objrefs.length;
                objrefs.push(child_ni.template.condition);
                closure.create.appendLine(`  condition: ctx.objrefs[${condition_index+1}],`);
            }
            closure.create.appendLine(`});`);

            let objref_index = objrefs.length;
            objrefs.push(child_ni.template.foreach);
            if (!(child_ni.template.foreach instanceof Function))
            {
                closure.create.appendLine(`${child_ni.name} = ${child_ni.name}_manager.loadItems(ctx.objrefs[${objref_index}]);`);
            }
            else
            {
                closure.create.appendLine(`${child_ni.name} = ${child_ni.name}_manager.loadItems(${format_callback(objref_index)});`);
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