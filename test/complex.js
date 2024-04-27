import { test } from "node:test";
import { strict as assert } from "node:assert";
import { TemplateHelpers as helpers } from "../codeonly/TemplateHelpers.js";
import "./mockdom.js";

test("Basic", () => {

    let root = document.createElement("DIV");

    helpers.complexReplace([], []);
});
