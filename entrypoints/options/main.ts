import {
  getArchiveServices,
  getSelectedService,
  setSelectedService,
  addCustomService,
  removeCustomService,
  getSearchEngines,
  getSelectedSearchEngine,
  setSelectedSearchEngine,
} from '@/utils/storage';

/**
 * Gets a required DOM element by ID with proper type safety.
 * Throws an error if the element doesn't exist (fail-fast for required elements).
 */
function getRequiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required element #${id} not found in DOM`);
  }
  return element as T;
}

// DOM elements (validated at module load time)
const servicesList = getRequiredElement<HTMLDivElement>('services-list');
const searchEnginesList = getRequiredElement<HTMLDivElement>('search-engines-list');
const addForm = getRequiredElement<HTMLFormElement>('add-service-form');

/**
 * Initialize the options page.
 */
async function init(): Promise<void> {
  await renderServicesList();
  await renderSearchEnginesList();
  setupEventListeners();
}

/**
 * Render the list of archive services using safe DOM methods.
 */
async function renderServicesList(): Promise<void> {
  const services = await getArchiveServices();
  const selected = await getSelectedService();

  // Clear existing content
  servicesList.replaceChildren();

  for (const service of services) {
    const label = document.createElement('label');
    label.className = `service-item ${service.id === selected.id ? 'selected' : ''}`;
    label.dataset.id = service.id;

    // Radio input
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'service';
    radio.value = service.id;
    radio.checked = service.id === selected.id;

    // Service info container
    const infoDiv = document.createElement('div');
    infoDiv.className = 'service-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'service-name';
    nameDiv.textContent = service.name;

    const urlDiv = document.createElement('div');
    urlDiv.className = 'service-url';
    urlDiv.textContent = service.url;

    infoDiv.appendChild(nameDiv);
    infoDiv.appendChild(urlDiv);

    // Badge
    const badge = document.createElement('span');
    badge.className = `service-badge ${service.isDefault ? 'badge-default' : 'badge-custom'}`;
    badge.textContent = service.isDefault ? 'Default' : 'Custom';

    // Assemble label
    label.appendChild(radio);
    label.appendChild(infoDiv);
    label.appendChild(badge);

    // Delete button for custom services
    if (!service.isDefault) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'btn-delete';
      deleteBtn.dataset.delete = service.id;
      deleteBtn.textContent = 'Remove';
      label.appendChild(deleteBtn);
    }

    servicesList.appendChild(label);
  }
}

/**
 * Render the list of search engines using safe DOM methods.
 */
async function renderSearchEnginesList(): Promise<void> {
  const engines = getSearchEngines();
  const selected = await getSelectedSearchEngine();

  // Clear existing content
  searchEnginesList.replaceChildren();

  for (const engine of engines) {
    const label = document.createElement('label');
    label.className = `service-item ${engine.id === selected.id ? 'selected' : ''}`;
    label.dataset.id = engine.id;

    // Radio input
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'searchEngine';
    radio.value = engine.id;
    radio.checked = engine.id === selected.id;

    // Engine info container
    const infoDiv = document.createElement('div');
    infoDiv.className = 'service-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'service-name';
    nameDiv.textContent = engine.name;

    infoDiv.appendChild(nameDiv);

    // Assemble label
    label.appendChild(radio);
    label.appendChild(infoDiv);

    searchEnginesList.appendChild(label);
  }
}

/**
 * Set up event listeners.
 */
function setupEventListeners(): void {
  // Handle archive service selection
  servicesList.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'radio' && target.name === 'service') {
      await setSelectedService(target.value);
      await renderServicesList();
    }
  });

  // Handle search engine selection
  searchEnginesList.addEventListener('change', async (e) => {
    const target = e.target as HTMLInputElement;
    if (target.type === 'radio' && target.name === 'searchEngine') {
      await setSelectedSearchEngine(target.value);
      await renderSearchEnginesList();
    }
  });

  // Handle delete button clicks
  servicesList.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const deleteId = target.dataset.delete;
    if (deleteId) {
      e.preventDefault();
      if (confirm('Are you sure you want to remove this service?')) {
        await removeCustomService(deleteId);
        await renderServicesList();
      }
    }
  });

  // Handle add service form
  addForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(addForm);
    const name = formData.get('name') as string;
    const url = formData.get('url') as string;
    const formSelector = formData.get('formSelector') as string;
    const inputSelector = formData.get('inputSelector') as string;

    // Validate URL
    try {
      new URL(url);
    } catch {
      showStatus('Invalid URL format', 'error');
      return;
    }

    // Add the service
    try {
      await addCustomService({
        name: name.trim(),
        url: url.trim(),
        formSelector: formSelector.trim(),
        inputSelector: inputSelector.trim(),
      });

      addForm.reset();
      await renderServicesList();
      showStatus(`${name} has been added!`, 'success');
    } catch (error) {
      showStatus('Failed to add service', 'error');
      console.error(error);
    }
  });
}

/**
 * Show a status message using safe DOM methods.
 */
function showStatus(message: string, type: 'success' | 'error'): void {
  // Remove existing status
  const existing = document.querySelector('.status');
  if (existing) {
    existing.remove();
  }

  const status = document.createElement('div');
  status.className = `status status-${type}`;
  status.textContent = message;
  addForm.appendChild(status);

  // Auto-remove after 3 seconds
  setTimeout(() => status.remove(), 3000);
}

// Initialize on load
init();
