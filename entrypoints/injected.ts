/**
 * Injected script that runs on archive service pages.
 * Automatically fills the URL input and submits the archive form.
 */

import { getServiceById, getSessionData } from '@/utils/storage';
import { MAX_SHADOW_DOM_ATTEMPTS, SHADOW_DOM_RETRY_DELAY_MS } from '@/utils/constants';
import type { ArchiveService } from '@/utils/types';

export default defineUnlistedScript(async () => {
  await fillArchiveForm();
});

/**
 * Retrieves session data and fills the archive form.
 */
async function fillArchiveForm(): Promise<void> {
  const sessionData = await getSessionData();

  if (!sessionData) {
    console.error('Freewall: No URL found in session storage');
    return;
  }

  const { urlToBeArchived, serviceId } = sessionData;
  console.log(`Freewall: URL to archive: ${urlToBeArchived}`);

  const service = await getServiceById(serviceId);

  if (!service) {
    console.error(`Freewall: Service not found: ${serviceId}`);
    return;
  }

  // Handle based on service configuration
  if (service.shadowDomPath) {
    handleShadowDomService(service, urlToBeArchived);
  } else if (service.formSelector && service.inputSelector) {
    handleStandardService(service, urlToBeArchived);
  } else {
    console.error('Freewall: Service has no form configuration');
  }
}

/**
 * Handle services with standard DOM (like archive.ph).
 */
function handleStandardService(service: ArchiveService, url: string): void {
  const form = document.querySelector<HTMLFormElement>(service.formSelector!);
  const textBox = form?.querySelector<HTMLInputElement>(service.inputSelector!);

  if (form && textBox) {
    textBox.value = url;
    form.requestSubmit();
    console.log(`Freewall: Form submitted to ${service.name}`);
  } else {
    console.error(`Freewall: Could not find form elements for ${service.name}`);
    console.error(`  Form selector: ${service.formSelector}`);
    console.error(`  Input selector: ${service.inputSelector}`);
  }
}

/**
 * Handle services with Shadow DOM (like Wayback Machine).
 */
function handleShadowDomService(service: ArchiveService, url: string): void {
  if (!service.shadowDomPath || service.shadowDomPath.length === 0) {
    console.error('Freewall: No shadow DOM path configured');
    return;
  }

  // Special handling for Wayback Machine's specific structure
  if (service.id === 'wayback') {
    handleWaybackMachine(url);
    return;
  }

  // Generic shadow DOM traversal for custom services
  console.warn('Freewall: Generic shadow DOM traversal not implemented for custom services');
}

/**
 * Waits for an element to appear in the DOM using MutationObserver.
 * Falls back to null after timeout.
 */
function waitForElement<T extends Element>(
  selector: string,
  root: ParentNode = document,
  timeout: number = SHADOW_DOM_RETRY_DELAY_MS * MAX_SHADOW_DOM_ATTEMPTS
): Promise<T | null> {
  return new Promise((resolve) => {
    // Check if element already exists
    const existing = root.querySelector<T>(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    // Set up observer
    const observer = new MutationObserver(() => {
      const element = root.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    // Timeout fallback
    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Waits for an element's shadow root to become available.
 */
function waitForShadowRoot(
  element: Element,
  timeout: number = SHADOW_DOM_RETRY_DELAY_MS * MAX_SHADOW_DOM_ATTEMPTS
): Promise<ShadowRoot | null> {
  return new Promise((resolve) => {
    // Check if shadow root already exists
    if (element.shadowRoot) {
      resolve(element.shadowRoot);
      return;
    }

    // Poll for shadow root (MutationObserver can't observe shadow root attachment)
    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (element.shadowRoot) {
        clearInterval(checkInterval);
        resolve(element.shadowRoot);
        return;
      }

      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        resolve(null);
      }
    }, SHADOW_DOM_RETRY_DELAY_MS);
  });
}

/**
 * Handle Wayback Machine's specific Shadow DOM structure.
 * Uses MutationObserver for initial elements and polling for shadow roots.
 */
async function handleWaybackMachine(url: string): Promise<void> {
  try {
    // Step 1: Wait for app-root element
    const appRoot = await waitForElement('app-root');
    if (!appRoot) {
      console.error('Freewall: Could not find app-root');
      return;
    }

    // Step 2: Wait for app-root's shadow root
    const appShadow = await waitForShadowRoot(appRoot);
    if (!appShadow) {
      console.error('Freewall: Could not find app-root shadow root');
      return;
    }

    // Step 3: Wait for router-slot and home-page
    const routerSlot = await waitForElement('router-slot', appShadow);
    if (!routerSlot) {
      console.error('Freewall: Could not find router-slot');
      return;
    }

    const homePage = await waitForElement('home-page', routerSlot);
    if (!homePage) {
      console.error('Freewall: Could not find home-page');
      return;
    }

    // Step 4: Wait for home-page's shadow root
    const homeShadow = await waitForShadowRoot(homePage);
    if (!homeShadow) {
      console.error('Freewall: Could not find home-page shadow root');
      return;
    }

    // Step 5: Wait for ia-wayback-search
    const waybackSearch = await waitForElement('ia-wayback-search', homeShadow);
    if (!waybackSearch) {
      console.error('Freewall: Could not find ia-wayback-search');
      return;
    }

    // Step 6: Wait for ia-wayback-search's shadow root
    const searchShadow = await waitForShadowRoot(waybackSearch);
    if (!searchShadow) {
      console.error('Freewall: Could not find ia-wayback-search shadow root');
      return;
    }

    // Step 7: Wait for form elements
    const form = await waitForElement<HTMLFormElement>('form', searchShadow);
    const textBox = await waitForElement<HTMLInputElement>('#url', searchShadow);

    if (form && textBox) {
      textBox.value = url;
      form.requestSubmit();
      console.log('Freewall: Form submitted to Wayback Machine');
    } else {
      console.error('Freewall: Could not find Wayback Machine form elements');
    }
  } catch (error) {
    console.error('Freewall: Error in Wayback Machine handler:', error);
  }
}
