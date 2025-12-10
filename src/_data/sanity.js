/**
 * Sanity CMS Client
 * Fetches content from Sanity during Eleventy build
 */

import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: true,
  token: process.env.SANITY_READ_TOKEN,
});

/**
 * Fetch all articles from Sanity
 */
export async function getArticles() {
  const query = `*[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    description,
    excerpt,
    content,
    keywords,
    tags,
    featured,
    featuredImage,
    readingTime,
    publishedAt,
    updatedAt,
    author-> {
      name,
      slug,
      bio,
      email,
      twitter,
      linkedin,
      github,
    }
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching articles from Sanity:", error);
    return [];
  }
}

/**
 * Fetch all design styles from Sanity
 */
export async function getDesignStyles() {
  const query = `*[_type == "designStyle"] | order(createdAt desc) {
    _id,
    title,
    slug,
    description,
    historicalBackground,
    colorPalette,
    typographyGuidance,
    sampleImages,
    gallerySubmissions[]-> {
      _id,
      status,
      submitterInfo,
    },
    createdAt,
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching design styles from Sanity:", error);
    return [];
  }
}

/**
 * Fetch approved gallery submissions
 */
export async function getGallerySubmissions(styleSlug = null) {
  let query = `*[_type == "gallerySubmission" && status == "approved" || status == "featured"] | order(submissionDate desc) {
    _id,
    submitterInfo,
    submissionUrl,
    screenshot,
    description,
    status,
    submissionDate,
    styleReference-> {
      title,
      slug,
    }
  }`;

  if (styleSlug) {
    query = `*[_type == "gallerySubmission" && status in ["approved", "featured"] && styleReference->slug.current == "${styleSlug}"] | order(submissionDate desc) {
      _id,
      submitterInfo,
      submissionUrl,
      screenshot,
      description,
      status,
      submissionDate,
    }`;
  }

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error("Error fetching gallery submissions from Sanity:", error);
    return [];
  }
}

/**
 * Fetch article by slug
 */
export async function getArticleBySlug(slug) {
  const query = `*[_type == "article" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    description,
    excerpt,
    content,
    keywords,
    tags,
    featured,
    featuredImage,
    readingTime,
    publishedAt,
    updatedAt,
    author-> {
      name,
      slug,
      bio,
      email,
      twitter,
      linkedin,
      github,
    }
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error(`Error fetching article "${slug}" from Sanity:`, error);
    return null;
  }
}

/**
 * Fetch design style by slug
 */
export async function getDesignStyleBySlug(slug) {
  const query = `*[_type == "designStyle" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    description,
    historicalBackground,
    colorPalette,
    typographyGuidance,
    sampleImages,
    gallerySubmissions[]-> {
      _id,
      submitterInfo,
      submissionUrl,
      screenshot,
      status,
    },
    createdAt,
  }`;

  try {
    return await client.fetch(query);
  } catch (error) {
    console.error(`Error fetching design style "${slug}" from Sanity:`, error);
    return null;
  }
}
