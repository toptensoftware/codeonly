import { setEnvironment } from "../codeonly.js";
import { Document, Window, Node } from "../minidom/minidom.js";


setEnvironment({
    document: new Document(),
    window: new Window(),
    Node: Node,
})