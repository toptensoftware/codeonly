import { IfBlock } from "./IfBlock.js";
import { ForEachBlock } from "./ForEachBlock.js";
import { EmbedSlot } from "./EmbedSlot.js";

export class Plugins
{
    static plugins = [
        ForEachBlock,
        EmbedSlot,
        IfBlock,
    ];

    static register(plugin)
    {
        this.plugins.push(plugin);
    }

    static transform(template)
    {
        for (let p of this.plugins)
        {
            if (p.transform)
                template = p.transform(template);
        }
        return template;
    }

    static transformGroup(childNodes)
    {
        for (let p of this.plugins)
        {
            p.transformGroup?.(childNodes);
        }
    }

}