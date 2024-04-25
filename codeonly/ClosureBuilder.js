import { CodeBuilder } from "./CodeBuilder.js";

export class ClosureBuilder
{
    constructor()
    {
        this.code = CodeBuilder();
        this.functions = [];
        this.locals = [];
    }

    // Add a local variable to this closure
    addLocal(name, init)
    {
        this.locals.push({
            name, init
        });
    }

    // Add a function to this closure
    addFunction(name, args)
    {
        if (!args)
            args = [];
        let fn = {
            name,
            args,
            code: new ClosureBuilder(),
        }
        this.functions.push(fn);
        return fn.code;
    }

    toString()
    {
        let final = CodeBuilder();
        this.appendTo(final);
        return final.toString();
    }

    appendTo(out)
    {
        // Declare locals
        if (this.locals.length > 0)
        {
            out.appendLine(`let ${this.locals.map((l) => {
                if (l.init)
                    return `${l.name} = ${l.init}`;
                else
                    return l.name;
            }).join(', ')};`)
        }

        // Append main code
        out.append(this.code);

        // Append functions
        for (let f of this.functions)
        {
            out.appendLine(`function ${f.name}(${f.args.join(", ")})`);
            out.appendLine(`{`);
            out.indent();
            f.code.appendTo(out);
            out.unindent();
            out.appendLine(`}`);
        }
    }
}
