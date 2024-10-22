import { compileTemplate } from "./TemplateCompiler.js";

export let Environment = {};

if (typeof(document) !== "undefined")
{
    Environment.document = document;
    Environment.compileTemplate = compileTemplate;
}

if (typeof(window) !== "undefined")
{
    Environment.window = window;
    Environment.requestAnimationFrame = window.requestAnimationFrame.bind(window);
}

if (typeof(Node) !== "undefined")
    Environment.Node = Node;

export function setEnvironment(env)
{
    Environment = env;
}
