import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	base: process.env.ASTRO_BASE_PATH || "",
  vite: {
    ssr: {
      external: ["svgo"],
    },
  },
  integrations: [],
});
