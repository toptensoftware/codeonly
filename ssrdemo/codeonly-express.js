import express from 'express';

import { Environment } from "../codeonly.js";
import { compileTemplate } from "../core/TemplateCompilerSSR.js";
import { TemplateHelpers } from "../core/TemplateHelpers.js";

Environment.compileTemplate = compileTemplate;


/*
express.response.sendComponent = function(component)
{
    layout.body = component;
    this.send(TemplateHelpers.renderComponentToString(layout));
}
*/

let defaultLayout;

export function setDefaultLayout(layoutClass)
{
    defaultLayout = layoutClass;
}

export function sendComponent(res, component, layout)
{
    // Work out layout class (if undefined)
    let layoutClass = layout === undefined ? defaultLayout : layout;
    if (layoutClass != null)
    {
        // Create layout and embed component in it
        let layout = new layoutClass();
        layout.page = component;
        component = layout;
    }

    // Render the component, writing to the response stream
    component.render({
        write: res.write.bind(res),
    });

    // Done!
    res.end();
}

export function resSendComponent()
{
    sendComponent(this, ...arguments);
}