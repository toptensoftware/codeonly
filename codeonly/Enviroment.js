export let Environment = {};

if (typeof(document) !== "undefined")
    Environment.document = document;

if (typeof(window) !== "undefined")
    Environment.window = window;

if (typeof(Node) !== "undefined")
    Environment.Node = Node;

export function setEnvironment(env)
{
    Environment = env;
}
