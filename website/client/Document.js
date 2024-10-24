export class Document
{
    constructor(markdown)
    {
        // Store markdown (without frontmatter)
        this.markdown = markdown.replace(/^---[\s\S]*?---\n/, "");;

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
    }

    render()
    {
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
        return renderer.render(this.ast);
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
