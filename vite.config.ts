import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/paycheck-planner-for-couples/",
  plugins: [react()],
});
