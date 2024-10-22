import { Environment } from "./Environment.js";
import { htmlEncode } from "./htmlEncode.js";

export function Placeholder(comment)
{
    let fn = function()
    {
        let node = Environment.document?.createComment(comment);

        return {
            get rootNode() { return node; },
            get rootNodes() { return [ node ]; },
            get isSingleRoot() { return true; },
            destroy() {},
            update() {},
            render(w) { w.write(`<!--${htmlEncode(comment)}-->`) },
        }
    }

    fn.isSingleRoot = true;
    return fn;
}