import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CloakedValue} from "./CloakedValue.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";
import { TemplateNode } from "./TemplateNode.js";


export function compileTemplateCode(rootTemplate, copts)
{
    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Every dynamic property gets a variable named pNNN where n increments
    // using this variable
    let prevId = 1;

    // Any callbacks, arrays etc... referenced directly by the template
    // will be stored here and passed back to the compile code via refs
    let refs = [];

    let rootClosure = null;

    // Create root node info        
    let rootTemplateNode = new TemplateNode(rootTemplate);

    // Set default options
    copts = Object.assign({
        initOnCreate: true,
    }, copts);

    // Storarge for export and bindings
    let exports = new Map();


    let closure = create_node_closure(rootTemplateNode, true);


    // Return the code and context
    return { 
        code: closure.toString(), 
        isSingleRoot: rootTemplateNode.isSingleRoot,
        refs,
    }

    // Emit a node closure (ie: node, child nodes, destroy, update
    // root nodes and exported api).
    function create_node_closure(ni, isRootTemplate)
    {
        // Dispatch table to handle compiling different node types
        let node_kind_handlers = {
            emit_text_node,
            emit_html_node,
            emit_dynamic_text_node,
            emit_comment_node,
            emit_fragment_node,
            emit_element_node,
            emit_integrated_node,
            emit_component_node,
        }

        // Setup closure functions
        let closure = new ClosureBuilder();
        closure.create = closure.addFunction("create").code;
        closure.bind = closure.addFunction("bind").code;
        closure.update = closure.addFunction("update").code;
        closure.unbind = closure.addFunction("unbind").code;
        closure.destroy = closure.addFunction("destroy").code;
        let rebind;
        if (isRootTemplate)
            rebind = closure.addFunction("rebind").code;
        let bindings = new Map();

        // Create model variable
        if (isRootTemplate)
        {
            rootClosure = closure;
            rootClosure.code.append(`let model = context.model;`);
        }

        // Call create function
        closure.code.append(`create();`);
            
        // Render code
        emit_node(ni);

        // Render destroy code
        for (let ln of ni.enumLocalNodes())
        {
            renderDestroy(ln);
        }

        // Bind/unbind
        if (!closure.bind.closure.isEmpty)
        {
            closure.create.append(`bind();`);
            closure.destroy.closure.addProlog().append(`unbind();`);
        }

        let otherExports = []

        // Single root
        if (ni.isSingleRoot)
            otherExports.push(`  get rootNode() { return ${ni.spreadDomNodes()}; },`);

        // Root context?
        if (isRootTemplate)
        {
            otherExports.push(`  context,`);

            if (ni == rootTemplateNode)
            {
                exports.forEach((value, key) => 
                    otherExports.push(`  get ${key}() { return ${value}; },`));
            }

            if (closure.getFunction('bind').isEmpty)
            {
                rebind.append(`model = context.model`);
            }
            else
            {
                rebind.append(`if (model != context.model)`)
                rebind.braced(() => {
                    rebind.append(`unbind();`);
                    rebind.append(`model = context.model`);
                    rebind.append(`bind();`);
                });
            }
            otherExports.push(`  rebind,`);
        }
        else
        {
            otherExports.push(`  bind,`);
            otherExports.push(`  unbind,`);
        }


        // Render API to the closure
        closure.code.append([
            `return { `,
            `  update,`,
            `  destroy,`,
            `  get rootNodes() { return [ ${ni.spreadDomNodes()} ]; },`,
            `  isSingleRoot: ${ni.isSingleRoot},`,
            ...otherExports,
            `};`]);

        return closure;

        function addNodeLocal(ni)
        {
            if (ni.template.export)
                rootClosure.addLocal(ni.name);
            else
                closure.addLocal(ni.name);
        }


        // Sometimes we need a temp variable.  This function
        // adds it when needed
        function need_update_temp()
        {
            if (!closure.update.temp_declared)
            {
                closure.update.temp_declared = true;
                closure.update.append(`let temp;`);
            }
        }

        // Recursively emit a node from a template
        function emit_node(ni)
        {
            // Assign it a name
            ni.name = `n${nodeId++}`;

            // Dispatch to kind handler
            node_kind_handlers[`emit_${ni.kind}_node`](ni);
        }

        // Emit a static 'text' node
        function emit_text_node(ni)
        {
            addNodeLocal(ni);
            closure.create.append(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
        }

        // Emit a static 'html' node
        function emit_html_node(ni)
        {
            if (ni.nodes.length == 0)
                return;

            // Emit
            addNodeLocal(ni);
            if (ni.nodes.length == 1)
            {
                closure.create.append(`${ni.name} = refs[${refs.length}].cloneNode(true);`);
                refs.push(ni.nodes[0]);
            }
            else
            {
                closure.create.append(`${ni.name} = refs[${refs.length}].map(x => x.cloneNode(true));`);
                refs.push(ni.nodes);
            }
        }

        // Emit a 'dynamic-text' onde
        function emit_dynamic_text_node(ni)
        {
            // Create
            addNodeLocal(ni);
            let prevName = `p${prevId++}`;
            closure.addLocal(prevName);
            if (copts.initOnCreate)
                closure.create.append(`${ni.name} = helpers.createTextNode(${prevName} = ${format_callback(refs.length)});`);
            else
                closure.create.append(`${ni.name} = helpers.createTextNode("");`);

            // Update
            need_update_temp();
            closure.update.append(`temp = ${format_callback(refs.length)};`);
            closure.update.append(`if (temp !== ${prevName})`)
            closure.update.append(`  ${ni.name} = helpers.setNodeText(${ni.name}, ${prevName} = ${format_callback(refs.length)});`);

            // Store the callback as a ref
            refs.push(ni.template);
        }

        // Emit a 'comment' node
        function emit_comment_node(ni)
        {
            addNodeLocal(ni);
            if (ni.template.text instanceof Function)
            {
                // Dynamic comment

                // Create
                let prevName = `p${prevId++}`;
                closure.addLocal(prevName);
                if (copts.initOnCreate)
                    closure.create.append(`${ni.name} = document.createComment(${prevName} = ${format_callback(refs.length)});`);
                else
                    closure.create.append(`${ni.name} = document.createComment("");`);

                // Update
                need_update_temp();
                closure.update.append(`temp = ${format_callback(refs.length)};`);
                closure.update.append(`if (temp !== ${prevName})`);
                closure.update.append(`  ${ni.name}.nodeValue = ${prevName} = temp;`);

                // Store callback
                refs.push(ni.template.text);
            }
            else
            {
                // Static
                closure.create.append(`${ni.name} = document.createComment(${JSON.stringify(ni.template.text)});`);
            }
        }

        // Emit an 'integrated' component node
        function emit_integrated_node(ni)
        {
            // Emit sub-nodes
            let nodeConstructors = [];
            let has_bindings = false;
            if (ni.integrated.nodes)
            {
                for (let i=0; i<ni.integrated.nodes.length; i++)
                {
                    // Create the sub-template node
                    let ni_sub = ni.integrated.nodes[i];
                    ni_sub.name = `n${nodeId++}`;

                    // Emit it
                    let sub_closure = create_node_closure(ni_sub, false);

                    // Track if the closure has any bindings
                    let fnBind = sub_closure.getFunction("bind");
                    if (!fnBind.isEmpty)
                        has_bindings = true;

                    // Append to our closure
                    let nodeConstructor = `${ni_sub.name}_constructor_${i+1}`;
                    let itemClosureFn = closure.addFunction(nodeConstructor, [ ]);
                    sub_closure.appendTo(itemClosureFn.code);

                    nodeConstructors.push(nodeConstructor);
                }
            }

            if (ni.integrated.wantsUpdate)
            {
                closure.update.append(`${ni.name}.update()`);
            }

            if (has_bindings)
            {
                closure.bind.append(`${ni.name}.bind()`);
                closure.unbind.append(`${ni.name}.unbind()`);
            }

            let data_index = -1;
            if (ni.integrated.data)
            {
                data_index = refs.length;
                refs.push(ni.integrated.data);
            }

            // Create integrated component
            addNodeLocal(ni);
            closure.create.append(
                `${ni.name} = new refs[${refs.length}]({`,
                `  context,`,
                `  initOnCreate: ${JSON.stringify(copts.initOnCreate)},`,
                `  data: ${ni.integrated.data ? `refs[${data_index}]` : `null`},`,
                `  nodes: [ ${nodeConstructors.join(", ")} ],`,
                `});`
            );
            refs.push(ni.template.type);

            // Process common properties
            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(ni, key))
                    continue;

                throw new Error(`Unknown element template key: ${key}`);
            }
        
        }

        
        // Emit a 'component' node
        function emit_component_node(ni)
        {
            // Create component
            addNodeLocal(ni);
            closure.create.append(`${ni.name} = new refs[${refs.length}]();`);
            refs.push(ni.template.type);

            let slotNames = new Set(ni.template.type.slots ?? []);

            let auto_update = ni.template.update === "auto";
            let auto_modified_name = false;

            // Process all keys
            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(ni, key))
                    continue;

                // Ignore for now
                if (key == "update")
                {
                    continue;
                }

                // Compile value as a template
                if (slotNames.has(key))
                {
                    if (ni.template[key] === undefined)
                        continue;

                    // Emit the template node
                    let propTemplate = new TemplateNode(ni.template[key]);
                    emit_node(propTemplate);
                    if (propTemplate.isSingleRoot)
                        closure.create.append(`${ni.name}${prop(key)}.content = ${propTemplate.name};`);
                    else
                        closure.create.append(`${ni.name}${prop(key)}.content = [${propTemplate.spreadDomNodes()}];`);
                    continue;
                }

                // All other properties, assign to the object
                let propType = typeof(ni.template[key]);
                if (propType == 'string' || propType == 'number' || propType == 'boolean')
                {
                    // Simple literal property
                    closure.create.append(`${ni.name}${prop(key)} = ${JSON.stringify(ni.template[key])}`);
                }
                else if (propType === 'function')
                {
                    // Dynamic property

                    if (auto_update && !auto_modified_name)
                    {
                        auto_modified_name = `${ni.name}_mod`;
                        closure.update.append(`let ${auto_modified_name} = false;`);
                    }

                    // Create
                    let prevName = `p${prevId++}`;
                    closure.addLocal(prevName);
                    let callback_index = refs.length;
                    if (copts.initOnCreate)
                        closure.create.append(`${ni.name}${prop(key)} = ${prevName} = ${format_callback(callback_index)};`);

                    // Update
                    need_update_temp();
                    closure.update.append(`temp = ${format_callback(callback_index)};`);
                    closure.update.append(`if (temp !== ${prevName})`);
                    if (auto_update)
                    {
                        closure.update.append(`{`);
                        closure.update.append(`  ${auto_modified_name} = true;`);
                    }

                    closure.update.append(`  ${ni.name}${prop(key)} = ${prevName} = temp;`);

                    if (auto_update)
                        closure.update.append(`}`);

                    // Store callback
                    refs.push(ni.template[key]);
                }
                else
                {
                    // Unwrap cloaked value
                    let val = ni.template[key];
                    if (val instanceof CloakedValue)
                        val = val.value;

                    // Object property
                    closure.create.append(`${ni.name}${prop(key)} = refs[${refs.length}];`);
                    refs.push(val);
                }
            }

            // Generate deep update
            if (ni.template.update)
            {
                if (typeof(ni.template.update) === 'function')
                {
                    closure.update.append(`if (${format_callback(refs.length)})`);
                    closure.update.append(`  ${ni.name}.update();`);
                    refs.push(ni.template.update);
                }
                else
                {
                    if (auto_update)
                    {
                        if (auto_modified_name)
                        {
                            closure.update.append(`if (${auto_modified_name})`);
                            closure.update.append(`  ${ni.name}.update();`);
                        }
                    }
                    else
                    {
                        closure.update.append(`${ni.name}.update();`);
                    }
                }
            }
        }

        // Emit a 'fragment' noe
        function emit_fragment_node(ni)
        {
            emit_child_nodes(ni);
        }

        // Emit an 'element' node
        function emit_element_node(ni)
        {
            // Work out namespace
            let save_xmlns = closure.current_xmlns;
            let xmlns = ni.template.xmlns;
            if (xmlns === undefined && ni.template.type == 'svg')
            {
                xmlns = "http://www.w3.org/2000/svg";
            }
            if (xmlns == null)
                xmlns = closure.current_xmlns;

            // Create the element
            addNodeLocal(ni);
            if (!xmlns)
                closure.create.append(`${ni.name} = document.createElement(${JSON.stringify(ni.template.type)});`);
            else
            {
                closure.current_xmlns = xmlns;
                closure.create.append(`${ni.name} = document.createElementNS(${JSON.stringify(xmlns)}, ${JSON.stringify(ni.template.type)});`);
            }

            //closure.create.append(`${ni.name}.dataset.coId = context.$instanceId + "-${ni.name}";`)

            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(ni, key))
                    continue;

                if (key == "id")
                {
                    format_dynamic(ni.template.id, (valueExpr) => `${ni.name}.setAttribute("id", ${valueExpr});`);
                    continue;
                }

                if (key == "class")
                {
                    format_dynamic(ni.template.class, (valueExpr) => `${ni.name}.setAttribute("class", ${valueExpr});`);
                    continue;
                }

                if (key.startsWith("class_"))
                {
                    let className = camel_to_dash(key.substring(6));

                    format_dynamic(ni.template[key], (valueExpr) => `helpers.setNodeClass(${ni.name}, ${JSON.stringify(className)}, ${valueExpr})`);
                    continue;
                }

                if (key == "style")
                {
                    format_dynamic(ni.template.style, (valueExpr) => `${ni.name}.setAttribute("style", ${valueExpr});`);
                    continue;
                }

                if (key.startsWith("style_"))
                {
                    let styleName = camel_to_dash(key.substring(6));
                    format_dynamic(ni.template[key], (valueExpr) => `helpers.setNodeStyle(${ni.name}, ${JSON.stringify(styleName)}, ${valueExpr})`);
                    continue;
                }

                if (key == "display")
                {
                    if (ni.template.display instanceof Function)
                    {
                        closure.addLocal(`${ni.name}_prev_display`);
                        format_dynamic(ni.template[key], (valueExpr) => `${ni.name}_prev_display = helpers.setNodeDisplay(${ni.name}, ${valueExpr}, ${ni.name}_prev_display)`);
                    }
                    else
                    {
                        if (typeof(ni.template.display) == 'string')
                            closure.create.append(`${ni.name}.style.display = '${ni.template.display}';`);
                        else if (ni.template.display === false || ni.template.display === null || ni.template.display === undefined)
                            closure.create.append(`${ni.name}.style.display = 'none';`);
                        else if (ni.template.display !== true)
                            throw new Error("display property must be set to string, true, false, or null")
                    }
                    continue;
                }

                if (key.startsWith("attr_"))
                {
                    let attrName = key.substring(5);
                    if (!closure.current_xmlns)
                        attrName = camel_to_dash(attrName);

                    format_dynamic(ni.template[key], (valueExpr) => `${ni.name}.setAttribute(${JSON.stringify(attrName)}, ${valueExpr})`);
                    continue;
                }

                if (key == "text")
                {
                    if (ni.template.text instanceof Function)
                    {
                        format_dynamic(ni.template.text, (valueExpr) => `helpers.setElementText(${ni.name}, ${valueExpr})`);
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

                throw new Error(`Unknown element template key: ${key}`);
            }

            // Emit child nodes
            emit_child_nodes(ni);
            
            // Add all the child nodes to this node
            if (ni.childNodes?.length)
            {
                closure.create.append(`${ni.name}.append(${ni.spreadChildDomNodes()});`);
            }
            closure.current_xmlns = save_xmlns;
        }

        // Emit the child nodes of an element or fragment node
        function emit_child_nodes(ni)
        {
            // Child nodes?
            if (!ni.childNodes)
                return;

            // Create the child nodes
            for (let i=0; i<ni.childNodes.length; i++)
            {
                emit_node(ni.childNodes[i]);
            }
        }

        // Process properties common to html elements and components
        function process_common_property(ni, key)
        {
            if (is_known_property(key))
                return true;

            if (key == "export")
            {
                if (typeof(ni.template.export) !== 'string')
                    throw new Error("'export' must be a string");
                if (exports.has(ni.template.export))
                    throw new Error(`duplicate export name '${ni.template.export}'`);
                exports.set(ni.template.export, ni.name);
                return true;
            }

            if (key == "bind")
            {
                if (!bindings)
                    throw new Error("'bind' can't be used inside 'foreach'");
                if (typeof(ni.template.bind) !== 'string')
                    throw new Error("'bind' must be a string");
                if (bindings.has(ni.template.export))
                    throw new Error(`duplicate bind name '${ni.template.bind}'`);

                // Remember binding
                bindings.set(ni.template.bind, true);

                // Generate it
                closure.bind.append(`model${prop(ni.template.bind)} = ${ni.name};`);
                closure.unbind.append(`model${prop(ni.template.bind)} = null;`);
                return true;
            }

            if (key.startsWith("on_"))
            {
                let eventName = key.substring(3);
                if (!(ni.template[key] instanceof Function))
                    throw new Error(`event handler for '${key}' is not a function`);

                // create a variable name for the listener
                if (!ni.listenerCount)
                    ni.listenerCount = 0;
                ni.listenerCount++;
                let listener_name = `${ni.name}_ev${ni.listenerCount}`;
                closure.addLocal(listener_name);

                // Add listener
                closure.create.append(`${listener_name} = helpers.addEventListener(() => model, ${ni.name}, ${JSON.stringify(eventName)}, refs[${refs.length}]);`);
                refs.push(ni.template[key]);
                return true;
            }

            if (key == "debug_create")
            {
                if (typeof(ni.template[key]) === 'function')
                {
                    closure.create.append(`if (${format_callback(refs.length)})`);
                    closure.create.append(`  debugger;`);
                    refs.push(ni.template[key]);
                }
                else if (ni.template[key])
                    closure.create.append("debugger;");
                return true;
            }
            if (key == "debug_update")
            {
                if (typeof(ni.template[key]) === 'function')
                {
                    closure.update.append(`if (${format_callback(refs.length)})`);
                    closure.update.append(`  debugger;`);
                    refs.push(ni.template[key]);
                }
                else if (ni.template[key])
                    closure.update.append("debugger;");
                return true;
            }

            return false;
        }

        function is_known_property(key)
        {
            return key == "type" || key == "childNodes" || key == "xmlns";
        }

        function format_callback(index)
        {
            return `refs[${index}].call(model, model, context)`
        }

        // Helper to format a dynamic value on a node (ie: a callback)
        function format_dynamic(value, formatter)
        {
            if (value instanceof Function)
            {
                let prevName = `p${prevId++}`;
                closure.addLocal(prevName);
                
                // Render the update code
                let code = formatter();

                // Append the code to both the main code block (to set initial value) and to 
                // the update function.
                if (copts.initOnCreate)
                {
                    closure.create.append(`${prevName} = ${format_callback(refs.length)};`);
                    closure.create.append(`${formatter(prevName)};`);
                }

                need_update_temp();
                closure.update.append(`temp = ${format_callback(refs.length)};`);
                closure.update.append(`if (temp !== ${prevName})`);
                closure.update.append(`  ${formatter(prevName + " = temp")};`);

                // Store the callback in the context callback array
                refs.push(value);
            }
            else
            {
                // Static value, just output it directly
                closure.create.append(formatter(JSON.stringify(value)));
            }
        }

        function renderDestroy(ni)
        {
            if (ni.isComponent || ni.isIntegrated)
            {
                closure.destroy.append(`${ni.name}.destroy();`);
            }            

            if (ni.listenerCount)
            {
                for (let i=0; i<ni.listenerCount; i++)
                {
                    closure.destroy.append(`${ni.name}_ev${i+1}?.();`);
                    closure.destroy.append(`${ni.name}_ev${i+1} = null;`);
                }
            }

            if (ni.kind == 'html' && ni.nodes.length == 0)
                return;

            closure.destroy.append(`${ni.name} = null;`);
        }
    }
}


let _nextInstanceId = 1;

export function compileTemplate(rootTemplate, compilerOptions)
{
    // Compile code
    let code = compileTemplateCode(rootTemplate, compilerOptions);
    //console.log(code.code);

    // Put it in a function
    let templateFunction = new Function("refs", "helpers", "context", code.code);

    // Wrap it in a constructor function
    let compiledTemplate = function(context)
    {
        if (!context)
            context = {};
        context.$instanceId = _nextInstanceId++;
        return templateFunction(code.refs, TemplateHelpers, context ?? {});
    }

    // Store meta data about the component on the function since we need this before 
    // construction
    compiledTemplate.isSingleRoot = code.isSingleRoot;

    return compiledTemplate;
}

let rxIdentifier = /^[a-zA-Z$][a-zA-Z0-9_$]*$/;

function prop(key)
{
    if (key.match(rxIdentifier))
        return `.${key}`;
    else
        return `[${JSON.stringify(key)}]`;
}