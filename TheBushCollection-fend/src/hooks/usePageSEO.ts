import { useEffect } from 'react';

interface PageSEOOptions {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
}

const setMeta = (selector: string, attr: 'content' | 'href', value: string) => {
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, value);
};

const getMeta = (selector: string, attr: 'content' | 'href') =>
  document.querySelector(selector)?.getAttribute(attr) ?? '';

/**
 * index.html ships static title/meta/canonical/OG tags as the site-wide
 * default. React never hydrates <head>, so rendering competing tags (e.g.
 * via react-helmet) only appends duplicates alongside the static ones —
 * Google then sees two descriptions and two canonicals on one page. This
 * hook mutates the existing nodes in place instead, and restores the
 * defaults on unmount so the next route isn't left with stale values.
 */
export function usePageSEO({ title, description, canonical, ogImage }: PageSEOOptions) {
  useEffect(() => {
    const prev = {
      title: document.title,
      description: getMeta('meta[name="description"]', 'content'),
      canonical: getMeta('link[rel="canonical"]', 'href'),
      ogTitle: getMeta('meta[property="og:title"]', 'content'),
      ogDescription: getMeta('meta[property="og:description"]', 'content'),
      ogUrl: getMeta('meta[property="og:url"]', 'content'),
      ogImage: getMeta('meta[property="og:image"]', 'content'),
      twitterTitle: getMeta('meta[name="twitter:title"]', 'content'),
      twitterDescription: getMeta('meta[name="twitter:description"]', 'content'),
      twitterImage: getMeta('meta[name="twitter:image"]', 'content'),
    };

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonical);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    if (ogImage) {
      setMeta('meta[property="og:image"]', 'content', ogImage);
      setMeta('meta[name="twitter:image"]', 'content', ogImage);
    }

    return () => {
      document.title = prev.title;
      setMeta('meta[name="description"]', 'content', prev.description);
      setMeta('link[rel="canonical"]', 'href', prev.canonical);
      setMeta('meta[property="og:title"]', 'content', prev.ogTitle);
      setMeta('meta[property="og:description"]', 'content', prev.ogDescription);
      setMeta('meta[property="og:url"]', 'content', prev.ogUrl);
      setMeta('meta[property="og:image"]', 'content', prev.ogImage);
      setMeta('meta[name="twitter:title"]', 'content', prev.twitterTitle);
      setMeta('meta[name="twitter:description"]', 'content', prev.twitterDescription);
      setMeta('meta[name="twitter:image"]', 'content', prev.twitterImage);
    };
  }, [title, description, canonical, ogImage]);
}
