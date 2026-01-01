/** Maximum number of attempts when waiting for Shadow DOM elements */
export const MAX_SHADOW_DOM_ATTEMPTS = 20;

/** Delay between Shadow DOM polling attempts (ms) */
export const SHADOW_DOM_RETRY_DELAY_MS = 250;

/** Total timeout for Shadow DOM waiting (ms) - derived for documentation */
export const SHADOW_DOM_TOTAL_TIMEOUT_MS =
  MAX_SHADOW_DOM_ATTEMPTS * SHADOW_DOM_RETRY_DELAY_MS; // 5000ms

/** Timeout for cleanup of tab listeners (ms) */
export const TAB_LISTENER_TIMEOUT_MS = 30000;

/**
 * Matches purely numeric article IDs (5+ digits).
 * Example: "12345", "987654321"
 */
export const NUMERIC_ID_PATTERN = /^\d{5,}$/;

/**
 * Matches hex-like article IDs (8+ characters).
 * Example: "a1b2c3d4e5", "deadbeef12"
 */
export const HEX_ID_PATTERN = /^[a-f0-9]{8,}$/i;

/**
 * Matches alphanumeric IDs that contain at least one digit (6+ characters).
 * Example: "abc123def", "item42xyz"
 */
export const ALPHANUMERIC_ID_PATTERN = /^(?=.*\d)[a-z0-9]{6,}$/i;

/**
 * Matches file extensions to strip from URL paths.
 * Example: ".html", ".htm", ".php", ".aspx"
 */
export const FILE_EXTENSION_PATTERN = /\.(html|htm|php|aspx?)$/i;

/**
 * Matches common site name suffixes in article titles.
 * Used to clean titles like "Article Title | Site Name" or "Article - Publisher"
 */
export const TITLE_SUFFIX_PATTERN =
  /\s*[\|\-\u2013\u2014:]\s*[^|\-\u2013\u2014:]+$/;

export const MIN_QUERY_LENGTH = 5;

export const CONTEXT_MENU_IDS = {
  ARCHIVE_PAGE: "ArchivePageId",
  FIND_ALTERNATIVES: "FindAlternativesId",
  FIND_ALTERNATIVES_LINK: "FindAlternativesLinkId",
} as const;

/**
 * Checks if a string looks like an article ID based on common patterns.
 * Used to filter out IDs from URL slugs when building search queries.
 */
export function looksLikeArticleId(segment: string): boolean {
  return (
    NUMERIC_ID_PATTERN.test(segment) ||
    HEX_ID_PATTERN.test(segment) ||
    ALPHANUMERIC_ID_PATTERN.test(segment)
  );
}
