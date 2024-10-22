import { camel_to_dash } from "./Utils.js";
import { htmlEncode } from "./htmlEncode.js";
import { HtmlString } from "./HtmlString.js";
import { CloakedValue} from "./CloakedValue.js";
import { ClosureBuilder } from "./ClosureBuilder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";
import { TemplateNode } from "./TemplateNode.js";
import { Environment } from "./Environment.js";
import { member } from "./Utils.js";
import { TemplateLiteralBuilder} from "./TemplateLiteralBuilder.js";


export function compileTemplateCode(rootTemplate, compilerOptions)
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
    let rootTemplateNode = new TemplateNode(rootTemplate, compilerOptions);

    let closure = create_node_closure(rootTemplateNode, true);

    // Return the code and context
    return { 
        code: closure.toString(), 
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
        closure.update = closure.addFunction("update").code;
        closure.render = closure.addFunction("render", [ "w" ]).code;
        closure.destroy = closure.addFunction("destroy").code;

        // Create a template literal builder
        let tlb = new TemplateLiteralBuilder();

        // Create model variable
        if (isRootTemplate)
        {
            rootClosure = closure;
            rootClosure.code.append(`let model = context.model;`);
        }

        // Call initialization functions
        closure.code.append(`create();`);
        closure.code.append(`update();`);
            
        // Render code
        emit_node(ni);


        flushTlb();

        // Render destroy code
        for (let ln of ni.enumLocalNodes())
        {
            renderDestroy(ln);
        }

        // Root context?
        let otherExports = [];
        if (isRootTemplate)
        {
            otherExports.push(`  context,`);
            otherExports.push(`  get html() { return helpers.renderToString(render) },`);
        }


        // Render API to the closure
        closure.code.append([
            `return { `,
            `  render,`,
            `  update,`,
            `  destroy,`,
            ...otherExports,
            `};`]);

        return closure;

        function flushTlb()
        {
            let str = tlb.resolve();
            if (str != "``")
                closure.render.append(`w.write(${str});`);
        }

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
            tlb.text(ni.template);
        }

        // Emit a static 'html' node
        function emit_html_node(ni)
        {
            tlb.raw(ni.html);
        }

        // Emit a 'dynamic-text' node
        function emit_dynamic_text_node(ni)
        {
            tlb.expr(`helpers.rawText(${format_callback(refs.length)})`);
            refs.push(ni.template);
        }

        // Emit a 'comment' node
        function emit_comment_node(ni)
        {
            tlb.raw("<!--");
            if (ni.template.text instanceof Function)
            {
                tlb.text_expr(format_callback(refs.length));
                refs.push(ni.template.text);
            }
            else
            {
                tlb.text(ni.template.text);
            }
            tlb.raw("-->");
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
                    if (!ni_sub)
                    {
                        nodeConstructors.push(null);
                        continue;
                    }
                    ni_sub.name = `n${nodeId++}`;

                    // Emit it
                    let sub_closure = create_node_closure(ni_sub, false);

                    // Append to our closure
                    let nodeConstructor = `${ni_sub.name}_constructor_${i+1}`;
                    let itemClosureFn = closure.addFunction(nodeConstructor, [ ]);
                    sub_closure.appendTo(itemClosureFn.code);

                    nodeConstructors.push(nodeConstructor);
                }
            }

            let data_index = -1;
            if (ni.integrated.data)
            {
                data_index = refs.length;
                refs.push(ni.integrated.data);
            }

            if (ni.integrated.wantsUpdate)
            {
                closure.update.append(`${ni.name}.update()`);
            }

            // Create integrated component
            addNodeLocal(ni);
            closure.create.append(
                `${ni.name} = new refs[${refs.length}]({`,
                `  context,`,
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

            flushTlb();
            closure.render.append(`${ni.name}.render(w);`);
        
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
            flushTlb();
            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(ni, key))
                    continue;

                // Ignore 
                if (key == "update")
                    continue;

                // Compile value as a template
                if (slotNames.has(key))
                {
                    if (ni.template[key] === undefined)
                        continue;

                    // Emit the template node
                    let propTemplate = new TemplateNode(ni.template[key], compilerOptions);
                    emit_node(propTemplate);
                    closure.create.append(`${ni.name}${member(key)}.content = ${propTemplate.name};`);
                    continue;
                }

                // All other properties, assign to the object
                let propType = typeof(ni.template[key]);
                if (propType == 'string' || propType == 'number' || propType == 'boolean')
                {
                    // Simple literal property
                    closure.create.append(`${ni.name}${member(key)} = ${JSON.stringify(ni.template[key])}`);
                }
                else if (propType === 'function')
                {
                    if (auto_update && !auto_modified_name)
                    {
                        auto_modified_name = `${ni.name}_mod`;
                        closure.update.append(`let ${auto_modified_name} = false;`);
                    }

                        // Create
                    let prevName = `p${prevId++}`;
                    closure.addLocal(prevName);
                    let callback_index = refs.length;

                    // Update
                    need_update_temp();
                    closure.update.append(`temp = ${format_callback(callback_index)};`);
                    closure.update.append(`if (temp !== ${prevName})`);
                    if (auto_update)
                    {
                        closure.update.append(`{`);
                        closure.update.append(`  ${auto_modified_name} = true;`);
                    }

                    closure.update.append(`  ${ni.name}${member(key)} = ${prevName} = temp;`);

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
                    closure.create.append(`${ni.name}${member(key)} = refs[${refs.length}];`);
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
                
            closure.render.append(`${ni.name}.render(w);`);
        }

        // Emit a 'fragment' noe
        function emit_fragment_node(ni)
        {
            emit_child_nodes(ni);
        }

        // Emit an 'element' node
        function emit_element_node(ni)
        {
            tlb.raw(`<${ni.template.type}`);

            // Resolve class_* and style_* attributes
            let classList = [];
            let styleList = [];

            for (let key of Object.keys(ni.template))
            {
                // Process properties common to components and elements
                if (process_common_property(ni, key))
                    continue;

                if (key == "id")
                {
                    tlb.raw(` id="`);
                    tlb_dynamic(ni.template.id);
                    tlb.raw(`"`);
                    continue;
                }

                if (key == "class")
                {
                    classList.push({ 
                        name: ni.template[key],
                        condition: true,
                    });
                    continue;
                }

                if (key.startsWith("class_"))
                {
                    classList.push({ 
                        name: camel_to_dash(key.substring(6)), 
                        condition: ni.template[key] 
                    });
                    continue;
                }

                if (key == "style")
                {
                    styleList.push({
                        name: null,
                        value: ni.template[key]
                    });
                    continue;
                }

                if (key.startsWith("style_"))
                {
                    styleList.push({ 
                        name: camel_to_dash(key.substring(6)), 
                        value: ni.template[key] 
                    });
                    continue;
                }

                if (key == "display")
                {
                    if (ni.template.display instanceof Function || 
                        typeof(ni.template.display )== "string")
                    {
                        styleList.push({
                            name: "display",
                            value: ni.template.display,
                        });
                    }
                    else if (ni.template.display === false || ni.template.display === null || ni.template.display === undefined)
                    {
                        styleList.add({
                            name: "display",
                            value: "none",
                        });
                    }
                    else if (ni.template.display !== true)
                        throw new Error("display property must be set to function, string, true, false, or null")

                    continue;
                }

                if (key == "text")
                {
                    continue;
                }

                if (key.startsWith("attr_"))
                {
                    let attrName = key.substring(5);
                    if (attrName == "style" || attrName == "class" || attrName == "id")
                        throw new Error(`Incorrect attribute: use '${attrName}' instead of '${key}'`);
                    if (!closure.current_xmlns)
                        attrName = camel_to_dash(attrName);

                    tlb.raw(` ${attrName}="`);
                    tlb_dynamic(ni.template[key]);
                    tlb.raw(`"`);
                    continue;
                }

                throw new Error(`Unknown element template key: ${key}`);
            }

            // Classes
            if (classList.length > 0)
            {
                let any = false;
                for (let cls of classList)
                {
                    if (!cls.condition)
                        continue;

                    if (!any)
                        tlb.raw(` class="`);
                    else
                        tlb.raw(" ");
                    any = true;

                    if (cls.condition instanceof Function)
                    {
                        tlb.expr(`${format_callback(refs.length)} ? "${htmlEncode(cls.name)}" : ""`);
                        refs.push(cls.condition);
                    }
                    else if (cls.condition)                    
                    {
                        tlb_dynamic(cls.name);
                    }
                }
                if (any)
                    tlb.raw(`"`);
            }

            // Styles
            if (styleList.length > 0)
            {
                tlb.raw(` style="`);
                
                for (let style of styleList)
                {
                    if (style.name === null)
                    {
                        if (style.value instanceof Function)
                        {
                            tlb.expr(`helpers.rawStyle(${format_callback(refs.length)})`);
                            refs.push(style.value);
                        }
                        else if (style.value instanceof HtmlString)
                        {
                            let s = style.value.html.trim();
                            if (!s.endsWith(";"))
                                s += ";";
                            tlb.raw(s);
                        }                         
                        else 
                        {
                            let s = style.value.toString().trim();
                            if (!s.endsWith(";"))
                                s += ";";
                            tlb.text(s);
                        }
                    }
                    else
                    {
                        if (style.value instanceof Function)
                        {
                            tlb.expr(`helpers.rawNamedStyle(${JSON.stringify(style.name)}, ${format_callback(refs.length)})`);
                            refs.push(style.value);
                        }
                        else if (style.value !== undefined && style.value !== null)
                        {
                            tlb.raw(style.name);
                            tlb.raw(":");
                            tlb_dynamic(style.value);
                            tlb.raw(";");
                        }
                    }
                }

                tlb.raw(`"`);
            }

            if (ni.template.text || ni.childNodes.length > 0)
            {
                tlb.raw(">");

                // Inner Text?
                if (ni.template.text)
                    tlb_dynamic(ni.template.text);

                // Emit child nodes
                emit_child_nodes(ni);

                tlb.raw(`</${ni.template.type}>`);
            }
            else
            {
                if (ni.template.type.match(/^(area|base|br|col|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)$/i))
                {
                    tlb.raw("/>");
                }
                else
                {
                    tlb.raw(`></${ni.template.type}>`);
                }
            }
            
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
                return true;

            if (key == "bind")
                return true;

            if (key.startsWith("on_"))
                return true;

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
            if (key == "debug_render")
            {
                if (typeof(ni.template[key]) === 'function')
                {
                    closure.render.append(`if (${format_callback(refs.length)})`);
                    closure.render.append(`  debugger;`);
                    refs.push(ni.template[key]);
                }
                else if (ni.template[key])
                    closure.render.append("debugger;");
                return true;
            }
            if (key == "debug_update")
                return true;

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

        function tlb_dynamic(value)
        {
            if (value instanceof Function)
            {
                tlb.expr(`helpers.rawText(${format_callback(refs.length)})`);
                refs.push(value);
            }
            else if (value instanceof HtmlString)
            {
                tlb.raw(value.html);
            }
            else
            {
                tlb.text(value);
            }
        }

        function renderDestroy(ni)
        {
            if (ni.isComponent || ni.isIntegrated)
            {
                closure.destroy.append(`${ni.name}.destroy();`);
                closure.destroy.append(`${ni.name} = null;`);
            }            
        }
    }
}


let _nextInstanceId = 1;

export function compileTemplate(rootTemplate, compilerOptions)
{
    compilerOptions = compilerOptions ?? {};
    compilerOptions.compileTemplate = compileTemplate;

    // Compile code
    let code = compileTemplateCode(rootTemplate, compilerOptions);
    //console.log(code.code);

    // Put it in a function
    let templateFunction = new Function("Environment", "refs", "helpers", "context", code.code);

    // Wrap it in a constructor function
    let compiledTemplate = function(context)
    {
        if (!context)
            context = {};
        context.$instanceId = _nextInstanceId++;
        return templateFunction(Environment, code.refs, TemplateHelpers, context ?? {});
    }

    return compiledTemplate;
}

