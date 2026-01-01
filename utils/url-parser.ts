import {
  FILE_EXTENSION_PATTERN,
  TITLE_SUFFIX_PATTERN,
  MIN_QUERY_LENGTH,
  looksLikeArticleId,
} from "./constants";

/**
 * Cleans an article title by removing common site name suffixes.
 * Handles separators like |, -, :, en-dash, and em-dash.
 *
 * @example
 * cleanArticleTitle("Breaking News | CNN") // "Breaking News"
 * cleanArticleTitle("Article - The Times") // "Article"
 * cleanArticleTitle("Story: Publisher Name") // "Story"
 */
export function cleanArticleTitle(title: string): string {
  return title.replace(TITLE_SUFFIX_PATTERN, "").trim();
}

/**
 * Extracts a search query from a URL's path segments.
 * Handles article slugs by converting hyphens/underscores to spaces
 * and filtering out article IDs.
 *
 * @example
 * parseArticleSlugFromUrl("https://example.com/news/breaking-story-123456")
 * // Returns: "breaking story"
 *
 * parseArticleSlugFromUrl("https://nytimes.com/2024/01/article-title")
 * // Returns: "article title"
 */
export function parseArticleSlugFromUrl(url: string): string {
  const urlObj = new URL(url);

  // Extract the last path segment (article slug)
  const pathSegments = urlObj.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] || "";

  // Remove file extension if present
  const cleanedSegment = lastSegment.replace(FILE_EXTENSION_PATTERN, "");

  // Split slug into words by hyphens/underscores
  const words = cleanedSegment.split(/[-_]/);

  // Remove trailing article ID if present
  const lastWord = words[words.length - 1];
  if (lastWord && looksLikeArticleId(lastWord)) {
    words.pop();
  }

  // Remove leading numeric IDs (e.g., "12345-article-title")
  if (words.length > 0 && /^\d+$/.test(words[0])) {
    words.shift();
  }

  let query = words.join(" ").trim();

  // If query is too short, use hostname as fallback
  if (!query || query.length < MIN_QUERY_LENGTH) {
    query = `${urlObj.hostname.replace("www.", "")} article`;
  }

  return query;
}

/**
 * Extracts an article title from the current page's DOM.
 * Priority: og:title > twitter:title > h1 > document.title
 *
 * This function is designed to be injected into a page context via
 * browser.scripting.executeScript().
 *
 * @returns The extracted article title
 */
export function extractArticleTitleFromDOM(): string {
  // Priority 1: Open Graph title
  const ogTitle = document.querySelector<HTMLMetaElement>(
    'meta[property="og:title"]',
  );
  if (ogTitle?.content) {
    return ogTitle.content.trim();
  }

  // Priority 2: Twitter title
  const twitterTitle = document.querySelector<HTMLMetaElement>(
    'meta[name="twitter:title"]',
  );
  if (twitterTitle?.content) {
    return twitterTitle.content.trim();
  }

  // Priority 3: First h1 element
  const h1 = document.querySelector("h1");
  if (h1?.textContent?.trim()) {
    return h1.textContent.trim();
  }

  // Priority 4: Document title (fallback)
  return document.title;
}
