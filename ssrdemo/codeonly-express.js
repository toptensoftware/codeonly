import express from 'express';

import { Environment } from "../codeonly.js";
import { compileTemplate } from "../core/TemplateCompilerSSR.js";

Environment.compileTemplate = compileTemplate;

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
    component.render(res);

    // Done!
    res.end();
}

export function resSendComponent()
{
    sendComponent(this, ...arguments);
}