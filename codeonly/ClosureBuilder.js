import { CodeBuilder } from "./CodeBuilder.js";

export class ClosureBuilder
{
    constructor()
    {
        this.code = CodeBuilder();
        this.code.closure = this;
        this.functions = [];
        this.locals = [];
        this.prologs = [];
        this.epilogs = [];
    }

    get isEmpty()
    {
        return this.code.isEmpty && 
            this.locals.length == 0 &&
            this.functions.every(x => x.code.isEmpty) &&
            this.prologs.every(x => x.isEmpty) &&
            this.epilogs.every(x => x.isEmpty)
    }

    addProlog()
    {
        let cb = CodeBuilder();
        this.prologs.push(cb);
        return cb;
    }

    addEpilog()
    {
        let cb = CodeBuilder();
        this.epilogs.push(cb);
        return cb;
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

    getFunction(name)
    {
        return this.functions.find(x => x.name == name)?.code;
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
            out.append(`let ${this.locals.map((l) => {
                if (l.init)
                    return `${l.name} = ${l.init}`;
                else
                    return l.name;
            }).join(', ')};`)
        }

        // Prologs
        for (let f of this.prologs)
        {
            out.append(f);
        }

        // Append main code
        out.append(this.code);

        // Append functions
        for (let f of this.functions)
        {
            out.append(`function ${f.name}(${f.args.join(", ")})`);
            out.append(`{`);
            out.indent();
            f.code.appendTo(out);
            out.unindent();
            out.append(`}`);
        }

        // Epilogs
        for (let f of this.epilogs)
        {
            out.append(f);
        }
    }
}
