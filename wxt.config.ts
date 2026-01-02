import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'Freewall',
    version: '1.2.0',
    description: 'Archive web pages and discover alternative sources for articles',
    permissions: ['contextMenus', 'storage', 'scripting', 'tabs'],
    optional_host_permissions: ['http://*/*', 'https://*/*'],
    action: {
      default_title: 'Archive this page',
    },
    icons: {
      '16': 'icons/icon16.png',
      '32': 'icons/icon32.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    commands: {
      'archive-page': {
        suggested_key: {
          default: 'Alt+Shift+A',
          mac: 'Alt+Shift+A',
        },
        description: 'Archive current page',
      },
    },
  },
});
