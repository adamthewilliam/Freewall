/**
 * Tab management utilities for the extension.
 * Handles tab creation and script injection with proper cleanup.
 */

import { TAB_LISTENER_TIMEOUT_MS } from './constants';
import { hasAllHostsPermission } from './permissions';

/**
 * Opens a new tab adjacent to the specified tab index.
 */
export async function openTabNextTo(url: string, tabIndex: number): Promise<browser.Tabs.Tab> {
  return browser.tabs.create({
    url,
    index: tabIndex + 1,
  });
}

/**
 * Tracks pending script injections to coordinate with tab events.
 * Using a Map allows multiple concurrent archive operations.
 */
const pendingInjections = new Map<
  number,
  {
    cleanup: () => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }
>();

/**
 * Sets up a script injection listener for a newly created tab.
 * Includes proper cleanup to prevent memory leaks:
 * - Removes listeners when tab loads and injection completes
 * - Removes listeners when tab is closed before loading
 * - Removes listeners after timeout (safety net)
 *
 * @param tabId - The ID of the tab to monitor
 * @param onShouldInject - Callback that returns true if injection should proceed
 * @param scriptFile - The script file to inject
 */
export function setupScriptInjection(
  tabId: number,
  onShouldInject: () => Promise<boolean>,
  scriptFile: string = 'injected.js'
): void {
  // Cleanup function to remove all listeners
  const cleanup = () => {
    browser.tabs.onUpdated.removeListener(onUpdatedListener);
    browser.tabs.onRemoved.removeListener(onRemovedListener);

    const pending = pendingInjections.get(tabId);
    if (pending) {
      clearTimeout(pending.timeoutId);
      pendingInjections.delete(tabId);
    }
  };

  // Handler for tab removal (prevents leak if tab closes before loading)
  const onRemovedListener = (removedTabId: number) => {
    if (removedTabId === tabId) {
      cleanup();
    }
  };

  // Handler for tab updates (triggers injection when load completes)
  const onUpdatedListener = async (
    updatedTabId: number,
    changeInfo: browser.Tabs.OnUpdatedChangeInfoType,
    updatedTab: browser.Tabs.Tab
  ) => {
    if (changeInfo.status !== 'complete' || updatedTabId !== tabId) {
      return;
    }

    try {
      const shouldInject = await onShouldInject();
      if (!shouldInject) {
        cleanup();
        return;
      }

      // Verify tab is still in focus before injecting
      const [currentTab] = await browser.tabs.query({
        active: true,
        lastFocusedWindow: true,
      });

      if (currentTab?.index === updatedTab.index && updatedTab.id) {
        // Verify we have permission (should already be granted by handleUserRedirection)
        // Note: We use contains() here, not request(), because this is not a user gesture context
        const hasPermission = await hasAllHostsPermission();
        if (!hasPermission) {
          console.warn('No host permission for script injection - was permission denied earlier?');
          return;
        }

        await browser.scripting.executeScript({
          target: { tabId: updatedTab.id },
          files: [scriptFile],
        });
        console.log('Script injected successfully');
      }
    } catch (error) {
      console.error('Error during script injection:', error);
    } finally {
      cleanup();
    }
  };

  // Set up timeout as safety net (30 seconds default)
  const timeoutId = setTimeout(() => {
    console.warn(`Script injection timeout for tab ${tabId}`);
    cleanup();
  }, TAB_LISTENER_TIMEOUT_MS);

  // Track this injection for cleanup
  pendingInjections.set(tabId, { cleanup, timeoutId });

  // Register listeners
  browser.tabs.onUpdated.addListener(onUpdatedListener);
  browser.tabs.onRemoved.addListener(onRemovedListener);
}

/**
 * Cleans up any pending injection listeners.
 * Useful for extension cleanup or testing.
 */
export function cleanupAllPendingInjections(): void {
  for (const [, pending] of pendingInjections) {
    pending.cleanup();
  }
  pendingInjections.clear();
}
