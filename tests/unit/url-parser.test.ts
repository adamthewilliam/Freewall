import { describe, it, expect } from 'vitest';
import { cleanArticleTitle, parseArticleSlugFromUrl } from '../../utils/url-parser';

describe('cleanArticleTitle', () => {
  it('removes pipe-separated site names', () => {
    expect(cleanArticleTitle('Breaking News | CNN')).toBe('Breaking News');
    expect(cleanArticleTitle('Article Title | The New York Times')).toBe('Article Title');
  });

  it('removes dash-separated site names', () => {
    expect(cleanArticleTitle('Breaking News - BBC')).toBe('Breaking News');
    expect(cleanArticleTitle('Story Title - The Guardian')).toBe('Story Title');
  });

  it('removes colon-separated site names', () => {
    expect(cleanArticleTitle('Report: Publisher Name')).toBe('Report');
  });

  it('removes en-dash separated site names', () => {
    expect(cleanArticleTitle('Article Title \u2013 Publisher')).toBe('Article Title');
  });

  it('removes em-dash separated site names', () => {
    expect(cleanArticleTitle('Article Title \u2014 Publisher')).toBe('Article Title');
  });

  it('preserves titles without separators', () => {
    expect(cleanArticleTitle('Simple Title')).toBe('Simple Title');
    expect(cleanArticleTitle('A Very Long Article Title Without Any Site Name')).toBe(
      'A Very Long Article Title Without Any Site Name'
    );
  });

  it('handles empty strings', () => {
    expect(cleanArticleTitle('')).toBe('');
  });

  it('trims whitespace', () => {
    expect(cleanArticleTitle('  Article Title | Site  ')).toBe('Article Title');
  });

  it('only removes the last separator segment', () => {
    expect(cleanArticleTitle('Part 1 | Part 2 | Site Name')).toBe('Part 1 | Part 2');
  });
});

describe('parseArticleSlugFromUrl', () => {
  it('extracts readable words from hyphenated slugs', () => {
    expect(parseArticleSlugFromUrl('https://example.com/news/breaking-news-article')).toBe(
      'breaking news article'
    );
  });

  it('extracts readable words from underscored slugs', () => {
    expect(parseArticleSlugFromUrl('https://example.com/news/breaking_news_article')).toBe(
      'breaking news article'
    );
  });

  it('removes file extensions', () => {
    expect(parseArticleSlugFromUrl('https://example.com/article-title.html')).toBe('article title');
    expect(parseArticleSlugFromUrl('https://example.com/article-title.php')).toBe('article title');
    expect(parseArticleSlugFromUrl('https://example.com/article-title.aspx')).toBe('article title');
  });

  it('removes trailing numeric IDs (5+ digits)', () => {
    expect(parseArticleSlugFromUrl('https://example.com/breaking-news-123456')).toBe('breaking news');
    expect(parseArticleSlugFromUrl('https://example.com/article-9876543210')).toBe('article');
  });

  it('removes trailing hex-like IDs (8+ chars)', () => {
    expect(parseArticleSlugFromUrl('https://example.com/article-a1b2c3d4e5')).toBe('article');
    expect(parseArticleSlugFromUrl('https://example.com/story-deadbeef12')).toBe('story');
  });

  it('removes trailing alphanumeric IDs with digits (6+ chars)', () => {
    expect(parseArticleSlugFromUrl('https://example.com/article-abc123def')).toBe('article');
  });

  it('removes leading numeric IDs', () => {
    expect(parseArticleSlugFromUrl('https://example.com/12345-article-title')).toBe('article title');
  });

  it('uses hostname as fallback for short slugs', () => {
    expect(parseArticleSlugFromUrl('https://example.com/abc')).toBe('example.com article');
    expect(parseArticleSlugFromUrl('https://www.example.com/')).toBe('example.com article');
  });

  it('handles URLs with no path', () => {
    expect(parseArticleSlugFromUrl('https://example.com')).toBe('example.com article');
  });

  it('handles complex real-world URLs', () => {
    // NY Times style URL
    const nytUrl = 'https://www.nytimes.com/2024/01/15/world/europe/article-title-here.html';
    expect(parseArticleSlugFromUrl(nytUrl)).toBe('article title here');

    // Medium style URL
    const mediumUrl = 'https://medium.com/publication/some-great-article-a1b2c3d4e5f6';
    expect(parseArticleSlugFromUrl(mediumUrl)).toBe('some great article');
  });

  it('preserves short article IDs that are not filtered', () => {
    // 4 digits should not be filtered as an ID
    expect(parseArticleSlugFromUrl('https://example.com/news-1234')).toBe('news 1234');
  });
});
