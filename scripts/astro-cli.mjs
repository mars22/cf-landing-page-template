import { cli } from "../node_modules/astro/dist/cli/index.js";

await cli(["node", "astro", ...process.argv.slice(2)]);
