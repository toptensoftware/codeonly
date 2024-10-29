import { is_constructor } from "./Utils.js";
import { HtmlString } from "./HtmlString.js";
import { TemplateNode } from "./TemplateNode.js";
import { env } from "./Environment.js";

export class EmbedSlot
{
    static integrate(template, compilerOptions)
    {
        let contentTemplate = null;
        if (template.content && typeof(template.content) === "object")
        {
            contentTemplate = template.content;
            delete template.content;
        }
        let retv = {
            isSingleRoot: false,
            data: { 
                ownsContent: template.ownsContent ?? true,
                content: template.content,
            },
            nodes: [
                contentTemplate ? new TemplateNode(contentTemplate, compilerOptions) : null,
                template.placeholder ? new TemplateNode(template.placeholder, compilerOptions) : null,
            ]
        }

        delete template.content;
        delete template.placeholder;
        delete template.ownsContent;

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
        this.#placeholderConstructor = options.nodes[1];
        this.#headSentinal = env.document?.createTextNode("");
        this.#tailSentinal = env.document?.createTextNode("");
        this.#nodes = [];
        this.#ownsContent = options.data.ownsContent ?? true;

        // Load now
        if (options.nodes[0])
            this.content = options.nodes[0]();
        else
            this.content = options.data.content;
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

    // When ownsContent to false old content
    // wont be `destroy()`ed
    #ownsContent = true;
    get ownsContent()
    {
        return this.#ownsContent;
    }
    set ownsContent(value)
    {
        this.#ownsContent = value;
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

    bind()
    {
        if (this.#isPlaceholder)
            this.#resolvedContent?.bind?.()
    }

    unbind()
    {
        if (this.#isPlaceholder)
            this.#resolvedContent?.unbind?.()
    }

    get isAttached() {  }

    get #attached()
    {
        return this.#headSentinal?.parentNode != null;
    }

    #mounted
    setMounted(mounted)
    {
        this.#mounted = mounted;
        this.#resolvedContent?.setMounted?.(mounted);
    }

    replaceContent(value)
    {
        // Quit if redundant (same value, or still need placeholder)
        if (value == this.#resolvedContent || (!value && this.#isPlaceholder))
            return;

        // Remove old content
        if (this.#attached)
        {
            let n = this.#headSentinal.nextSibling;
            while (n != this.#tailSentinal)
            {
                let t = n.nextSibling;
                n.remove();
                n = t;
            }
        }

        if (this.#mounted)
            this.#resolvedContent?.setMounted?.(false);

        this.#nodes = [];
        if (this.#ownsContent)
            this.#resolvedContent?.destroy?.();

        // Insert new content
        this.#resolvedContent = value;
        this.#isPlaceholder = false;
        if (!value)
        {
            // Insert placeholder?
            if (this.#placeholderConstructor)
            {
                this.#resolvedContent = this.#placeholderConstructor(this.#context);
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
        else if (env.Node !== undefined && value instanceof env.Node)
        {
            // Single HTML node
            this.#nodes = [ value ];
        }
        else if (value instanceof HtmlString)
        {
            let span = env.document.createElement('span');
            span.innerHTML = value.html;
            this.#nodes = [ ...span.childNodes ];
        }
        else if (typeof(value) === 'string')
        {
            this.#nodes = [ env.document.createTextNode(value) ];
        }
        else if (value.render)
        {
            // Render only component, ignore it
            this.#nodes = [];
        }
        else
        {
            throw new Error("Embed slot requires component, array of HTML nodes or a single HTML node");
        }

        if (this.#attached)
            this.#tailSentinal.before(...this.#nodes);
        if (this.#mounted)
            this.#resolvedContent?.setMounted?.(true);
    }

    destroy()
    {
        if (this.#ownsContent)
            this.#resolvedContent?.destroy?.();
    }

    render(w)
    {
        if (this.#resolvedContent)
            this.#resolvedContent.render?.(w);
    }
}