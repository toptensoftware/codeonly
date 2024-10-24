import { EnvironmentBase, setEnvironment  } from "../core/Environment.js";
import { compileTemplate } from "../core/TemplateCompiler.js";
import { Document, Window, Node } from "../minidom/minidom.js";


let document = new Document();
let window = new Window();

class MockEnvironment extends EnvironmentBase
{
    constructor()
    {
        super();
        this.document = new Document(),
        this.window = new Window(),
        this.requestAnimationFrame = this.window.requestAnimationFrame.bind(this.window),
        this.Node = Node,
        this.compileTemplate = compileTemplate;
    }
}

setEnvironment(new MockEnvironment());
