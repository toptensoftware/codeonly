import { env } from "@toptensoftware/codeonly";

export class Document
{
    constructor(pathname)
    {
        this.pathname = pathname;
        this.load();
    }
    
    load()
    {
        return env.load(async () => {

            try
            {
                // Work out "index" filename
                let pathname = this.pathname;
                if (pathname == "" || pathname.endsWith("/"))
                    pathname += "index";
        
                // Fetch the page
                const response = await fetch(`/content/${pathname}.page`);
                if (!response.ok)
                    throw new Error(`Response status: ${response.status} - ${response.statusText}`);
        
                // Process markdown body
                this.processMarkdown( await response.text());
            }
            catch (err)
            {
                this.failed = true;
            }


        });
    }

    processMarkdown(markdown)
    {
        // Store markdown (without frontmatter)
        this.frontmatter = {};
        markdown = markdown.replace(/\r\n/g, "\n");
        this.markdown = markdown.replace(/^---([\s\S]*?)---\n/, (m, m1) => {
            
            for (let line of m1.matchAll(/^([a-zA-Z0-9_]+):\s*(\"?.*\"?)\s*?$/gm))
            {
                try
                {
                    this.frontmatter[line[1]] = JSON.parse(line[2]);
                }
                catch
                {
                    this.frontmatter[line[1]] = line[2];
                }
            }
            return "";
        });

        // Parse it
        let parser = new commonmark.Parser();
        this.ast = parser.parse(this.markdown);

        // Find all h2s
        let walker = this.ast.walker();
        let ev;
        let currentHeading = null;
        let headingText = "";
        this.headings = [];
        let codeBlocks = [];
        while (ev = walker.next())
        {
            if (ev.entering && ev.node.type === 'heading' && ev.node.level == 2)
            {
                currentHeading = ev.node;
            }

            if (currentHeading != null && ev.node.type === 'text')
            {
                headingText += ev.node.literal;
            }

            if (!ev.entering && ev.node == currentHeading)
            {
                let id = convertHeadingTextToId(headingText);
                if (id.length > 0)
                {
                    this.headings.push({
                        node: ev.node,
                        text: headingText,
                        id,
                    });
                    currentHeading = false;
                }
                headingText = "";
                currentHeading = null;
            }

            if (ev.entering && ev.node.type == 'code_block')
            {
                codeBlocks.push(ev.node);
            }
        }

        // Insert the # links
        for (let h of this.headings)
        {
            let n = new commonmark.Node("html_inline", h.node.sourcepos);
            n.literal = `<a class="hlink" href="#${h.id}">#</a>`;
            h.node.prependChild(n);
        }

        // Highlight code blocks
        for (let cb of codeBlocks)
        {
            let html = hljs.highlight(cb.literal, { 
                language: cb.info, 
                ignoreIllegals: true
            });
            let wrapper_html = `<pre><code class="hljs language-${html.language}">${html.value}</code></pre>`;

            let html_block = new commonmark.Node("html_block", cb.sourcepos);
            html_block.literal = wrapper_html;
            cb.insertBefore(html_block);
            cb.unlink();
        }

        let renderer = new commonmark.HtmlRenderer();
        let oldAttrs = renderer.attrs;
        renderer.attrs = (node) =>
        {
            let att = oldAttrs.call(renderer, ...arguments);
            if (node.type == "heading" && node.level == 2)
            {
                let heading = this.headings.find(x => x.node == node);
                if (heading)
                {
                    att.push(["id", heading.id]);
                }
            }
            return att;
        }

        this.html = renderer.render(this.ast);
    }
}

function convertHeadingTextToId(text)
{
    // Lower case
    text = text.toLowerCase();

    // Convert all non-letter-digits to hyphens
    text = text.replace(/[^\p{L}\p{N}]+/gu, "-");

    // Get rid of duplicate hypens
    text = text.replace(/-+/, "-");

    // Get rid if leading/trailing hypens
    text = text.replace(/^-|-$/g, "");
    return text;
}
