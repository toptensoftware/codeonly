import { registerStyles } from "./RegisterStyles.js";
import { processStyles } from "./ProcessStyles.js";

export function styles(css)
{
    registerStyles(processStyles(css));
}