import { HtmlString } from "./HtmlString.js";

// Manages information about a node in a template
export class NodeInfo
{
    // Constructs a new NodeInfo
    // - parent: the parent NodeInfo of this node, or null
    // - name: the variable name for this node (eg: "n1")
    // - template: the user supplied template object this node is derived from
    // - isItemNode: differentiates between the "foreach" node itself and
    //    and item instance node
    constructor(parent, name, template, isItemNode)
    {
        this.parent = parent;
        this.name =  name;
        this.template = template;
        this.childNodes = [];
        this.isItemNode = isItemNode;
    }

    // Checks if this node is a single or multi-root node
    // (fragments and foreach nodes are multi-root, all others are single root)
    get isMultiRoot()
    {
        return this.isFragment || this.isForEach;
    }

    // Check if this is a fragment node
    get isFragment()
    {
        // String
        if (typeof(this.template) != 'object')
            return false;
        // HtmlString => string node
        if (this.template instanceof HtmlString)
            return false;
        // Functions => string node
        if (this.template instanceof Function)
            return false;
        // If type is set then it's an element, otherwise it's a fragment
        return !this.template.type;
    }

    // Check if this is a foreach node
    get isForEach()
    {
        // Template must have "foreach" and this not be the item node associated
        // with that foreach loop
        return !!this.template.foreach && !this.isItemNode;
    }

    // Recursively get all the local node variables associated with this node and it's
    // children, but excluding foreach items since they're managed in a separate 
    // closure.   This function is used to get all the variables that need to
    // be reset to null when this item is conditionally removed from the DOM
    *enumLocalNodes()
    {
        if (this.isForEach)
            return;

        if (!this.isFragment)
            yield this.name;

        for (let i=0; i<this.childNodes.length; i++)
        {
            yield *this.childNodes[i].enumLocalNodes();
        }
    }

    // Similar to the above but finds all the foreach blocks so they can be
    // destroyed and nulled out when the node is conditionally removed.
    *enumLocalForEach()
    {
        if (this.isForEach)
        {
            yield this.name;
            return;
        }

        for (let i=0; i<this.childNodes.length; i++)
        {
            yield *this.childNodes[i].enumLocalForEach();
        }
    }

    // Returns a string describing all the child DOM nodes
    // as a sequence of spread variables.
    spreadChildDomNodes()
    {
        return Array.from(enumChildNodes(this)).filter(x => x.length > 0).join(", ");

        function *enumChildNodes(n)
        {
            for (let i=0; i<n.childNodes.length; i++)
            {
                yield n.childNodes[i].spreadDomNodes(false);
            }
        }
    
    }

    // Returns a string descibing all the DOM nodes of this node
    // with conditionally included nodes correctly included/excluded
    // When excludeConditional is true, the returned expression will
    // always assume that this node is included.  This is used to 
    // generate the correct set of nodes after an item has been excluded
    // but before it's been removed from the DOM.
    spreadDomNodes(excludeConditional)
    {
        let nodes = Array.from(this.enumAllNodes(excludeConditional));
        return nodes.join(", ");
    }

    // Generate code to list out all this node's dom nodes
    *enumAllNodes(excludeConditional)
    {
        if (this.isForEach)
        {
            yield `...${this.name}_manager.nodes`;
            return;
        }

        if (this.conditionGroup && !excludeConditional)
        {
            if (this != this.conditionGroup[0])
                return;

            let multiRoot = this.conditionGroup.some(x => x.isMultiRoot);
            let str = multiRoot ? "...(" : "(";
            let closing = ")";
            for (let i=0; i<this.conditionGroup.length; i++)
            {
                let br = this.conditionGroup[i];

                if (br.clause != "else")
                    str += `${this.name}_branch == ${i} ? `;

                if (multiRoot)
                    str += `[${Array.from(br.enumAllNodes(true)).join(", ")}]`;
                else
                    str += `${br.name}`

                if (br.clause != "else")
                    str += ` : `;
            }

            str += closing;
            yield str;
            return;
        }

        if (this.isFragment)
        {
            for (let i=0; i<this.childNodes.length; i++)
            {
                yield *this.childNodes[i].enumAllNodes();
            }
            return;
        }

        yield this.name;
    }
}
