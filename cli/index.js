import path from 'node:path';
import url from 'node:url';
import fs from "node:fs";
import inflection from 'inflection';
import moe from "@toptensoftware/moe-js";
import { parse } from "yaml";

// Get dirname
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

Object.assign(moe.helpers, inflection);

// Load the specified template file
async function loadTemplate(name)
{
    let base = path.join(__dirname, `templates/${name}/`);
    try
    {
        let stat = fs.statSync(base);
        if (stat.isDirectory())
            return {
                base,
                params: {},
            }
    }
    catch (err)
    {
        throw new Error(`template '${name}' not found (${err.message})`);
    }

    throw new Error(`'${base}' is not a directory`);
}

// Parse arguments and return a template to process
async function parseArgs(args)
{
    let template;

    // Check command line args
    for (let i=0; i<args.length; i++)
    {
        var a = args[i];

        if (a.startsWith("--"))
        {
            isSwitch = true;
            a = a.substring(2);

            var parts = a.split(':');
            switch (parts[0])
            {
                case "help":
                    showHelp();
                    process.exit(0);

                case "version":
                    showVersion();
                    process.exit(0);

                default:
                    throw new Error(`Unknown command line arg: ${args[i]}`);
            }
        }
        else
        {
            if (a == "new")
            {
                if (template)
                    throw new Error("Multiple `new` commands found");
                
                // Load the template
                i++;
                template = await loadTemplate(args[i]);

                // Does the name argument follow?
                if (args[i+1] && !args[i+1].startsWith("--"))
                {
                    i++;
                    template.params.name = args[i];
                }

                continue;
            }

            throw new Error(`Unknown command line arg: ${args[i]}`);
        }
    }

    return template;
}

function mkdirp(targetDir)
{
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(parentDir, childDir);
      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
      }

      return curDir;
    }, initDir);
}


async function generateTemplate(template)
{
    // Get all files
    let files = fs.readdirSync(template.base, { recursive: true });

    let outputs = [];

    let base = null;

    // Process each file
    for (let i=0; i<files.length; i++)
    {
        let srcFile = path.join(template.base, files[i]);

        // Ignore directories
        let stat = fs.statSync(srcFile);
        if (stat.isDirectory())
            continue;

        // load file
        let src = fs.readFileSync(srcFile, "utf8");

        // moejs file?
        let output;
        if (files[i].endsWith(".moe"))
        {
            // Generate template
            let fileTemplate = moe.compile(src);

            // Store output
            output = {
                content: fileTemplate(template.params),
                out: files[i].substring(0, files[i].length - 4),
            };
        }
        else
        {
            output = {
                content: src,
                out: files[i],
            };
        }

        // Get file front matter
        output.frontmatter = {};
        output.content = output.content.replace(/\r\n/g, "\n");
        output.content = output.content.replace(/^---([\s\S]*?)---\n/, (m, m1) => {
            output.frontmatter = parse(m1);
            return "";
        });

        if (output.frontmatter.out)
            output.out = output.frontmatter.out;
        if (output.frontmatter.base)
        {
            if (base != null && base != output.frontmatter.base)
                throw new Error("Multiple conflicting `base` settings");
            base = output.frontmatter.base;
        }

        outputs.push(output);

    }

    if (base != null)
    {
        for (let o of outputs)
        {
            o.out = path.join(base, o.out);
        }
    }

    // Check not files already exist
    let existing = false;
    for (let o of outputs)
    {
        if (fs.existsSync(o.out))
        {
            console.error(`exists: ${o.out}`);
            existing = true;
        }

    }

    if (existing)
        throw new Error(`One or more files already exists, aborting`);

    // Save
    for (let o of outputs)
    {
        mkdirp(path.dirname(o.out));
        fs.writeFileSync(o.out, o.content, "utf8");
        console.error(`created: ${o.out}`);
    }
}

// Parse args
let template = await parseArgs(process.argv.slice(2));
if (template)
{
    await generateTemplate(template);
}

console.log("Done");
