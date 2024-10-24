import { Component, Style, router } from "@toptensoftware/codeonly";

// The main header
export class MainContent extends Component
{
    constructor()
    {
        super();

        router.addEventListener("navigate", () => {

            // Load navigated page into router slot
            if (router.current.page)
                this.routerSlot.content = router.current.page;

            // Setup document title
            if (router.current.title)
                document.title = `${router.current.title} | CodeOnly`;
            else
                document.title = "CodeOnly";
                
        });
    }
    
    static template = {
        type: "main",
        $: {
            type: "embed-slot",
            bind: "routerSlot",
        }
    }
}

Style.declare(`
main
{
}

`);

