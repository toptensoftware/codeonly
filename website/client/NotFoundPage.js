import { Component, router } from "@toptensoftware/codeonly";

export class NotFoundPage extends Component
{
    constructor(url)
    {
        super();
        this.url = url;
    }

    static template = {
        type: "div",
        class: "center",
        $: [
            {
                type: "h1",
                class: "danger",
                text: "Page not found! 😟",
            },
            {
                type: "p",
                text: c => `The page ${c.url} doesn't exist!`
            },
            {
                type: "p",
                $: {
                    type: "a",
                    attr_href: "/",
                    text: "Return Home",
                }
            }
        ]
    };
}


router.register({
    match: (r) => {
        r.page = new NotFoundPage(r.url);
        return true;
    },
    order: 1000,
});