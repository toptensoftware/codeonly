import { camel_to_dash } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { CloakedValue} from "./CloakedValue.js";
import { CodeBuilder } from "./CodeBuilder.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";
import { TemplateNode } from "./TemplateNode.js";


export function compileTemplateCode(rootTemplate, rootCopts)
{
    // Every node in the template will get an id, starting at 1.
    let nodeId = 1;

    // Every dynamic property gets a variable named pNNN where n increments
    // using this variable
    let prevId = 1;

    // Any callbacks, arrays etc... referenced directly by the template
    // will be stored here and passed back to the compile code via refs
    let refs = [];

    // Create root node info        
    let rootTemplateNode = new TemplateNode(rootTemplate);

    // Compile root node to closure
    let rootClosure = compileNodeToClosure(rootTemplateNode, Object.assign(
        {
            initOnCreate: true,
            callback_args: "model, model",
        }, 
        rootCopts,
    ));

    // Return the code and context
    return { 
        code: rootClosure.toString(), 
        isSingleRoot: rootTemplateNode.isSingleRoot,
        refs,
    }

    function compileNodeToClosure(ni, copts)
    {
        // Create a closure
        let closure = new ClosureBuilder();

        // Dispatch table to handle compiling different node types
        let node_kind_handlers = {
            compile_text_node,
            compile_html_node,
            compile_dynamic_text_node,
            compile_comment_node,
            compile_fragment_node,
            compile_element_node,
            compile_integrated_node,
            compile_component_node,
        }

        // Setup closure functions
        closure.update = closure.addFunction("update").code;
        closure.destroy = closure.addFunction("destroy").code;
        closure.create = closure.code;

        // Storarge for export and bindings
        closure.exports = new Map();
        closure.bindings = new Map();

        // Render code
        compile_node(ni);

        // Render destroy code
        for (let ln of ni.enumLocalNodes())
        {
            closure.destroy.append(ln.renderDestroy());
        }

        // Render exports
        let exports = [];
        closure.exports.forEach((value, key) => exports.push(`  get ${key}() { return ${value}; },`));

        // Render API to the closure
        closure.code.append([
            `return { `,
            `  isSingleRoot: ${ni.isSingleRoot},`,
            ni.isSingleRoot ? `  get rootNode() { return ${ni.spreadDomNodes()}; },` : null,
            `  get rootNodes() { return [ ${ni.spreadDomNodes()} ]; },`,
            `  update,`,
            `  destroy,`,
            ...exports,
            `};`]);

        // Done
        return closure;

        function need_update_temp()
        {
            if (!closure.update.temp_declared)
            {
                closure.update.temp_declared = true;
                closure.update.append(`let temp;`);
            }
        }

        // Recursively compile a node from a template
        function compile_node(ni)
        {
            // Assign it a name
            ni.name = `n${nodeId++}`;

            // Dispatch to kind compiler
            node_kind_handlers[`compile_${ni.kind}_node`](ni);
        }

        // Compile a static 'text' node
        function compile_text_node(ni)
        {
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = document.createTextNode(${JSON.stringify(ni.template)});`);
        }

        // Compile a static 'html' node
        function compile_html_node(ni)
        {
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = document.createElement("SPAN");`);
            closure.create.append(`${ni.name}.innerHTML = ${JSON.stringify(ni.template.html)};`);
        }

        // Compile a 'dynamic-text' onde
        function compile_dynamic_text_node(ni)
        {
            // Create
            closure.addLocal(ni.name);
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

        // Compile a 'comment' node
        function compile_comment_node(ni)
        {
            closure.addLocal(ni.name);
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

        // Compile an 'integrated' component node
        function compile_integrated_node(ni)
        {
            // Compile sub-nodes
            let nodeConstructors = [];
            if (ni.integrated.nodes)
            {
                for (let i=0; i<ni.integrated.nodes.length; i++)
                {
                    // Create the sub-template node
                    let ni_sub = ni.integrated.nodes[i];
                    ni_sub.name = `n${nodeId++}`;

                    // Compile it
                    let sub_closure = compileNodeToClosure(ni_sub, copts);

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

            let data_index = -1;
            if (ni.integrated.data)
            {
                data_index = refs.length;
                refs.push(ni.integrated.data);
            }

            // Create component
            closure.addLocal(ni.name);
            closure.create.append(
                `${ni.name} = new refs[${refs.length}]({`,
                `  initOnCreate: ${JSON.stringify(copts.initOnCreate)},`,
                `  data: ${ni.integrated.data ? `refs[${data_index}]` : `null`},`,
                `  nodes: [ ${nodeConstructors.join(", ")} ],`,
                `});`
            );
            refs.push(ni.template.type);
        }

        
        // Compile a 'component' node
        function compile_component_node(ni)
        {
            // Create component
            closure.addLocal(ni.name);
            closure.create.append(`${ni.name} = new refs[${refs.length}]();`);
            refs.push(ni.template.type);

            // Process all keys
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

                    // Create
                    let prevName = `p${prevId++}`;
                    closure.addLocal(prevName);
                    let callback_index = refs.length;
                    if (copts.initOnCreate)
                        closure.create.append(`${ni.name}[${JSON.stringify(key)}] = ${prevName} = ${format_callback(callback_index)};`);

                    // Update
                    need_update_temp();
                    closure.update.append(`temp = ${format_callback(callback_index)};`);
                    closure.update.append(`if (temp !== ${prevName})`);
                    closure.update.append(`  ${ni.name}[${JSON.stringify(key)}] = ${prevName} = temp;`);

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
                    closure.create.append(`${ni.name}[${JSON.stringify(key)}] = refs[${refs.length}];`);
                    refs.push(val);
                }
            }
        }

        // Compile a 'fragment' noe
        function compile_fragment_node(ni)
        {
            compile_child_nodes(ni);
        }

        // Compile an 'element' node
        function compile_element_node(ni)
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
                    format_dynamic(ni.template.id, (valueExpr) => `${ni.name}.setAttribute("id", ${valueExpr})`);
                    continue;
                }

                if (key == "class")
                {
                    format_dynamic(ni.template.class, (valueExpr) => `${ni.name}.setAttribute("class", ${valueExpr})`);
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
                    format_dynamic(ni.template.style, (valueExpr) => `${ni.name}.setAttribute("style", ${valueExpr})`);
                    continue;
                }

                if (key.startsWith("style_"))
                {
                    let styleName = camel_to_dash(key.substring(6));
                    format_dynamic(ni.template[key], (valueExpr) => `helpers.setNodeStyle(${ni.name}, ${JSON.stringify(styleName)}, ${valueExpr})`);
                    continue;
                }

                if (key == "show")
                {
                    if (ni.template.show instanceof Function)
                    {
                        closure.addLocal(`${ni.name}_prev_display`);
                        format_dynamic(ni.template[key], (valueExpr) => `${ni.name}_prev_display = helpers.setNodeDisplay(${ni.name}, ${valueExpr}, ${ni.name}_prev_display)`);
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

            // Compile child nodes
            compile_child_nodes(ni);
            
            // Add all the child nodes to this node
            if (ni.childNodes?.length)
            {
                closure.create.append(`${ni.name}.append(${ni.spreadChildDomNodes(copts.initOnCreate)});`);
            }
        }

        // Compile the child nodes of an element or fragment node
        function compile_child_nodes(ni)
        {
            // Child nodes?
            if (!ni.childNodes)
                return;

            // Create the child nodes
            for (let i=0; i<ni.childNodes.length; i++)
            {
                compile_node(ni.childNodes[i]);
            }
        }

        // Process properties common to html elements and components
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
                closure.create.append(`${listener_name} = helpers.addEventListener(model, ${ni.name}, ${JSON.stringify(eventName)}, refs[${refs.length}]);`);
                refs.push(ni.template[key]);
                return true;
            }

            return false;
        }

        function is_known_property(key)
        {
            return key == "type" || key == "childNodes";
        }

        function format_callback(index)
        {
            return `refs[${index}].call(${copts.callback_args})`
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
    }    
}



export function compileTemplate(rootTemplate, compilerOptions)
{
    // Compile code
    let code = compileTemplateCode(rootTemplate, compilerOptions);
    console.log(code.code);

    // Put it in a function
    let templateFunction = new Function("refs", "helpers", "model", code.code);

    // Wrap it in a constructor function
    let templateConstructor = function(model)
    {
        return templateFunction(code.refs, TemplateHelpers, model);
    }

    // Store meta data about the component on the function since we need this before 
    // construction
    templateConstructor.isSingleRoot = code.isSingleRoot;

    return templateConstructor;
}