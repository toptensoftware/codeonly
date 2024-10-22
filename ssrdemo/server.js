import path from 'node:path';
import url from 'node:url';
import express from 'express';
import 'express-async-errors';

import { resSendComponent, setDefaultLayout } from './codeonly-express.js';
import { Style } from '../codeonly.js';

import { Layout } from "./Layout.js";
import { MainPage } from "./MainPage.js";
import { OtherPage } from "./OtherPage.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

let app = express(); 

// Setup code only express handler
setDefaultLayout(Layout);
express.response.sendComponent = resSendComponent;

// Home page "/" handler
app.get("/", (req, res) => {
    res.sendComponent(new MainPage());
});

// Other page 
app.get("/other", (req, res) => {
    res.sendComponent(new OtherPage());
});

app.get("/styles.css", (req, res) => {
    res.setHeader("content-type", "text/css");
    res.send(Style.all);
});


// Start server
let server = app.listen(3000, null, function () {
    console.log(`Server running on [${server.address().address}]:${server.address().port} (${server.address().family})`);
});


