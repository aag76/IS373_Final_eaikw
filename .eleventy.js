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
  eleventyConfig.addPassthroughCopy({ "src/js/cookie-consent.js": "js/cookie-consent.js" });
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

  // Filters with error handling
  // Helper function to format dates (DRY principle)
  const formatDate = (date) => {
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
  };

  // Use the same function for both filters
  eleventyConfig.addFilter("dateFormat", formatDate);
  eleventyConfig.addFilter("readableDate", formatDate);

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

  eleventyConfig.addFilter("excerpt", function (content, length = 200) {
    if (!content) {
      return "";
    }
    // Remove HTML tags and extra whitespace
    const plainText = content
      .replace(/(<([^>]+)>)/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    if (plainText.length <= length) {
      return plainText;
    }

    // Try to break at a word boundary
    const excerpt = plainText.substring(0, length);
    const lastSpace = excerpt.lastIndexOf(" ");
    return (lastSpace > 0 ? excerpt.substring(0, lastSpace) : excerpt) + "...";
  });

  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("currentYear", function () {
    return new Date().getFullYear();
  });

  // Navigation filters for prev/next post links
  eleventyConfig.addFilter("getPreviousCollectionItem", function (collection, page) {
    if (!collection || !Array.isArray(collection) || !page || !page.url) {
      return null;
    }
    const index = collection.findIndex((item) => item && item.url === page.url);
    return index > 0 && index !== -1 ? collection[index - 1] : null;
  });

  eleventyConfig.addFilter("getNextCollectionItem", function (collection, page) {
    if (!collection || !Array.isArray(collection) || !page || !page.url) {
      return null;
    }
    const index = collection.findIndex((item) => item && item.url === page.url);
    return index !== -1 && index < collection.length - 1 ? collection[index + 1] : null;
  });

  // Image shortcode for optimized images
  eleventyConfig.addAsyncShortcode("image", async function (src, alt = "", sizes = "100vw") {
    if (!src) {
      console.warn("Image shortcode called without src");
      return "";
    }

    try {
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
    } catch (error) {
      console.error(`Error processing image ${src}:`, error.message);
      return `<img src="${src}" alt="${alt}" loading="lazy" />`;
    }
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
    slugify: (s) => {
      if (!s) {
        return "";
      }
      return s
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/^-+|-+$/g, "");
    },
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
