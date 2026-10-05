import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { Seo } from '../components/Seo'
import type { PaginatedResponse, Post } from '../types'

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setPost(null)
    setRelated([])
    setError('')
    api<Post>(`/posts/${slug}`)
      .then((item) => {
        if (!cancelled) setPost(item)
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Không thể tải bài viết.')
      })
    api<PaginatedResponse<Post>>(`/posts?page=1&limit=6`)
      .then((data) => {
        if (!cancelled)
          setRelated(data.items.filter((item) => item.slug !== slug).slice(0, 3))
      })
      .catch(() => {
        if (!cancelled) setRelated([])
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (error) {
    return (
      <div className="shell page-space">
        <ErrorMessage message={error} />
      </div>
    )
  }
  if (!post) return <Loading label="Đang mở bài viết…" />

  const plainText = stripHtml(post.content)
  const shortDescription =
    plainText.length > 160 ? `${plainText.slice(0, 157)}...` : plainText

  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.createdAt,
        dateModified: post.createdAt,
        description: shortDescription,
        author: {
          '@type': 'Organization',
          name: 'Đèn Gỗ Sài Gòn',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Đèn Gỗ Sài Gòn',
          logo: {
            '@type': 'ImageObject',
            url: 'https://denthucong.site/favicon.svg',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://denthucong.site/bai-viet/${post.slug}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: 'https://denthucong.site/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Góc kể chuyện',
            item: 'https://denthucong.site/bai-viet',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://denthucong.site/bai-viet/${post.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <article className="shell page-space article">
      <Seo
        title={post.title}
        description={shortDescription}
        canonical={`/bai-viet/${post.slug}`}
        image={post.coverImage}
        type="article"
        schema={articleSchema}
      />
      <Link className="back-link" to="/bai-viet">
        <ArrowLeft size={17} aria-hidden="true" /> Tất cả bài viết
      </Link>
      <header>
        <p className="side-label">
          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
        </p>
        <h1>{post.title}</h1>
      </header>
      {post.coverImage && (
        <img
          className="article-cover"
          src={post.coverImage}
          alt={post.title}
          loading="eager"
          decoding="async"
        />
      )}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      {related.length > 0 && (
        <section className="article-related" aria-labelledby="related-posts-title">
          <header className="section-heading">
            <h2 id="related-posts-title">Bài viết liên quan</h2>
            <Link className="text-link" to="/bai-viet">
              Tất cả bài viết
            </Link>
          </header>
          <div className="blog-grid">
            {related.map((item) => (
              <article className="blog-card" key={item._id}>
                <Link className="blog-cover" to={`/bai-viet/${item.slug}`}>
                  {item.coverImage && (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </Link>
                <p>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                <Link to={`/bai-viet/${item.slug}`}>
                  <h2>{item.title}</h2>
                </Link>
                <Link className="text-link" to={`/bai-viet/${item.slug}`}>
                  Đọc bài viết
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
