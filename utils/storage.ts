import type { ArchiveService, SessionSchema, SearchEngine } from './types';
import { isArchiveServiceArray } from './types';

/**
 * Default archive services provided by the extension.
 */
export const DEFAULT_SERVICES: ArchiveService[] = [
  {
    id: 'archive-ph',
    name: 'Archive.ph',
    url: 'https://archive.ph/',
    formSelector: '#submiturl',
    inputSelector: '#url',
    isDefault: true,
  },
  {
    id: 'wayback',
    name: 'Wayback Machine',
    url: 'https://web.archive.org/',
    formSelector: 'wayback-search form',
    inputSelector: '#url',
    isDefault: true,
  },
];

/**
 * Default search engines for finding alternative articles.
 */
export const DEFAULT_SEARCH_ENGINES: SearchEngine[] = [
  {
    id: 'google-news',
    name: 'Google News',
    urlTemplate: 'https://news.google.com/search?q={query}',
    isDefault: true,
  },
  {
    id: 'bing-news',
    name: 'Bing News',
    urlTemplate: 'https://www.bing.com/news/search?q={query}',
    isDefault: true,
  },
  {
    id: 'duckduckgo-news',
    name: 'DuckDuckGo News',
    urlTemplate: 'https://duckduckgo.com/?q={query}&iar=news&ia=news',
    isDefault: true,
  },
  {
    id: 'google-search',
    name: 'Google Search',
    urlTemplate: 'https://www.google.com/search?q={query}',
    isDefault: true,
  },
];

const STORAGE_KEYS = {
  SELECTED_SERVICE_ID: 'selectedServiceId',
  CUSTOM_SERVICES: 'customServices',
  SELECTED_SEARCH_ENGINE_ID: 'selectedSearchEngineId',
} as const;

const SESSION_KEYS = {
  URL_TO_BE_ARCHIVED: 'urlToBeArchived',
  SERVICE_ID: 'serviceId',
} as const;

/**
 * Get all available archive services (defaults + custom).
 */
export async function getArchiveServices(): Promise<ArchiveService[]> {
  const customServices = await getCustomServices();
  return [...DEFAULT_SERVICES, ...customServices];
}

/**
 * Get only custom services added by the user.
 * Uses type guard to validate storage data integrity.
 */
export async function getCustomServices(): Promise<ArchiveService[]> {
  const result = await browser.storage.sync.get(STORAGE_KEYS.CUSTOM_SERVICES);
  const stored = result[STORAGE_KEYS.CUSTOM_SERVICES];

  // Validate storage data - return empty array if corrupted
  if (stored === undefined || stored === null) {
    return [];
  }

  if (!isArchiveServiceArray(stored)) {
    console.warn('Custom services storage data is corrupted, resetting to empty');
    return [];
  }

  return stored;
}

/**
 * Get the currently selected archive service.
 * Batches storage reads for better performance.
 */
export async function getSelectedService(): Promise<ArchiveService> {
  // Batch both storage reads into a single call
  const result = await browser.storage.sync.get([
    STORAGE_KEYS.SELECTED_SERVICE_ID,
    STORAGE_KEYS.CUSTOM_SERVICES,
  ]);

  const selectedId =
    typeof result[STORAGE_KEYS.SELECTED_SERVICE_ID] === 'string'
      ? result[STORAGE_KEYS.SELECTED_SERVICE_ID]
      : DEFAULT_SERVICES[0].id;

  // Build all services from batched data
  const storedCustom = result[STORAGE_KEYS.CUSTOM_SERVICES];
  const customServices = isArchiveServiceArray(storedCustom) ? storedCustom : [];
  const allServices = [...DEFAULT_SERVICES, ...customServices];

  const selected = allServices.find((s) => s.id === selectedId);

  // Fallback to first default if selected service was deleted
  return selected || DEFAULT_SERVICES[0];
}

/**
 * Set the selected archive service.
 */
export async function setSelectedService(serviceId: string): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEYS.SELECTED_SERVICE_ID]: serviceId });
}

/**
 * Add a custom archive service.
 */
export async function addCustomService(service: Omit<ArchiveService, 'id' | 'isDefault'>): Promise<ArchiveService> {
  const customServices = await getCustomServices();

  const newService: ArchiveService = {
    ...service,
    id: `custom-${Date.now()}`,
    isDefault: false,
  };

  customServices.push(newService);
  await browser.storage.sync.set({ [STORAGE_KEYS.CUSTOM_SERVICES]: customServices });

  return newService;
}

/**
 * Remove a custom archive service.
 */
export async function removeCustomService(serviceId: string): Promise<void> {
  const customServices = await getCustomServices();
  const filtered = customServices.filter((s) => s.id !== serviceId);
  await browser.storage.sync.set({ [STORAGE_KEYS.CUSTOM_SERVICES]: filtered });

  // If the removed service was selected, reset to default
  const result = await browser.storage.sync.get(STORAGE_KEYS.SELECTED_SERVICE_ID);
  if (result[STORAGE_KEYS.SELECTED_SERVICE_ID] === serviceId) {
    await setSelectedService(DEFAULT_SERVICES[0].id);
  }
}

/**
 * Store data for the injected script to use.
 */
export async function setSessionData(url: string, serviceId: string): Promise<void> {
  await browser.storage.session.set({
    [SESSION_KEYS.URL_TO_BE_ARCHIVED]: url,
    [SESSION_KEYS.SERVICE_ID]: serviceId,
  });
}

/**
 * Get session data in the injected script.
 * Validates types to ensure data integrity.
 */
export async function getSessionData(): Promise<SessionSchema | null> {
  const result = await browser.storage.session.get([SESSION_KEYS.URL_TO_BE_ARCHIVED, SESSION_KEYS.SERVICE_ID]);

  const url = result[SESSION_KEYS.URL_TO_BE_ARCHIVED];
  const serviceId = result[SESSION_KEYS.SERVICE_ID];

  // Validate both fields exist and are strings
  if (typeof url !== 'string' || typeof serviceId !== 'string') {
    return null;
  }

  return { urlToBeArchived: url, serviceId };
}

/**
 * Get a service by its ID.
 */
export async function getServiceById(serviceId: string): Promise<ArchiveService | undefined> {
  const allServices = await getArchiveServices();
  return allServices.find((s) => s.id === serviceId);
}

/**
 * Get all available search engines.
 */
export function getSearchEngines(): SearchEngine[] {
  return DEFAULT_SEARCH_ENGINES;
}

/**
 * Get the currently selected search engine.
 * Validates storage data types.
 */
export async function getSelectedSearchEngine(): Promise<SearchEngine> {
  const result = await browser.storage.sync.get(STORAGE_KEYS.SELECTED_SEARCH_ENGINE_ID);
  const stored = result[STORAGE_KEYS.SELECTED_SEARCH_ENGINE_ID];

  const selectedId = typeof stored === 'string' ? stored : DEFAULT_SEARCH_ENGINES[0].id;

  const engine = DEFAULT_SEARCH_ENGINES.find((e) => e.id === selectedId);
  return engine || DEFAULT_SEARCH_ENGINES[0];
}

/**
 * Set the selected search engine.
 */
export async function setSelectedSearchEngine(engineId: string): Promise<void> {
  await browser.storage.sync.set({ [STORAGE_KEYS.SELECTED_SEARCH_ENGINE_ID]: engineId });
}
