import { Component } from "./Component.js";
import { Placeholder } from "./Placeholder.js";
import { TemplateHelpers } from "./TemplateHelpers.js";

export class IfBlock extends Component
{
    static prepareTemplate(template)
    {
        let branches = [];
        let templates = [];
        let hasElseBranch = false;
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
                brInfo.templateIndex = templates.length;
                templates.push(branch.template);
            }
        }

        // Make sure there's always an else block
        if (!hasElseBranch)
        {
            this.branches.push({
                condition: () => true,
            });
        }

        return {
            isSingleRoot: false,        // TODO:
            wantsUpdate: true,
            templates,
            data: branches,
        };
    }

    constructor(options)
    {
        this.branches = options.data;
        this.context = options.context;

        // Setup constructors for branches
        for (let br of this.branches)
        {
            if (br.templateIndex !== undefined)
            {
                br.create = options.templates[br.templateIndex];
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
            TemplateHelpers.replaceMany(this.rootNodes, this.activeBranch.rootNodes);
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