import { Component, Style, Html } from "@toptensoftware/codeonly";
import { router } from "./router.js";
import { Document } from "./Document.js";
import { LayoutDocumentation } from "./LayoutDocumentation.js";
import { LayoutBare } from "./LayoutBare.js";
import { NotFoundPage } from "./NotFoundPage.js";

// The main header
export class ArticlePage extends Component
{
    constructor(document)
    {
        super();
        this.document = document;
    }

    get inPageLinks()
    {
        return this.document.headings;
    }

    get layout()
    {
        switch (this.document?.frontmatter?.layout)
        {
            case "bare":
                return LayoutBare;
            default:
                return LayoutDocumentation;
        }
    }

    onMount()
    {
        this.document.mountDemos();
    }

    static template = {
        type: "div",
        class: "article",
        $: c => Html.raw(c.document.html)
    }
}

Style.declare(`
.article
{
    padding: 10px 20px;
    margin: 0;
    margin-top: var(--align-content);

    h1
    {
        margin-top: 0;
    }

    .hljs 
    {
        background-color: rgb(from var(--fore-color) r g b / 2%);
        font-size: 0.9rem;
    }

    h2::before
    {
        content: " ";
        display: block;
        height: 5rem; 
        margin-top: -5rem;
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

    div.demo-header
    {
        display: flex;
        justify-content: space-between;
    }

    div.demo
    {
        background-color: rgb(from var(--fore-color) r g b / 2%);
        padding: 10px;
    }
}

`);



router.register({
    pattern: "/:pathname*",
    match: async (to) => {
        try
        {
            to.document = new Document(to.match.groups.pathname);
            await to.document.load();
            to.page = new ArticlePage(to.document);
            return true;
        }
        catch
        {
            to.page = new NotFoundPage();
        }
        return true;
    },
    order: 10,
});

