import { Component, Style, Html, router } from "@toptensoftware/codeonly";
import { Document } from "./Document.js";
import { LayoutDocumentation } from "./LayoutDocumentation.js";

// The main header
export class ArticlePage extends Component
{
    constructor(url)
    {
        super();
        this.url = url;
        this.load();
    }

    url;
    document;
    documentHtml;

    update()
    {
        super.update();
    }

    load()
    {
        super.load(async () => {
            this.error = false;

            try 
            {
                const response = await fetch(this.url);
                if (!response.ok)
                    throw new Error(`Response status: ${response.status} - ${response.statusText}`);
        
                let markdown = await response.text();
                this.document = new Document(markdown);
                this.documentHtml = this.document.render();
            } 
            catch (error) 
            {
                this.error = true;
                console.error(error.message);
            }
        });
    }

    get inPageLinks()
    {
        return this.document.headings;
    }

    
    static template = {
        type: "div",
        class: "article",
        $: c => Html.raw(c.documentHtml)
    }
}

Style.declare(`
.article
{
    padding: 10px 50px;
    margin: 0;
    margin-top: -1rem;

    h1
    {
        margin-top: 0;
    }

    .hljs 
    {
        background-color: #282828;
        font-size: 0.9rem;
    }

    h2::before
    {
        content: " ";
        display: block;
        height: 4rem; 
        margin-top: -4rem;
    }

    a.hlink
    {
        float: left;
        margin-left: -1.2rem;
        opacity: 0;
        transition: opacity .2s;
    }

    h2:hover
    {
        a.hlink
        {
            opacity: 1;
        }
    }
}

`);



router.register({
    pattern: "/guide/:article*",
    match: (route) => {
        route.page = new ArticlePage(`/content/${route.match.groups.article}.page`);
        route.layout = LayoutDocumentation;
        return true;
    }
});