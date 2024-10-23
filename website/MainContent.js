import { Component, Style, Html, nextFrame } from "@toptensoftware/codeonly";
import { fake_content } from "./MainNavigation.js";

// The main header
export class MainContent extends Component
{
    constructor()
    {
        super();
        this.load();
    }

    async load()
    {
        this.loading = true;

        try 
        {
            let url = `./content/${this.location}.page`;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Response status: ${response.status}`);
      
          let markdown = await response.text();
          let reader = new commonmark.Parser();
          let writer = new commonmark.HtmlRenderer();
          let parsed = reader.parse(markdown.replace(/^---[\s\S]*?---\n/, ""));
          this.bodyContent = writer.render(parsed);
          this.invalidate();
          nextFrame(() => {
            hljs.highlightAll();
          });
        } 
        catch (error) 
        {
          console.error(error.message);
        }

        this.loading = false;

    }

    location = "index";
    bodyContent = "";
    

    static template = {
        type: "main",
        $: c => Html.raw(c.bodyContent),
    }
}

Style.declare(`
main
{
    padding: 10px 80px;
    margin: 0;
    margin-top: -1rem;

    .hljs 
    {
        background-color: #282828;
        font-size: 0.9rem;
    }
}

`);