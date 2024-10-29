import { env } from "./Environment.js";
import { htmlEncode } from "./htmlEncode.js";

export function Placeholder(comment)
{
    let fn = function()
    {
        let node = env.document?.createComment(comment);

        return {
            get rootNode() { return node; },
            get rootNodes() { return [ node ]; },
            get isSingleRoot() { return true; },
            setMounted(m) { },
            destroy() {},
            update() {},
            render(w) { w.write(`<!--${htmlEncode(comment)}-->`) },
        }
    }

    fn.isSingleRoot = true;
    return fn;
}