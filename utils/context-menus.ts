/**
 * Context menu setup and management for the extension.
 */

import { CONTEXT_MENU_IDS } from './constants';

/**
 * Creates all context menu items for the extension.
 * Should be called on install and startup to ensure menus are always available.
 */
export async function createContextMenus(): Promise<void> {
  // Clear existing menus to prevent duplicates
  await browser.contextMenus.removeAll();

  // Archive context menu for links
  browser.contextMenus.create(
    {
      id: CONTEXT_MENU_IDS.ARCHIVE_PAGE,
      title: 'Archive this page',
      type: 'normal',
      contexts: ['link'],
    },
    () => {
      if (browser.runtime.lastError) {
        console.error('Failed to create archive menu:', browser.runtime.lastError);
      }
    }
  );

  // Find alternatives for current page
  browser.contextMenus.create(
    {
      id: CONTEXT_MENU_IDS.FIND_ALTERNATIVES,
      title: 'Find alternative articles',
      type: 'normal',
      contexts: ['page'],
    },
    () => {
      if (browser.runtime.lastError) {
        console.error('Failed to create alternatives menu:', browser.runtime.lastError);
      }
    }
  );

  // Find alternatives for a link
  browser.contextMenus.create(
    {
      id: CONTEXT_MENU_IDS.FIND_ALTERNATIVES_LINK,
      title: 'Find alternatives for this link',
      type: 'normal',
      contexts: ['link'],
    },
    () => {
      if (browser.runtime.lastError) {
        console.error('Failed to create link alternatives menu:', browser.runtime.lastError);
      }
    }
  );
}

/**
 * Registers context menu creation for both install and startup events.
 * This ensures menus are always available even after browser restarts.
 */
export function registerContextMenuListeners(): void {
  browser.runtime.onInstalled.addListener(() => {
    createContextMenus();
  });

  // Recreate menus on browser startup (can be lost in some scenarios)
  browser.runtime.onStartup.addListener(() => {
    createContextMenus();
  });
}
