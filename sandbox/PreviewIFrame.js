import { Component } from "@toptensoftware/codeonly";

// srcdoc for the iFrame
let head = `<html>
<head>
    <link href="./stylish.css" type="text/css" rel="stylesheet" />
<script type="importmap">
{
    "imports": {
        "@toptensoftware/codeonly": "./codeonly.js"
    }
}
</script>
<script>
window.addEventListener("error", (ev) => {
    parent.postMessage({action: "error", error: { message: ev.message, lineno: ev.lineno - ##patchlinecount##, colno: ev.colno } });
})
</script>
</head>
<body>
<script type="module">
import { Component, Style } from "@toptensoftware/codeonly";
`;

let tail = `
</script>
</body>
</html>
`;

// Update the head part to adjust the line number on errors
head = head.replace("##patchlinecount##", (head.split('\n').length - 1).toString());


// Preview iFrame component
export class PreviewIFrame extends Component
{
    constructor(script)
    {
        super();
        this.script = script;
    }

    get srcdoc()
    {
        return `${head}${this.script}
        new Main().mount("body");
        ${tail}
        `;
    }

    static template = {
        _: "iframe",
        attr_srcdoc: c => c.srcdoc,
    }
}

