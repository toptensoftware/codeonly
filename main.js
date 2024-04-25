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
            () => `${count}: `,
            {
                condition: () => count % 2 == 0,
                childNodes: [
                    "Divisible by 2",
                    {
                        condition: () => count % 3 == 0,
                        childNodes: [
                            " and 3",
                        ]
                    }
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