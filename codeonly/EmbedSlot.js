import { is_constructor } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { TemplateNode } from "./TemplateNode.js";

export class EmbedSlot
{
    static integrate(template)
    {
        let retv = {
            isSingleRoot: false,
            wantsUpdate: true,
            data: { 
                content: template.content 
            },
            nodes: template.placeholder ? [ new TemplateNode(template.placeholder) ] : [],
        }

        delete template.content;
        delete template.placeholder;

        return retv;
    }


    static transform(template)
    {
        // Wrap non-constructor callbacks in an embed slot where the 
        // callback is the content
        if (template instanceof Function && !is_constructor(template))
        {
            return {
                type: EmbedSlot,
                content: template,
            }
        }

        if (template.type == 'embed-slot')
            template.type = EmbedSlot;
        return template;
    }

    static transformGroup(templates)
    {
        // Convert 'else' blocks following an EmbedSlot into 
        // the embed slot's placeholder
        for (let i=1; i<templates.length; i++)
        {
            if (templates[i].else !== undefined)
            {
                // Transform previous item to EmbedSlot
                templates[i-1] = EmbedSlot.transform(templates[i-1]);

                // Store else item as placeholder on the template
                if (templates[i-1].type === EmbedSlot && !templates[i-1].placeholder)
                {
                    delete templates[i].else;
                    templates[i-1].placeholder = templates[i];
                    templates.splice(i, 1);
                    i--;
                }  
            }
        }
    }

    #context;
    #content;
    #resolvedContent;        // either #content, or if #content is a function the return value from the function
    #headSentinal;
    #nodes;
    #tailSentinal;
    #placeholderConstructor;
    #isPlaceholder;

    constructor(options)
    {
        this.#context = options.context;
        this.#placeholderConstructor = options.nodes.length > 0 ? options.nodes[0] : null;
        this.#headSentinal = document.createTextNode("");
        this.#tailSentinal = document.createTextNode("");
        this.#nodes = [];

        if (this.#content instanceof Function && !options.initOnCreate)
        {
            // Just store content and we'll load it on next update
            this.#content = options.data.content;
        }
        else
        {
            // Load now
            this.content = options.data.content;
        }
    }

    get rootNodes() 
    { 
        return [ 
            this.#headSentinal, 
            ...this.#nodes,
            this.#tailSentinal 
        ]; 
    }

    get isSingleRoot()
    {
        return false;
    }

    get content()
    {
        return this.#content;
    }

    set content(value)
    {
        // Store new content
        this.#content = value;

        if (this.#content instanceof Function)
        {
            this.replaceContent(this.#content.call(this.#context.model, this.#context.model, this.#context));
        }
        else
        {
            this.replaceContent(this.#content);
        }
    }

    update()
    {
        if (this.#content instanceof Function)
        {
            this.replaceContent(this.#content.call(this.#context.model, this.#context.model, this.#context));
        }
    }

    replaceContent(value)
    {
        // Quit if redundant (same value, or still need placeholder)
        if (value == this.#resolvedContent || (!value && this.#isPlaceholder))
            return;

        // Remove old content
        if (this.#headSentinal.parentNode != null)
        {
            let n = this.#headSentinal.nextSibling;
            while (n != this.#tailSentinal)
            {
                let t = n.nextSibling;
                n.remove();
                n = t;
            }
        }
        this.#nodes = [];
        this.#resolvedContent?.destroy?.();

        // Insert new content
        this.#resolvedContent = value;
        this.#isPlaceholder = false;
        if (!value)
        {
            // Insert placeholder?
            if (this.#placeholderConstructor)
            {
                this.#resolvedContent = this.#placeholderConstructor();
                this.#isPlaceholder = true;
                this.#nodes = this.#resolvedContent.rootNodes
            }
        }
        else if (value.rootNodes !== undefined)
        {
            // Component like object
            this.#nodes = value.rootNodes;
        }
        else if (Array.isArray(value))
        {
            // Array of HTML nodes
            this.#nodes = value;
        }
        else if (value instanceof Node)
        {
            // Single HTML node
            this.#nodes = [ value ];
        }
        else if (value instanceof HtmlString)
        {
            let span = document.createElement('span');
            span.innerHTML = value.html;
            this.#nodes = [ ...span.childNodes ];
        }
        else if (typeof(value) === 'string')
        {
            this.#nodes = [ document.createTextNode(value) ];
        }
        else
        {
            throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
        }

        if (this.#tailSentinal.parentNode)
            this.#tailSentinal.before(...this.#nodes);

    }

    destroy()
    {
        this.#resolvedContent?.destroy?.();
    }
}