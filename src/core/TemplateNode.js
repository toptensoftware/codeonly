import { HtmlString } from "./HtmlString.js";
import { is_constructor } from "./Utils.js";
import { Plugins } from "./Plugins.js";
import { env } from "./Environment.js";

// Manages information about a node in a template
export class TemplateNode
{
    // Constructs a new TemplateNode
    // - name: the variable name for this node (eg: "n1")
    // - template: the user supplied template object this node is derived from
    constructor(template, compilerOptions)
    {
        // Automatically wrap array as a fragment with the array
        // as the child nodes.
        if (Array.isArray(template))
        {
            template = { $:template }
        }

        // _ is an alias for type
        if (template._ && !template.type)
        {
            template.type = template._;
            delete template._;
        }

        // Apply automatic transforms
        /*
        let saved = {};
        if (template.export !== undefined)
        {
            saved.export = template.export;
            delete template.export;
        }
        if (template.bind !== undefined)
        {
            saved.bind = template.bind;
            delete template.bind;
        }
        */
        template = Plugins.transform(template);
        //template = Object.assign(template, saved);
        if (is_constructor(template))
        {
            template = { type: template }
        }

        // Setup
        this.template = template;

        // Work out its kind
        if (is_constructor(template.type))
        {
            if (template.type.integrate)
                this.kind = "integrated";
            else
                this.kind = "component";
        }
        else if (typeof(template) === 'string')
            this.kind = "text";
        else if (template instanceof HtmlString)
        {
            // HTML
            this.kind = "html";
            this.html = template.html;

            if (env.document)
            {
                // Use div to parse HTML
                let div = env.document.createElement('div');
                div.innerHTML = template.html;

                // Store nodes
                this.nodes = [...div.childNodes];
                this.nodes.forEach(x => x.remove());
            }
        }
        else if (template instanceof Function)
            this.kind = "dynamic_text";
        else if (template.type === 'comment')
            this.kind = "comment";
        else if (template.type === undefined)
            this.kind = "fragment";
        else 
            this.kind = "element";

        if (this.kind === 'integrated')
        {
            if (template.$ && !template.content)
            {
                template.content = template.$;
                delete template.$;
            }
            this.integrated = this.template.type.integrate(this.template, compilerOptions);
        }

        // If $ is a string or HtmlString convert to text property
        if (this.kind == 'element' && template.$ && !template.text)
        {
            if (typeof(template.$) == 'string' || template.$ instanceof HtmlString)
            {
                template.text = template.$;
                delete template.$;
            }
        }

        // Recurse child nodes
        if (this.kind == 'element' || this.kind == 'fragment')
        {
            if (template.$ && !template.childNodes)
            {
                template.childNodes = template.$;
                delete template.$;
            }

            if (template.childNodes)
            {
                if (!Array.isArray(template.childNodes))
                {
                    template.childNodes = [ template.childNodes ];
                }
                else
                {
                    template.childNodes = template.childNodes.flat();
                }
                
                template.childNodes.forEach(x => {
                    if (x._ && !x.type)
                    {
                        x.type = x._;
                        delete x._;
                    }
                });

                Plugins.transformGroup(template.childNodes);
                /*
                ForEachBlock.transformGroup(template.childNodes);
                EmbedSlot.transformGroup(template.childNodes);
                IfBlock.transformGroup(template.childNodes);
                */
                this.childNodes = this.template.childNodes.map(x => new TemplateNode(x, compilerOptions));
            }
            else
                this.childNodes = [];
        }
        else if (this.isComponent )
        {
            if (template.$ && !template.content)
            {
                template.content = template.$;
                delete template.$;
            }
        }
        else if (template.childNodes)
        {
            throw new Error("childNodes only supported on element and fragment nodes");
        }
    }

    // Checks if this node is a single or multi-root node
    // (fragments and foreach nodes are multi-root, all others are single root)
    get isSingleRoot()
    {
        if (this.isFragment)
            return this.childNodes.length == 1 && this.childNodes[0].isSingleRoot;

        if (this.isComponent)
            return this.template.type.isSingleRoot;

        if (this.isIntegrated)
            return this.integrated.isSingleRoot;

        if (this.kind == 'html')
            return this.nodes.length == 1;

        return true;
    }

    // Is this a component?
    get isComponent()
    {
        return this.kind === 'component';
    }

    get isFragment()
    {
        return this.kind === 'fragment';
    }

    get isIntegrated()
    {
        return this.kind === 'integrated';
    }

    // Recursively get all the local node variables associated with this node and it's
    // children. This function is used to get all the variables that need to
    // be reset to null when this item is conditionally removed from the DOM
    *enumLocalNodes()
    {
        if (!this.isFragment)
            yield this;

        if (this.childNodes)
        {
            for (let i=0; i<this.childNodes.length; i++)
            {
                yield *this.childNodes[i].enumLocalNodes();
            }
        }
    }

    // Returns a string describing all the child DOM nodes
    // as a sequence of spread variables.
    spreadChildDomNodes()
    {
        return Array.from(enumChildNodes(this)).filter(x => x.length > 0).join(", ");

        function *enumChildNodes(n)
        {
            for (let i=0; i<n.childNodes.length; i++)
            {
                yield n.childNodes[i].spreadDomNodes();
            }
        }
    
    }

    // Returns a string descibing all the DOM nodes of this node
    // with conditionally included nodes correctly included/excluded
    spreadDomNodes()
    {
        let nodes = Array.from(this.enumAllNodes());
        return nodes.join(", ");
    }

    // Generate code to list out all this node's dom nodes
    *enumAllNodes()
    {
        switch (this.kind)
        {
            case 'fragment':
                for (let i=0; i<this.childNodes.length; i++)
                {
                    yield *this.childNodes[i].enumAllNodes();
                }
                break;

            case 'component':
            case 'integrated':
                if (this.isSingleRoot)
                    yield `${this.name}.rootNode`;
                else
                    yield `...${this.name}.rootNodes`;
                break;

            case 'html':
                if (this.nodes.length > 0)
                {
                    if (this.nodes.length > 1)
                        yield `...${this.name}`;
                    else
                        yield `${this.name}`;
                }
                break;

            default:
                yield this.name;
        }
    }

}
