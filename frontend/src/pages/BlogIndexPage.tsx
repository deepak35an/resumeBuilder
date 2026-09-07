import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AdSlot } from '@/components/ads/AdSlot';
import { RetryState } from '@/components/feedback/RetryState';
import { breadcrumbJsonLd, Seo, webPageJsonLd } from '@/components/seo/Seo';
import { Card, EmptyState, Input, Skeleton } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { contentService } from '@/services/content.service';

export default function BlogIndexPage() {
  const [search, setSearch] = useState('');
  const posts = useQuery({
    queryKey: queryKeys.blogPosts({ search }),
    queryFn: () => contentService.listBlog({ search: search || undefined }),
  });

  const items = posts.data?.items ?? [];

  return (
    <>
      <Seo
        title="Blog"
        description="Guides on ATS screening, resume keywords, bullet points and job applications."
        path="/blog"
        jsonLd={[
          webPageJsonLd({
            name: 'Blog',
            description: 'Guides on ATS screening, keywords and resume writing.',
            path: '/blog',
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]),
        ]}
      />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Writing that helps you ship a resume</h1>
          <p className="mt-3 text-muted-foreground">
            Practical notes on parsers, keywords and structure. No invented success rates.
          </p>
          <Input
            className="mt-6"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search posts"
            aria-label="Search posts"
          />
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {posts.isError && <RetryState error={posts.error} onRetry={() => void posts.refetch()} />}
        {posts.isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        )}
        {posts.isSuccess && items.length === 0 && (
          <EmptyState
            title="No posts yet"
            description="When the catalogue is published, guides on ATS screening and keywords will appear here."
          />
        )}
        <div className="space-y-4">
          {items.map((post) => (
            <Card key={post.id} interactive as="article">
              <p className="text-xs text-muted-foreground">
                {post.category}
                {post.publishedAt ? ` · ${formatRelativeTime(post.publishedAt)}` : ''}
                {` · ${post.readingMinutes} min`}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                <Link to={`/blog/${post.slug}`} className="link-underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground text-pretty">{post.excerpt}</p>
            </Card>
          ))}
        </div>
        <AdSlot slot="blog" className="mt-10" />
      </div>
    </>
  );
}
