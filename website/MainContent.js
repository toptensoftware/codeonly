import { Component, Style, Html, nextFrame } from "@toptensoftware/codeonly";
import { Document } from "./Document.js";
import { appState } from "./AppState.js";

// The main header
export class MainContent extends Component
{
    constructor()
    {
        super();
        this.load();

        appState.addEventListener("documentChanged", () => {
            this.bodyContent = appState.document?.render();
            this.invalidate();
        });
    }

    async load()
    {
        this.loading = true;
        this.error = false;

        try 
        {
            let url = `./content/${this.location}.page`;
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Response status: ${response.status}`);
      
            let markdown = await response.text();
            let doc = new Document(markdown);
            appState.document = doc;
        } 
        catch (error) 
        {
            appState.document = null;
            this.error = true;
            console.error(error.message);
        }

        this.loading = false;
    }

    location = "index";
    bodyContent = "";
    error = true;
    
    static template = {
        type: "main",
        $: [
            {
                if: c => c.error,
                type: "div",
                class: "error",
                $: [
                    {
                        type: "h1",
                        class: "danger",
                        text: "Page not found! 😟",
                    },
                    {
                        type: "p",
                        text: c => `The page '${c.location}' doesn't exist!`
                    },
                    {
                        type: "p",
                        $: {
                            type: "a",
                            attr_href: "/",
                            text: "Return Home",
                        }
                    }
                ],
            },
            {
                else: true,
                $: c => Html.raw(c.bodyContent),
            }
        ]
    }
}

Style.declare(`
main
{
    padding: 10px 50px;
    margin: 0;
    margin-top: -1rem;

    .hljs 
    {
        background-color: #282828;
        font-size: 0.9rem;
    }

    a.hlink
    {
        float: left;
        margin-left: -1.5rem;
    }

    .error
    {
        text-align: center;
    }
}

`);