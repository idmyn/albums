import { unstable_vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import UnoCSS from "unocss/vite";

// TODO configure UnoCSS to use radix theme variables
// similar to https://github.com/viktorbonino/radix-themes-tw

export default defineConfig({
  plugins: [
    remix(),
    tsconfigPaths(),
    UnoCSS({
      shortcuts: {
        center: "grid h-full w-full place-items-center",
        "center-screen": "grid h-screen w-full place-items-center",
      },
    }),
  ],
  ssr: {
    // https://github.com/radix-ui/themes/issues/77
    noExternal: ["@radix-ui/themes", "usehooks-ts"],
  },
});
