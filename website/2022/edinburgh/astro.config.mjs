import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	base: "/2022/edinburgh/",
  vite: {
    ssr: {
      external: ["svgo"],
    },
  },
  integrations: [],
});
