import { defineConfig } from "nitro";

export default defineConfig({
  preset: "node",
  serverDir: "server",
  devServer: {
    port: 3001,
  },
  routeRules: {
    "/api/v1/**": {
      headers: { "cache-control": "s-maxage=0" },
    },
  },
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
});
