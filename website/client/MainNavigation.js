import { Component, Style, Html } from "@toptensoftware/codeonly";

// The main header
export class MainNavigation extends Component
{
    constructor()
    {
        super();
    }

    #tocPath;
    set url(value)
    {
        let newTocPath = new URL("toc", value).pathname;
        if (newTocPath == this.#tocPath)
            return;
        this.#tocPath = newTocPath;
        this.load();
    }

    load()
    {
        super.load(async () => {
            this.error = false;
            try 
            {
                const response = await fetch(`/content${this.#tocPath}`);
                if (!response.ok)
                    throw new Error(`Response status: ${response.status} - ${response.statusText}`);
        
                this.toc = await response.json();
            } 
            catch (error) 
            {
                this.error = true;
                console.error(error.message);
            }
        });
    }

    static template = {
        _: "nav",
        id: "nav-main",
        $: [
            {
                foreach: x => x.toc,
                $: [
                    {
                        type: "h5",
                        text: i => i.title
                    },
                    {
                        type: "ul",
                        $: {
                            foreach: i => i.pages,
                            type: "li",
                            $: {
                                type: "a",
                                attr_href: j => j.url,
                                text: j => j.title,
                            }
                        }
                    },
                ]
            }
        ]
    }
}

Style.declare(`
#nav-main
{
    x-background-color: purple;
    width: 100%;
    height: 100%;

    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding: 10px;

    padding: 0rem 1rem 1rem 1rem;

    ul
    {
        font-size: 0.8rem;
        li
        {
            padding-top: 0.5rem;
            line-height: 1.2rem;
        }
    }

}
`);

