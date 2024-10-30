export function downloadScript(script)
{
    let html = `<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CodeOnly Lab</title>
<link href="${window.location.origin}/stylish.css" type="text/css" rel="stylesheet">
<script type="importmap">
{
    "imports": {
        "@toptensoftware/codeonly": "${window.location.origin}/codeonly.js"
    }
}
</script>
</head>
<body>
<script type="module">
import { Component, Style } from "@toptensoftware/codeonly";
${script}
new Main().mount("body");
</script>
</body>
</html>
`
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(html));
    element.setAttribute('download', "codeonly.html");
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}