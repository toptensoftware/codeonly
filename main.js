import { compileTemplate, html, styles } from "./codeonly/codeonly.js";

styles(`
div
{
    &.main-div
    {
        background-color:yellow;
    }
    &.myclass
    {
        background-color: orange;
        &:hover
        {
            background-color:blue;
        }
    }
}
.odd
{
    color:white;
    background-color:red;
}
`
);


export function main()
{
    let count = 0;

    let template = compileTemplate({
        type: "div",
        childNodes: [
            {
                type: "div",
                text: "Hello World",
                attr_dataId: () => count,
                class_odd: () => count % 2 != 0,
            },
            {
                type: "div",
                text: () => html(`<b>Divisable by Three</b>`),
                condition: () => count % 3 == 0,
            },
            {
                condition: () => count % 5 != 0,
                childNodes: [
                    () => html(`Inline html fragment: <b>#${count}</b><br/>`),
                    () => `Inline text fragment: #${count}`,
                ]
            }
        ]
    });

    let inst = template(null);
    document.getElementById("main").append(inst.rootNode);

    document.getElementById("testButton").addEventListener("click", () => {
        count++;
        inst.update();
    });
}