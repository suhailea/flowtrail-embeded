import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Config for the component library
 */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "my-component-library",
      fileName: (format) => `my-component-library.${format}.js`,
      formats: ["es", "umd"],
    },
  },
});
