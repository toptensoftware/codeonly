import path from 'node:path';
import url from 'node:url';
import express from 'express';
import 'express-async-errors';
import { bundleFree } from '@toptensoftware/bundle-free';
import livereload from 'livereload';
import logger from "morgan";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Setup app
let app = express(); 

// Enable logging
app.use(logger('dev', { stream: { write: (m) => console.log(m.trimEnd()) } } ));

// Serve static files
app.use("/", express.static(path.join(__dirname, "public")));

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
            { from: "./Main.js", to: "/Main.js" },
        ],
        livereload: true,
    }));

    // Live reload
    let lrs = livereload.createServer({
        extraExts: "page",
    });
    lrs.watch([
        path.join(__dirname, "../client"),
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


