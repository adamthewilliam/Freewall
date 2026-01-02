/**
 * Permission utilities for handling optional host permissions.
 * Provides functions to check and request permissions before script injection.
 */

/**
 * All hosts pattern for requesting broad access.
 * Requested once rather than per-origin for better UX.
 */
const ALL_HOSTS_PATTERN = ['http://*/*', 'https://*/*'];

/**
 * Checks if we currently have permission to access all hosts.
 * Note: Use this only for non-user-gesture contexts (e.g., checking before showing UI).
 */
export async function hasAllHostsPermission(): Promise<boolean> {
  return browser.permissions.contains({
    origins: ALL_HOSTS_PATTERN,
  });
}

/**
 * Ensures we have host permission before performing an action.
 * IMPORTANT: This must be called as the FIRST async operation after a user gesture.
 * In MV3 service workers, user gesture context is lost after any await.
 *
 * If permission is already granted, returns true immediately (no prompt).
 * If permission is not granted, shows browser permission prompt.
 * Returns true if granted, false if denied.
 */
export async function ensureHostPermission(): Promise<boolean> {
  // Call request() directly - it returns true immediately if already granted.
  // We cannot check contains() first because that await loses the user gesture.
  return browser.permissions.request({
    origins: ALL_HOSTS_PATTERN,
  });
}
