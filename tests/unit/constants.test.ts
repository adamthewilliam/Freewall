import { describe, it, expect } from 'vitest';
import {
  looksLikeArticleId,
  NUMERIC_ID_PATTERN,
  HEX_ID_PATTERN,
  ALPHANUMERIC_ID_PATTERN,
  TITLE_SUFFIX_PATTERN,
  FILE_EXTENSION_PATTERN,
} from '../../utils/constants';

describe('looksLikeArticleId', () => {
  describe('numeric IDs (5+ digits)', () => {
    it('returns true for 5+ digit numbers', () => {
      expect(looksLikeArticleId('12345')).toBe(true);
      expect(looksLikeArticleId('123456')).toBe(true);
      expect(looksLikeArticleId('9876543210')).toBe(true);
    });

    it('returns false for 4 or fewer digits', () => {
      expect(looksLikeArticleId('1234')).toBe(false);
      expect(looksLikeArticleId('123')).toBe(false);
      expect(looksLikeArticleId('1')).toBe(false);
    });
  });

  describe('hex-like IDs (8+ chars)', () => {
    it('returns true for 8+ character hex strings', () => {
      expect(looksLikeArticleId('a1b2c3d4')).toBe(true);
      expect(looksLikeArticleId('deadbeef')).toBe(true);
      expect(looksLikeArticleId('A1B2C3D4E5')).toBe(true);
      expect(looksLikeArticleId('0123456789abcdef')).toBe(true);
    });

    it('returns false for shorter hex strings without digits', () => {
      // Pure hex strings without digits (letters only) shorter than 8 chars
      // Note: Strings with digits 6+ chars match the alphanumeric pattern
      expect(looksLikeArticleId('abcdefg')).toBe(false); // 7 chars, pure letters (not hex)
      expect(looksLikeArticleId('abcdef')).toBe(false); // 6 chars, no digit
    });
  });

  describe('alphanumeric IDs with digits (6+ chars)', () => {
    it('returns true for 6+ char alphanumeric with at least one digit', () => {
      expect(looksLikeArticleId('abc123')).toBe(true);
      expect(looksLikeArticleId('article1')).toBe(true);
      expect(looksLikeArticleId('1article')).toBe(true);
      expect(looksLikeArticleId('art1cle')).toBe(true);
    });

    it('returns false for alphanumeric without digits', () => {
      expect(looksLikeArticleId('abcdef')).toBe(false);
      expect(looksLikeArticleId('article')).toBe(false);
    });

    it('returns false for short alphanumeric with digits', () => {
      expect(looksLikeArticleId('abc1')).toBe(false);
      expect(looksLikeArticleId('a1b2c')).toBe(false);
    });
  });

  describe('non-ID strings', () => {
    it('returns false for regular words', () => {
      expect(looksLikeArticleId('article')).toBe(false);
      expect(looksLikeArticleId('news')).toBe(false);
      expect(looksLikeArticleId('breaking')).toBe(false);
    });

    it('returns false for short strings', () => {
      expect(looksLikeArticleId('ab')).toBe(false);
      expect(looksLikeArticleId('a')).toBe(false);
      expect(looksLikeArticleId('')).toBe(false);
    });
  });
});

describe('NUMERIC_ID_PATTERN', () => {
  it('matches 5+ digit numbers', () => {
    expect(NUMERIC_ID_PATTERN.test('12345')).toBe(true);
    expect(NUMERIC_ID_PATTERN.test('123456789')).toBe(true);
  });

  it('does not match 4 or fewer digits', () => {
    expect(NUMERIC_ID_PATTERN.test('1234')).toBe(false);
    expect(NUMERIC_ID_PATTERN.test('123')).toBe(false);
  });

  it('does not match mixed alphanumeric', () => {
    expect(NUMERIC_ID_PATTERN.test('12345a')).toBe(false);
  });
});

describe('HEX_ID_PATTERN', () => {
  it('matches 8+ character hex strings (case insensitive)', () => {
    expect(HEX_ID_PATTERN.test('abcdef12')).toBe(true);
    expect(HEX_ID_PATTERN.test('ABCDEF12')).toBe(true);
    expect(HEX_ID_PATTERN.test('0123456789abcdef')).toBe(true);
  });

  it('does not match shorter hex strings', () => {
    expect(HEX_ID_PATTERN.test('abcdef1')).toBe(false);
  });

  it('does not match non-hex characters', () => {
    expect(HEX_ID_PATTERN.test('abcdefgh')).toBe(false);
  });
});

describe('ALPHANUMERIC_ID_PATTERN', () => {
  it('matches 6+ character alphanumeric with at least one digit', () => {
    expect(ALPHANUMERIC_ID_PATTERN.test('abc123')).toBe(true);
    expect(ALPHANUMERIC_ID_PATTERN.test('123abc')).toBe(true);
    expect(ALPHANUMERIC_ID_PATTERN.test('a1b2c3')).toBe(true);
  });

  it('does not match strings without digits', () => {
    expect(ALPHANUMERIC_ID_PATTERN.test('abcdef')).toBe(false);
  });

  it('does not match strings shorter than 6 characters', () => {
    expect(ALPHANUMERIC_ID_PATTERN.test('abc12')).toBe(false);
  });
});

describe('TITLE_SUFFIX_PATTERN', () => {
  it('matches pipe separators', () => {
    expect('Article | Site'.replace(TITLE_SUFFIX_PATTERN, '')).toBe('Article');
  });

  it('matches dash separators', () => {
    expect('Article - Site'.replace(TITLE_SUFFIX_PATTERN, '')).toBe('Article');
  });

  it('matches colon separators', () => {
    expect('Article: Site'.replace(TITLE_SUFFIX_PATTERN, '')).toBe('Article');
  });

  it('matches en-dash separators', () => {
    expect('Article \u2013 Site'.replace(TITLE_SUFFIX_PATTERN, '')).toBe('Article');
  });

  it('matches em-dash separators', () => {
    expect('Article \u2014 Site'.replace(TITLE_SUFFIX_PATTERN, '')).toBe('Article');
  });
});

describe('FILE_EXTENSION_PATTERN', () => {
  it('matches common file extensions', () => {
    expect(FILE_EXTENSION_PATTERN.test('.html')).toBe(true);
    expect(FILE_EXTENSION_PATTERN.test('.htm')).toBe(true);
    expect(FILE_EXTENSION_PATTERN.test('.php')).toBe(true);
    expect(FILE_EXTENSION_PATTERN.test('.asp')).toBe(true);
    expect(FILE_EXTENSION_PATTERN.test('.aspx')).toBe(true);
  });

  it('is case insensitive', () => {
    expect(FILE_EXTENSION_PATTERN.test('.HTML')).toBe(true);
    expect(FILE_EXTENSION_PATTERN.test('.PHP')).toBe(true);
  });

  it('does not match other extensions', () => {
    expect(FILE_EXTENSION_PATTERN.test('.js')).toBe(false);
    expect(FILE_EXTENSION_PATTERN.test('.css')).toBe(false);
    expect(FILE_EXTENSION_PATTERN.test('.jpg')).toBe(false);
  });
});
