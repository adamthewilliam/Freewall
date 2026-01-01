import { describe, it, expect } from 'vitest';
import {
  isArchiveService,
  isArchiveServiceArray,
  isSearchEngine,
  isSessionSchema,
} from '../../utils/types';

describe('isArchiveService', () => {
  it('returns true for valid ArchiveService objects', () => {
    const validService = {
      id: 'test-service',
      name: 'Test Service',
      url: 'https://example.com',
      formSelector: '#form',
      inputSelector: '#input',
      isDefault: true,
    };

    expect(isArchiveService(validService)).toBe(true);
  });

  it('returns true when formSelector and inputSelector are null', () => {
    const service = {
      id: 'wayback',
      name: 'Wayback Machine',
      url: 'https://web.archive.org',
      formSelector: null,
      inputSelector: null,
      isDefault: true,
    };

    expect(isArchiveService(service)).toBe(true);
  });

  it('returns true when shadowDomPath is provided', () => {
    const service = {
      id: 'wayback',
      name: 'Wayback Machine',
      url: 'https://web.archive.org',
      formSelector: null,
      inputSelector: null,
      shadowDomPath: ['app-root', 'home-page'],
      isDefault: true,
    };

    expect(isArchiveService(service)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isArchiveService(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isArchiveService(undefined)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isArchiveService('string')).toBe(false);
    expect(isArchiveService(123)).toBe(false);
    expect(isArchiveService(true)).toBe(false);
    expect(isArchiveService([])).toBe(false);
  });

  it('returns false when required properties are missing', () => {
    expect(isArchiveService({ id: 'test' })).toBe(false);
    expect(isArchiveService({ id: 'test', name: 'Test' })).toBe(false);
  });

  it('returns false when properties have wrong types', () => {
    const wrongId = {
      id: 123, // should be string
      name: 'Test',
      url: 'https://example.com',
      formSelector: '#form',
      inputSelector: '#input',
      isDefault: true,
    };
    expect(isArchiveService(wrongId)).toBe(false);

    const wrongIsDefault = {
      id: 'test',
      name: 'Test',
      url: 'https://example.com',
      formSelector: '#form',
      inputSelector: '#input',
      isDefault: 'true', // should be boolean
    };
    expect(isArchiveService(wrongIsDefault)).toBe(false);
  });
});

describe('isArchiveServiceArray', () => {
  it('returns true for empty arrays', () => {
    expect(isArchiveServiceArray([])).toBe(true);
  });

  it('returns true for arrays of valid services', () => {
    const services = [
      {
        id: 'service1',
        name: 'Service 1',
        url: 'https://example1.com',
        formSelector: '#form1',
        inputSelector: '#input1',
        isDefault: true,
      },
      {
        id: 'service2',
        name: 'Service 2',
        url: 'https://example2.com',
        formSelector: null,
        inputSelector: null,
        isDefault: false,
      },
    ];

    expect(isArchiveServiceArray(services)).toBe(true);
  });

  it('returns false if any element is invalid', () => {
    const services = [
      {
        id: 'valid',
        name: 'Valid',
        url: 'https://example.com',
        formSelector: '#form',
        inputSelector: '#input',
        isDefault: true,
      },
      { id: 'invalid' }, // Missing required fields
    ];

    expect(isArchiveServiceArray(services)).toBe(false);
  });

  it('returns false for non-arrays', () => {
    expect(isArchiveServiceArray(null)).toBe(false);
    expect(isArchiveServiceArray(undefined)).toBe(false);
    expect(isArchiveServiceArray('string')).toBe(false);
    expect(isArchiveServiceArray({})).toBe(false);
  });
});

describe('isSearchEngine', () => {
  it('returns true for valid SearchEngine objects', () => {
    const validEngine = {
      id: 'google-news',
      name: 'Google News',
      urlTemplate: 'https://news.google.com/search?q={query}',
      isDefault: true,
    };

    expect(isSearchEngine(validEngine)).toBe(true);
  });

  it('returns false for null and undefined', () => {
    expect(isSearchEngine(null)).toBe(false);
    expect(isSearchEngine(undefined)).toBe(false);
  });

  it('returns false when required properties are missing', () => {
    expect(isSearchEngine({ id: 'test' })).toBe(false);
    expect(isSearchEngine({ id: 'test', name: 'Test' })).toBe(false);
  });

  it('returns false when properties have wrong types', () => {
    const wrongUrlTemplate = {
      id: 'test',
      name: 'Test',
      urlTemplate: 123, // should be string
      isDefault: true,
    };
    expect(isSearchEngine(wrongUrlTemplate)).toBe(false);
  });
});

describe('isSessionSchema', () => {
  it('returns true for valid SessionSchema objects', () => {
    const validSession = {
      urlToBeArchived: 'https://example.com/article',
      serviceId: 'archive-ph',
    };

    expect(isSessionSchema(validSession)).toBe(true);
  });

  it('returns false for null and undefined', () => {
    expect(isSessionSchema(null)).toBe(false);
    expect(isSessionSchema(undefined)).toBe(false);
  });

  it('returns false when properties are missing', () => {
    expect(isSessionSchema({ urlToBeArchived: 'https://example.com' })).toBe(false);
    expect(isSessionSchema({ serviceId: 'test' })).toBe(false);
  });

  it('returns false when properties have wrong types', () => {
    expect(isSessionSchema({ urlToBeArchived: 123, serviceId: 'test' })).toBe(false);
    expect(isSessionSchema({ urlToBeArchived: 'url', serviceId: null })).toBe(false);
  });
});
