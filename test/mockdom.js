import { setEnvironment, Template } from "../codeonly.js";
import { Document, Window, Node } from "../minidom/minidom.js";

let document = new Document();
let window = new Window();

setEnvironment({
    document,
    window,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    Node: Node,
    compileTemplate: Template.compile,
})