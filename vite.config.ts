import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  ssr: {
    // https://github.com/radix-ui/themes/issues/77
    noExternal: ["@radix-ui/themes", "usehooks-ts"],
  },
});
