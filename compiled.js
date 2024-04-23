let template = {
    type: "div",
    childNodes: 
    [
        {
            type: "div",
            text: o => `Clicked: ${o.count}`,
        },
        {
            type: "button",
            attr_type: "button",
            text: "click me",
            on_click: (o, ev) => { o.count++; o.update() },
        }
    ]
}


function create(context, callbacks)
{
    let n1 = document.createElement("div");

    let n2 = context.n2 = n1.appendChild(document.createElement("div"));
    n2.innerText = callbacks[0].apply(context, context);

    let n3 = n1.appendChild(document.createElement("button"));
    n3.setAttribute("type", "button");
    n3.text = "click me";
    n3.addEventListener("click", (ev) => callbacks[1].apply(context, context, ev));

    return n1;
}

function update(context, callbacks)
{
    context.n2.innerText = callbacks[0].apply(context, context);
}

