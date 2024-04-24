import { camel_to_dash } from './Utils.js';

class Modifier
{
    static resolve(value)
    {
        if (value instanceof Modifier)
            return value.resolveValue();
        else
            return value;
    }

}

class Important extends Modifier
{
    constructor(value)
    {
        super();
        this.value = value;
    }

    resolveValue(value)
    {
        return `${Modifier.resolve(this.value)} !important`;
    }
}

function important(value)
{
    return new Important(value);
}


function is_scope(key)
{
    return !!key.match(/@(media|keyframes)\b/);
}

function is_rule(key, value)
{
    if (value instanceof Modifier)
        return true;
    
    if (key.startsWith('@'))
        return false;

    if (Array.isArray(value))
        return true;

    return typeof(value) !== 'object';
}


class CssRenderer
{
    constructor()
    {
        this.css = "";
        this.context = null;
        this.section = null;
        this.scope = null;
        this.sections = [];
    }

    render(template)
    {
        this.renderInternal(template);

        let css = "";
        let currentScope = null;
        for (let section of this.sections)
        {
            if (typeof(section) === 'string')
            {
                css += section;
                continue;
            }

            if (section.content.length == 0)
                continue;

            if (currentScope != section.scope)
            {
                if (currentScope != null)
                {
                    css += `\}\n`;
                }
                currentScope = section.scope;
                if (currentScope != null)
                {
                    css += `${currentScope} \{\n`;
                }
            }

            let indent = section.scope == null ? "" : "  ";
            css += `${indent}${section.name} \{\n`;
            css += section.content;
            css += `${indent}\}\n`;
        }

        if (currentScope != null)
        {
            css += `\}\n`;
        }
        return css;
    }

    renderInternal(template)
    {
        for (let key of Object.keys(template))
        {
            let value = template[key];

            let isRule = is_rule(key, value);

            if (!isRule)
            {
                if (Array.isArray(value))
                    value.forEach(x => this.renderSection(key, x));
                else
                    this.renderSection(key, value);
            }
            else
            {
                if (Array.isArray(value))
                    value.forEach(x => this.renderRule(key, x));
                else
                    this.renderRule(key, value);
            }
        }

        return this.css;
    }

    renderSection(key, value)
    {
        // @rule?
        if (key.startsWith('@') && typeof(value) == 'string')
        {
            this.sections.push(`${key} ${value};\n`);
            return;
        }

        let oldContext = this.context;
        let oldSection = this.section;
        let oldScope = this.scope;

        if (is_scope(key))
        {
            this.scope = key;
        }
        else
        {
            // Work out new context string
            if (this.context != null)
            {
                let sep = ' ';
                if (key.startsWith('&'))
                {
                    sep = key[1];
                    key = key.substring(2);
                }

                this.context = `${this.context}${sep}${camel_to_dash(key)}` 
            }
            else
                this.context = camel_to_dash(key);
        }

        // Create the section
        this.section = {
            name: this.context,
            scope: this.scope,
            content: "",
        };
        this.sections.push(this.section);

        // Recurse to render section content
        this.render(value);

        // Restore state
        this.context = oldContext;
        this.section = oldSection;
        this.scope = oldScope;
    }

    renderRule(key, value)
    {
        if (!this.section)
            throw new Error("style sheet value is not in section");

        let keyname = `  ${this.section.scope != null ? "  " : ""}${camel_to_dash(key)}:`

        this.section.content += `${keyname} ${Modifier.resolve(value)};\n`;
    }
}

console.log(new CssRenderer().render({
    '@charset': '"utf-8"',
    '@import': 'url(http://mysite.com/custom.css)',
    '@namespace': 'url(http://mysite.com/xhtml)',
    '@font-face': [
        {
            fontFamily: 'MyWebFont',
            src: 'url(webfont.eot)'
        },
        {
            fontFamily: 'MySecondFont',
            src: 'url(webfont2.eot)'
        }
    ],
    main: {
        backgroundColor: ["red", "green", "blue"],
        ".class1": {
            display: "none",
            "&:hover": {
                backgroundColor: "orange",
            }
        }
    },
    "@media screen and (min-width:48em)": {
        "#title": {
            display: "flex",
            alignItems: important("center"),
            gap: "10px",
            width: "25%",
        }
    },
    "@keyframes": {
        logoSpin: {
            from: 'blah',
            to: 'bahl',
        },
    },

}));

stylesheet(`
@charset "utf-8";
@import url(http://mysite.com/custom.css);
@namespace: url(http://mysite.com/xhtml);

@font-face
{
    font-family: 'MyWebFont';
    src: url(webfont.eot);
}

main
{
    background-color: red;
    .class1 
    {
        display: none;
        &:hover
        {
            backgroundColor: ${color},
        }
    }
}

@media screen and (min-width:48em)
{
    #title 
    {
        display: flex;
        align-items: center !important
        gap: 10px;
        width: 25%;
    }
}

@keyframes
{
    logo-spin: 
    {
        from: blah;
        to: blah;
    }
}
`);
