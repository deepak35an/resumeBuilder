import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { queryKeys } from '@/app/queryClient';
import { AdSlot } from '@/components/ads/AdSlot';
import { RetryState } from '@/components/feedback/RetryState';
import { articleJsonLd, breadcrumbJsonLd, Seo } from '@/components/seo/Seo';
import { Badge, ButtonLink, Skeleton } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { contentService } from '@/services/content.service';

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const post = useQuery({
    queryKey: queryKeys.blogPost(slug),
    queryFn: () => contentService.getBlog(slug),
    enabled: Boolean(slug),
  });

  if (post.isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Seo title="Post unavailable" description="We could not load that article." noindex />
        <RetryState error={post.error} onRetry={() => void post.refetch()} />
        <ButtonLink to="/blog" className="mt-6" variant="secondary">
          All posts
        </ButtonLink>
      </div>
    );
  }

  if (post.isLoading || !post.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64" />
      </div>
    );
  }

  const article = post.data;

  return (
    <>
      <Seo
        title={article.seoTitle || article.title}
        description={article.seoDescription || article.excerpt}
        path={`/blog/${article.slug}`}
        type="article"
        author={article.author}
        publishedTime={article.publishedAt ?? undefined}
        modifiedTime={article.updatedAt}
        jsonLd={[
          articleJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/blog/${article.slug}`,
            author: article.author,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            image: article.coverImage,
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: article.title, path: `/blog/${article.slug}` },
          ]),
        ]}
      />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs text-muted-foreground">
          <Link to="/blog" className="link-underline">
            Blog
          </Link>
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground text-balance">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{article.author}</span>
          {article.publishedAt && <span>· {formatDateTime(article.publishedAt)}</span>}
          <span>· {article.readingMinutes} min read</span>
          <Badge size="xs" tone="outline">
            {article.category}
          </Badge>
        </div>
        <div className="prose-resume mt-8 whitespace-pre-wrap text-sm leading-7 text-foreground text-pretty">
          {article.content}
        </div>
        <AdSlot slot="blog" className="mt-10" />
      </article>
    </>
  );
}
