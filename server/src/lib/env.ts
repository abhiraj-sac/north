import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverDirectory = fileURLToPath(new URL("../../", import.meta.url));

config({ path: resolve(serverDirectory, ".env") });
