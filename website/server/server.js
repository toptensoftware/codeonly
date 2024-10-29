import path from 'node:path';
import url from 'node:url';
import express from 'express';
import 'express-async-errors';
import { bundleFree } from '@toptensoftware/bundle-free';
import livereload from 'livereload';
import logger from "morgan";
import { convert_toc } from './convert_toc.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Setup app
let app = express(); 

// Enable logging
app.use(logger('dev', { stream: { write: (m) => console.log(m.trimEnd()) } } ));

// Allow codeonly.js cross origin
app.get('/codeonly.js', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use("/", express.static(path.join(__dirname, "public")));

// Serve static content files
app.use("/content", express.static(path.join(__dirname, "../content")));

// Generate TOCs from .txt to .json
app.get(/^\/content\/(?:(.*)\/)?toc$/, async (req, res) => {
    let pathname = req.params[0] ? req.params[0] + "/" : "";
    let toc = await convert_toc(path.join(__dirname, `../content/${pathname}toc.txt`));
    res.json(toc);
});

// 404 anything other /content requests
app.use("/content/*", (req, res, next) => {
    let err = new Error(`Not Found - ${req.url}`);
    err.status = 404;
    next(err);
});

// Prod or Dev?
if (process.env.NODE_ENV == "production")
{
    console.log("Running as production");

    // Serve bundled client
    app.use(bundleFree({
        path: path.join(__dirname, "../client/dist"),
        spa: true
    }));
}
else
{
    console.log("Running as development");

    // Serve unbundled code only
    app.use("/codeonly", express.static(path.join(__dirname, "../../src/")));

    // Module handling
    app.use(bundleFree({
        path: path.join(__dirname, "../client"),
        spa: true,
        modules: [ 
            "@toptensoftware/codeonly",
            "@toptensoftware/stylish",
        ],
        replace: [
            { from: "./Application.js", to: "/Application.js" },
        ],
        livereload: true,
    }));

    // Live reload
    let lrs = livereload.createServer({
        extraExts: "page",
    });
    lrs.watch([
        path.join(__dirname, "../client"),
        path.join(__dirname, "../content"),
    ]);
}

// Not found
app.use((req, res, next) => {
    let err = new Error(`Not Found - ${req.url}`);
    err.status = 404;
    next(err);
});

// Start server
let server = app.listen(3000, null, function () {
    console.log(`Server running on [${server.address().address}]:${server.address().port} (${server.address().family})`);
});


