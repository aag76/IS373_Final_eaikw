/**
 * Sanity Query Builder
 * Centralized queries for the Design Gallery platform
 */

import "dotenv/config";
import sanityClient from "@sanity/client";

// Singleton client instance with lazy initialization
let client = null;
let initAttempted = false;

function initClient() {
  if (client || initAttempted) {
    return client;
  }
  
  initAttempted = true;
  
  if (!process.env.SANITY_PROJECT_ID) {
    console.warn("⚠️  Sanity CMS not configured. Set SANITY_PROJECT_ID in .env");
    return null;
  }
  
  try {
    client = sanityClient({
      projectId: process.env.SANITY_PROJECT_ID,
      dataset: process.env.SANITY_DATASET || "production",
      apiVersion: "2023-12-01",
      useCdn: process.env.NODE_ENV === "production",
      token: process.env.SANITY_API_TOKEN,
    });
    return client;
  } catch (error) {
    console.error("Failed to initialize Sanity client:", error.message);
    return null;
  }
}

function ensureClient() {
  const sanityClient = initClient();
  if (!sanityClient) {
    throw new Error(
      "Sanity client is not configured. Set SANITY_PROJECT_ID and SANITY_DATASET in environment."
    );
  }
  return sanityClient;
}

/**
 * Helper function to execute queries with consistent error handling
 */
async function executeQuery(query, params = {}, errorContext = "query") {
  const sanityClient = ensureClient();
  try {
    return await sanityClient.fetch(query, params);
  } catch (error) {
    console.error(`Error ${errorContext}:`, error.message);
    throw error;
  }
}

// Common projection for submissions
const submissionProjection = `
  _id,
  submitterName,
  submitterEmail,
  url,
  description,
  status,
  submittedAt,
  "screenshot": screenshot.asset->url,
  "designStyle": designStyle->{
    title,
    slug
  }
`;

/**
 * Get all approved submissions
 */
export async function getApprovedSubmissions() {
  const query = `*[_type == "gallerySubmission" && status == "approved"] | order(submittedAt desc) {${submissionProjection}}`;
  return executeQuery(query, {}, "fetching approved submissions");
}

/**
 * Get pending submissions for review
 */
export async function getPendingSubmissions() {
  const query = `*[_type == "gallerySubmission" && status == "submitted"] | order(submittedAt desc) {${submissionProjection}}`;
  return executeQuery(query, {}, "fetching pending submissions");
}

/**
 * Get single submission
 */
export async function getSubmission(id) {
  ensureClient();
  try {
    const submission = await client.fetch(
      `*[_type == "gallerySubmission" && _id == $id][0] {
        _id,
        submitterName,
        submitterEmail,
        url,
        description,
        status,
        submittedAt,
        reviewNotes,
        reviewedAt,
        "screenshot": screenshot.asset->url,
        "designStyle": designStyle->{
          title,
          slug,
          description
        }
      }`,
      { id }
    );
    return submission;
  } catch (error) {
    console.error("Error fetching submission:", error);
    throw error;
  }
}

/**
 * Get all design styles
 */
export async function getDesignStyles() {
  ensureClient();
  try {
    const styles = await client.fetch(
      `*[_type == "designStyle"] | order(title asc) {
        _id,
        title,
        slug,
        description,
        "colorPalette": colorPalette.colors,
        "sampleImages": sampleImages[]{
          "url": image.asset->url,
          caption
        },
        "submissionCount": count(gallerySubmissions)
      }`
    );
    return styles;
  } catch (error) {
    console.error("Error fetching design styles:", error);
    throw error;
  }
}

/**
 * Get single design style with related submissions
 */
export async function getDesignStyle(slug) {
  ensureClient();
  try {
    const style = await client.fetch(
      `*[_type == "designStyle" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        historicalBackground,
        "colorPalette": colorPalette.colors,
        typographyGuidance,
        "sampleImages": sampleImages[]{
          "url": image.asset->url,
          caption
        },
        "submissions": gallerySubmissions[]->{
          _id,
          submitterName,
          url,
          description,
          status,
          "screenshot": screenshot.asset->url
        }
      }`,
      { slug }
    );
    return style;
  } catch (error) {
    console.error("Error fetching design style:", error);
    throw error;
  }
}

/**
 * Get all articles
 */
export async function getArticles() {
  ensureClient();
  try {
    const articles = await client.fetch(
      `*[_type == "article"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        description,
        publishedAt,
        "author": author->{
          name,
          slug
        },
        "image": coverImage.asset->url,
        tags
      }`
    );
    return articles;
  } catch (error) {
    console.error("Error fetching articles:", error);
    throw error;
  }
}

/**
 * Get single article
 */
export async function getArticle(slug) {
  ensureClient();
  try {
    const article = await client.fetch(
      `*[_type == "article" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        description,
        body,
        publishedAt,
        "author": author->{
          name,
          slug,
          bio,
          "image": image.asset->url
        },
        "coverImage": coverImage.asset->url,
        tags
      }`,
      { slug }
    );
    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
}

/**
 * Get all authors
 */
export async function getAuthors() {
  ensureClient();
  try {
    const authors = await client.fetch(
      `*[_type == "author"] | order(name asc) {
        _id,
        name,
        slug,
        bio,
        "image": image.asset->url,
        email,
        url
      }`
    );
    return authors;
  } catch (error) {
    console.error("Error fetching authors:", error);
    throw error;
  }
}

/**
 * Get submission by email
 */
export async function getSubmissionsByEmail(email) {
  ensureClient();
  try {
    const submissions = await client.fetch(
      `*[_type == "gallerySubmission" && submitterEmail == $email] | order(submittedAt desc) {
        _id,
        submitterName,
        url,
        description,
        status,
        submittedAt,
        reviewNotes,
        "screenshot": screenshot.asset->url
      }`,
      { email }
    );
    return submissions;
  } catch (error) {
    console.error("Error fetching submissions by email:", error);
    throw error;
  }
}

/**
 * Get all submissions (admin / review mode)
 */
export async function getAllSubmissions() {
  ensureClient();
  try {
    const submissions = await client.fetch(
      `*[_type == "gallerySubmission"] | order(submittedAt desc) {
        _id,
        submitterName,
        submitterEmail,
        url,
        description,
        status,
        submittedAt,
        reviewNotes,
        reviewedAt,
        "screenshot": screenshot.asset->url,
        "designStyle": designStyle->{ title, slug }
      }`
    );
    return submissions;
  } catch (error) {
    console.error("Error fetching all submissions:", error);
    throw error;
  }
}

/**
 * Get statistics
 */
export async function getStatistics() {
  ensureClient();
  try {
    const stats = await client.fetch(`{
      "totalSubmissions": count(*[_type == "gallerySubmission"]),
      "approvedCount": count(*[_type == "gallerySubmission" && status == "approved"]),
      "pendingCount": count(*[_type == "gallerySubmission" && status == "submitted"]),
      "rejectedCount": count(*[_type == "gallerySubmission" && status == "rejected"]),
      "articleCount": count(*[_type == "article"]),
      "styleCount": count(*[_type == "designStyle"]),
      "authorCount": count(*[_type == "author"])
    }`);
    return stats;
  } catch (error) {
    console.error("Error fetching statistics:", error);
    throw error;
  }
}

export default {
  getApprovedSubmissions,
  getPendingSubmissions,
  getSubmission,
  getDesignStyles,
  getDesignStyle,
  getArticles,
  getArticle,
  getAuthors,
  getSubmissionsByEmail,
  getAllSubmissions,
  getStatistics,
};
