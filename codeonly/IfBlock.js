import { Placeholder } from "./Placeholder.js";
import { TemplateNode } from "./TemplateNode.js";
import { TemplateHelpers } from "./TemplateHelpers.js";

export class IfBlock
{
    static integrate(template)
    {
        let branches = [];
        let nodes = [];
        let hasElseBranch = false;
        let isSingleRoot = true;
        for (let i=0; i<template.branches.length; i++)
        {
            // Get branch
            let branch = template.branches[i];

            // Setup branch info for this branch
            let brInfo = {};
            branches.push(brInfo);

            // Setup condition
            if (branch.condition instanceof Function)
            {
                brInfo.condition = branch.condition;
                hasElseBranch = false;
            }
            else if (branch.condition !== undefined)
            {
                brInfo.condition = () => branch.condition;
                hasElseBranch = !!branch.condition;
            }
            else
            {
                brInfo.condition = () => true;
                hasElseBranch = true;
            }

            // Setup template
            if (branch.template !== undefined)
            {
                // Check if branch template has a single root
                let ni_branch = new TemplateNode(branch.template);
                if (!ni_branch.isSingleRoot)
                    isSingleRoot = false;

                brInfo.nodeIndex = nodes.length;
                nodes.push(ni_branch);
            }
        }

        // Make sure there's always an else block
        if (!hasElseBranch)
        {
            branches.push({
                condition: () => true,
            });
        }

        return {
            isSingleRoot,
            wantsUpdate: true,
            nodes,
            data: branches,
        };
    }

    static transform(template)
    {
        if (template.if === undefined)
            return template;

        let newTemplate = {
            type: IfBlock,
            branches: [
                {
                    template: template,
                    condition: template.if,
                }
            ]
        }

        delete template.if;

        return newTemplate;
    }

    static transformGroup(templates)
    {
        let ifBlock = null;
        for (let i=0; i<templates.length; i++)
        {
            let t = templates[i];
            if (t.if)
            {
                ifBlock = {
                    type: IfBlock,
                    branches: [
                        {
                            condition: t.if,
                            template: t,
                        }
                    ]
                };
                delete t.if;
                templates.splice(i, 1, ifBlock);
            }
            else if (t.elseif)
            {
                if (!ifBlock)
                    throw new Error("template has 'elseif' without a preceeding condition");

                ifBlock.branches.push({
                    condition: t.elseif,
                    template: t,
                });
                delete t.elseif;

                // Remove branch
                templates.splice(i, 1);
                i--;
            }
            else if (t.else)
            {
                if (!ifBlock)
                    throw new Error("template has 'else' without a preceeding condition");

                ifBlock.branches.push({
                    condition: t.else,
                    template: t,
                });
                delete t.else;

                // End of group
                ifBlock = null;

                // Remove branch
                templates.splice(i, 1);
                i--;
            }
            else
            {
                ifBlock = null;
            }
        }
    }

    constructor(options)
    {
        this.branches = options.data;
        this.context = options.context;

        // Setup constructors for branches
        for (let br of this.branches)
        {
            if (br.nodeIndex !== undefined)
            {
                br.create = options.nodes[br.nodeIndex];
            }
            else
            {
                br.create = Placeholder(" IfBlock placeholder ");   
            }
        }

        // Initialize
        if (options.initOnCreate)
        {
            this.activeBranchIndex = this.resolveActiveBranch();
            this.activeBranch = this.branches[this.activeBranchIndex].create();
        }
        else
        {
            this.activeBranchIndex = -1;
            this.activeBranch = Placeholder(" IfBlock placeholder ")();
        }
        
    }

    destroy()
    {
        this.activeBranch.destroy();
    }

    update()
    {
        // Switch branch
        let newActiveBranchIndex = this.resolveActiveBranch();
        if (newActiveBranchIndex != this.activeBranchIndex)
        {
            let oldActiveBranch = this.activeBranch;
            this.activeBranchIndex = newActiveBranchIndex;
            this.activeBranch = this.branches[newActiveBranchIndex].create();
            TemplateHelpers.replaceMany(oldActiveBranch.rootNodes, this.activeBranch.rootNodes);
            oldActiveBranch.destroy();
        }

        // Update the active branch
        this.activeBranch.update();
    }

    resolveActiveBranch()
    {
        for (let i=0; i<this.branches.length; i++)
        {
            if (this.branches[i].condition.call(this.context.model, this.context.model, this.context))
                return i;
        }
        throw new Error("internal error, IfBlock didn't resolve to a branch");
    }

    get rootNodes()
    {
        return this.activeBranch.rootNodes;
    }

    get rootNode()
    {
        return this.activeBranch.rootNode;
    }
}