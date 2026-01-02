/**
 * Background script for the Freewall extension.
 * Handles user interactions (toolbar, context menu, keyboard) and coordinates
 * archiving and alternative article search workflows.
 */

import { getSelectedService, setSessionData, getSelectedSearchEngine, getSessionData } from '@/utils/storage';
import { registerContextMenuListeners } from '@/utils/context-menus';
import { openTabNextTo, setupScriptInjection } from '@/utils/tab-manager';
import { cleanArticleTitle, parseArticleSlugFromUrl, extractArticleTitleFromDOM } from '@/utils/url-parser';
import { ensureHostPermission } from '@/utils/permissions';
import { CONTEXT_MENU_IDS } from '@/utils/constants';

export default defineBackground(() => {
  // Security note: This allows injected scripts to access session storage.
  // Required for passing archive URL from background to injected script.
  // Session storage is cleared when browser closes, limiting exposure.
  browser.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS' });

  // Register context menu creation for install and startup
  registerContextMenuListeners();

  // Handle context menu clicks
  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === CONTEXT_MENU_IDS.ARCHIVE_PAGE && info.linkUrl && tab?.index !== undefined) {
      handleUserRedirection(info.linkUrl, tab.index);
    }

    if (info.menuItemId === CONTEXT_MENU_IDS.FIND_ALTERNATIVES && tab?.id && tab.index !== undefined) {
      handleFindAlternatives(tab.id, tab.index);
    }

    if (info.menuItemId === CONTEXT_MENU_IDS.FIND_ALTERNATIVES_LINK && info.linkUrl && tab?.index !== undefined) {
      handleFindAlternativesForUrl(info.linkUrl, tab.index);
    }
  });

  // Handle toolbar icon click
  browser.action.onClicked.addListener((tab) => {
    if (tab.url && tab.index !== undefined) {
      handleUserRedirection(tab.url, tab.index);
    }
  });

  // Handle keyboard shortcut
  browser.commands.onCommand.addListener((command) => {
    if (command === 'archive-page') {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then(([tab]) => {
          if (tab?.url && tab.index !== undefined) {
            handleUserRedirection(tab.url, tab.index);
          }
        })
        .catch((error) => {
          console.error('Error handling archive command:', error);
        });
    }
  });

  // Listen for new tab creation to inject script when archive page loads
  browser.tabs.onCreated.addListener((createdTab) => {
    if (!createdTab.id) return;

    setupScriptInjection(
      createdTab.id,
      async () => {
        // Check if we have session data (archive redirection pending)
        const sessionData = await getSessionData();
        return sessionData !== null;
      },
      'injected.js'
    );
  });
});

/**
 * Opens the selected archive service in a new tab with the given URL.
 */
async function handleUserRedirection(url: string, tabIndex: number): Promise<void> {
  console.log('Redirecting URL:', url, 'at index:', tabIndex);

  // Request permission while still in user gesture context
  // This is important because permissions.request() requires a user gesture
  const hasPermission = await ensureHostPermission();
  if (!hasPermission) {
    console.warn('Permission denied for archiving');
    return;
  }

  const service = await getSelectedService();

  // Store URL and service ID BEFORE creating tab to avoid race condition
  await setSessionData(url, service.id);
  console.log(`URL stored for archiving with ${service.name}: ${url}`);

  await openTabNextTo(service.url, tabIndex);
}

/**
 * Extract article title from the current tab and open a search for alternatives.
 */
async function handleFindAlternatives(tabId: number, tabIndex: number): Promise<void> {
  try {
    // Ensure we have permission to inject scripts
    const hasPermission = await ensureHostPermission();
    if (!hasPermission) {
      console.warn('Permission denied for title extraction');
      return;
    }

    // Inject script to extract the article title
    const results = await browser.scripting.executeScript({
      target: { tabId },
      func: extractArticleTitleFromDOM,
    });

    const title = results[0]?.result;
    if (!title) {
      console.error('Could not extract article title');
      return;
    }

    const cleanedTitle = cleanArticleTitle(title);

    const searchEngine = await getSelectedSearchEngine();
    const searchUrl = searchEngine.urlTemplate.replace('{query}', encodeURIComponent(cleanedTitle));

    await openTabNextTo(searchUrl, tabIndex);

    console.log(`Searching for alternatives: "${cleanedTitle}" using ${searchEngine.name}`);
  } catch (error) {
    console.error('Error finding alternatives:', error);
  }
}

/**
 * Extract a search query from a URL and open a search for alternatives.
 * Used when right-clicking on a link.
 */
async function handleFindAlternativesForUrl(url: string, tabIndex: number): Promise<void> {
  try {
    const query = parseArticleSlugFromUrl(url);

    const searchEngine = await getSelectedSearchEngine();
    const searchUrl = searchEngine.urlTemplate.replace('{query}', encodeURIComponent(query));

    await openTabNextTo(searchUrl, tabIndex);

    console.log(`Searching for alternatives to link: "${query}" using ${searchEngine.name}`);
  } catch (error) {
    console.error('Error finding alternatives for URL:', error);
  }
}
