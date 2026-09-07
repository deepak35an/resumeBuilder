/**
 * SEO head management.
 *
 * A tiny purpose-built head manager instead of a dependency: it sets the title,
 * meta description, canonical URL, OpenGraph/Twitter tags and JSON-LD, and
 * cleans up the tags it created when a route unmounts.
 */

import { useEffect } from 'react';

import { config, siteUrl } from '@/lib/config';

const MANAGED = 'data-rf-seo';

export interface SeoProps {
  title: string;
  description: string;
  /** Path only, e.g. `/resume-templates`. */
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  /** Set for private application routes. */
  noindex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  /** One or more JSON-LD graphs. */
  jsonLd?: Array<Record<string, unknown>>;
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    element.setAttribute(MANAGED, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(rel: string, href: string): void {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute(MANAGED, 'true');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function Seo({
  title,
  description,
  path = window.location.pathname,
  image,
  type = 'website',
  noindex = false,
  keywords,
  publishedTime,
  modifiedTime,
  author,
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title.includes(config.appName) ? title : `${title} | ${config.appName}`;
    const canonical = siteUrl(path);
    const socialImage = image ?? siteUrl('/og-default.png');

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large');
    if (keywords?.length) upsertMeta('name', 'keywords', keywords.join(', '));
    upsertLink('canonical', canonical);

    upsertMeta('property', 'og:site_name', config.appName);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonical);
    upsertMeta('property', 'og:image', socialImage);
    upsertMeta('property', 'og:locale', 'en_US');

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', socialImage);

    if (type === 'article') {
      if (publishedTime) upsertMeta('property', 'article:published_time', publishedTime);
      if (modifiedTime) upsertMeta('property', 'article:modified_time', modifiedTime);
      if (author) upsertMeta('property', 'article:author', author);
    }

    const scripts: HTMLScriptElement[] = [];
    for (const graph of jsonLd ?? []) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute(MANAGED, 'true');
      script.textContent = JSON.stringify(graph);
      document.head.appendChild(script);
      scripts.push(script);
    }

    return () => scripts.forEach((script) => script.remove());
  }, [
    title,
    description,
    path,
    image,
    type,
    noindex,
    keywords,
    publishedTime,
    modifiedTime,
    author,
    jsonLd,
  ]);

  return null;
}

// --- Structured data builders ---------------------------------------------

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.appName,
    url: siteUrl('/'),
    description:
      'ATS-first resume builder, ATS resume checker and job description matcher.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl('/blog')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageJsonLd(options: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: options.name,
    description: options.description,
    url: siteUrl(options.path),
    isPartOf: { '@type': 'WebSite', name: config.appName, url: siteUrl('/') },
  };
}

export function breadcrumbJsonLd(
  trail: Array<{ name: string; path: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: siteUrl(entry.path),
    })),
  };
}

export function faqJsonLd(
  faqs: Array<{ question: string; answer: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

export function articleJsonLd(options: {
  title: string;
  description: string;
  path: string;
  author: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  image?: string | null;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description,
    url: siteUrl(options.path),
    author: { '@type': 'Organization', name: options.author },
    publisher: {
      '@type': 'Organization',
      name: config.appName,
      logo: { '@type': 'ImageObject', url: siteUrl('/favicon.svg') },
    },
    datePublished: options.publishedAt ?? undefined,
    dateModified: options.updatedAt ?? options.publishedAt ?? undefined,
    image: options.image ?? undefined,
    mainEntityOfPage: { '@type': 'WebPage', '@id': siteUrl(options.path) },
  };
}

/**
 * SoftwareApplication without any rating or review fields - we do not publish
 * ratings we cannot substantiate.
 */
export function softwareApplicationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.appName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl('/'),
    description:
      'Build an ATS-friendly resume, check how applicant tracking systems may read it, and tailor it to any job description.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Pro',
        price: '9',
        priceCurrency: 'USD',
      },
    ],
  };
}
