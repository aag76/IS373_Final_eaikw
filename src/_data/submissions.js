/**
 * Eleventy data file for gallery submissions
 *
 * NOTE: Submissions are now handled via Netlify Functions (serverless backend).
 * This file returns empty data since submissions are loaded dynamically on the client side.
 * The review page fetches submissions from /.netlify/functions/submissions at runtime.
 */

export default async function () {
  // Return empty submissions array since we're using Netlify Functions for dynamic data
  return {
    submissions: [],
    reviewMode: false,
  };
}
