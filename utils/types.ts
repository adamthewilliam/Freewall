/**
 * Represents a web archive service for saving and accessing archived web pages.
 */
export interface ArchiveService {
  /** Unique identifier for the service */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** Base URL of the archive service */
  url: string;
  /** CSS selector for the form element (null if using Shadow DOM) */
  formSelector: string | null;
  /** CSS selector for the URL input field (null if using Shadow DOM) */
  inputSelector: string | null;
  /** Shadow DOM traversal path for services like Wayback Machine */
  shadowDomPath?: string[];
  /** Whether this is a built-in default service */
  isDefault: boolean;
}

/**
 * Storage schema for extension preferences.
 */
export interface StorageSchema {
  /** ID of the currently selected archive service */
  selectedServiceId: string;
  /** Array of custom archive services added by the user */
  customServices: ArchiveService[];
}

/**
 * Session storage schema for temporary data.
 */
export interface SessionSchema {
  /** URL to be archived (passed from background to injected script) */
  urlToBeArchived: string;
  /** ID of the service to use for archiving */
  serviceId: string;
}

/**
 * Represents a search engine for finding alternative articles.
 */
export interface SearchEngine {
  /** Unique identifier for the search engine */
  id: string;
  /** Display name shown in the UI */
  name: string;
  /** URL template with {query} placeholder for the search term */
  urlTemplate: string;
  /** Whether this is a built-in default search engine */
  isDefault: boolean;
}

// ============================================================================
// Type Guards - Runtime validation for data from external sources (storage)
// ============================================================================

/**
 * Type guard to validate an ArchiveService object.
 * Use when reading from browser.storage to ensure data integrity.
 */
export function isArchiveService(value: unknown): value is ArchiveService {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    (obj.formSelector === null || typeof obj.formSelector === 'string') &&
    (obj.inputSelector === null || typeof obj.inputSelector === 'string') &&
    (obj.shadowDomPath === undefined || Array.isArray(obj.shadowDomPath)) &&
    typeof obj.isDefault === 'boolean'
  );
}

/**
 * Type guard to validate an array of ArchiveService objects.
 */
export function isArchiveServiceArray(value: unknown): value is ArchiveService[] {
  return Array.isArray(value) && value.every(isArchiveService);
}

/**
 * Type guard to validate a SearchEngine object.
 */
export function isSearchEngine(value: unknown): value is SearchEngine {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.urlTemplate === 'string' &&
    typeof obj.isDefault === 'boolean'
  );
}

/**
 * Type guard to validate a SessionSchema object.
 */
export function isSessionSchema(value: unknown): value is SessionSchema {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return typeof obj.urlToBeArchived === 'string' && typeof obj.serviceId === 'string';
}
