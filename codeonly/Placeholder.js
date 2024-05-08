export function Placeholder(comment)
{
    let fn = function()
    {
        let node = document.createComment(comment);

        return {
            get rootNode() { return node; },
            get rootNodes() { return [ node ]; },
            get isSingleRoot() { return true; },
            destroy() {},
            update() {},
        }
    }

    fn.isSingleRoot = true;
    return fn;
}