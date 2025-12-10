import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import Image from "@11ty/eleventy-img";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import pluginRss from "@11ty/eleventy-plugin-rss";

export default async function (eleventyConfig) {
  // Copy static files
  // Note: CSS and JS are built separately by Tailwind and esbuild
  // but we still need Eleventy to preserve the _site/css and _site/js directories
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/css/print.css": "css/print.css" });
  eleventyConfig.addPassthroughCopy("CNAME");

  // Add plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(pluginRss);

  // Performance optimizations
  eleventyConfig.setUseGitIgnore(false);

  // Collections
  eleventyConfig.addCollection("blog", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md").reverse();
  });

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/projects/*.md").reverse();
  });

  // Sanity Collections - fetched during build
  eleventyConfig.addCollection("sanityArticles", async function () {
    if (!process.env.817a8pxv) {
      console.warn("⚠️ SANITY_PROJECT_ID not set. Skipping Sanity articles.");
      return [];
    }
    try {
      const { getArticles } = await import("./src/_data/sanity.js");
      const articles = await getArticles();
      return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    } catch (error) {
      console.warn("⚠️ Error fetching Sanity articles:", error.message);
      return [];
    }
  });

  eleventyConfig.addCollection("sanityDesignStyles", async function () {
    if (!process.env.SANITY_PROJECT_ID) {
      return [];
    }
    try {
      const { getDesignStyles } = await import("./src/_data/sanity.js");
      return await getDesignStyles();
    } catch (error) {
      console.warn("⚠️ Error fetching Sanity design styles:", error.message);
      return [];
    }
  });
  eleventyConfig.addFilter("dateFormat", function (date) {
    if (!date) {
      return "Date not available";
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return "Invalid date";
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("readableDate", function (date) {
    if (!date) {
      return "Date not available";
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return "Invalid date";
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("dateToISO", function (date) {
    if (!date) {
      return new Date().toISOString();
    } // Fallback to current date
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return new Date().toISOString();
    }
    return d.toISOString();
  });

  eleventyConfig.addFilter("excerpt", function (content) {
    const excerpt = content.replace(/(<([^>]+)>)/gi, "").substring(0, 200);
    return excerpt + (excerpt.length >= 200 ? "..." : "");
  });

  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("currentYear", function () {
    return new Date().getFullYear();
  });

  // Navigation filters for prev/next post links
  eleventyConfig.addFilter("getPreviousCollectionItem", function (collection, page) {
    if (!collection || !page) {
      return null;
    }
    const index = collection.findIndex((item) => item.url === page.url);
    return index > 0 ? collection[index - 1] : null;
  });

  eleventyConfig.addFilter("getNextCollectionItem", function (collection, page) {
    if (!collection || !page) {
      return null;
    }
    const index = collection.findIndex((item) => item.url === page.url);
    return index < collection.length - 1 ? collection[index + 1] : null;
  });

  // Image shortcode for optimized images
  eleventyConfig.addAsyncShortcode("image", async function (src, alt, sizes = "100vw") {
    const metadata = await Image(src, {
      widths: [300, 600, 1200],
      formats: ["webp", "jpeg"],
      outputDir: "./_site/images/",
      urlPath: "/images/",
      filenameFormat: function (id, src, width, format) {
        const extension = `.${format}`;
        const name = src
          .split("/")
          .pop()
          .replace(/\.[^.]+$/, "");
        return `${name}-${width}w${extension}`;
      },
    });

    const imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    return Image.generateHTML(metadata, imageAttributes);
  });

  // Custom filter for GitHub Pages path prefix
  eleventyConfig.addFilter("baseUrl", function (url) {
    // Only apply path prefix if explicitly enabled (for GitHub Pages)
    const pathPrefix = process.env.PATH_PREFIX || "";
    return pathPrefix ? `${pathPrefix}${url}` : url;
  });

  // Markdown config with anchor support
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink(),
    slugify: (s) =>
      s
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, ""),
  });

  eleventyConfig.setLibrary("md", md);

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    serverOptions: {
      port: 8080,
      host: "0.0.0.0",
    },
  };
}
