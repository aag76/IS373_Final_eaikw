import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "eaikw-cms",
  title: "EverydayAI CMS",
  projectId: process.env.SANITY_PROJECT_ID || "817a8pxv",
  dataset: process.env.SANITY_DATASET || "production",
  plugins: [deskTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
