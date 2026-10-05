import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  List,
  Share2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setPost(null)
    setRelated([])
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })

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

  // Extract table of contents and inject IDs into H2 headings
  const postContent = post?.content
  const { processedHtml, toc } = useMemo(() => {
    if (!postContent) return { processedHtml: '', toc: [] }
    const headings: { id: string; text: string }[] = []
    let counter = 0

    const htmlWithIds = postContent.replace(
      /<h2([^>]*)>(.*?)<\/h2>/gi,
      (_match, attrs, text) => {
        counter++
        const cleanText = stripHtml(text)
        const id = slugifyHeading(cleanText) || `muc-${counter}`
        headings.push({ id, text: cleanText })
        return `<h2 id="${id}"${attrs}>${text}</h2>`
      },
    )

    return { processedHtml: htmlWithIds, toc: headings }
  }, [postContent])

  if (error) {
    return (
      <div className="shell page-space">
        <ErrorMessage message={error} />
      </div>
    )
  }
  if (!post) return <Loading label="Đang mở bài viết…" />

  const plainText = stripHtml(post.content)
  const words = plainText.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.round(words / 190))
  const shortDescription =
    plainText.length > 160 ? `${plainText.slice(0, 157)}...` : plainText

  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        inLanguage: 'vi-VN',
        headline: post.title,
        image: post.coverImage ? [post.coverImage] : [],
        datePublished: post.createdAt,
        dateModified: post.createdAt,
        description: shortDescription,
        author: {
          '@type': 'Organization',
          name: 'Đèn Gỗ Sài Gòn',
          url: 'https://denthucong.site',
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

  const handleShareFacebook = () => {
    const url = window.location.href
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleShareZalo = () => {
    const url = window.location.href
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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

      <header className="article-header">
        <div className="article-meta-top">
          <span className="side-label">Góc kể chuyện</span>
          <span className="dot-separator">·</span>
          <span className="read-time">
            <Clock size={14} aria-hidden="true" /> {readingTime} phút đọc
          </span>
          <span className="dot-separator">·</span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>

        <h1>{post.title}</h1>

        <div className="article-author-badge">
          <div className="author-avatar" aria-hidden="true">
            ĐG
          </div>
          <div className="author-info">
            <strong>Xưởng Đèn Gỗ Sài Gòn</strong>
            <span>Chế tác thủ công & Thiết kế ánh sáng</span>
          </div>
        </div>
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

      {/* Auto Table of Contents when article has 2+ headings */}
      {toc.length >= 2 && (
        <nav className="article-toc" aria-label="Mục lục bài viết">
          <p className="article-toc-title">
            <List size={16} aria-hidden="true" /> Mục lục nội dung
          </p>
          <ul>
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToHeading(item.id)
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Main Formatted Article Content */}
      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: processedHtml || post.content }}
      />

      {/* Footer Actions: Social Share & CTA */}
      <footer className="article-footer-actions">
        <div className="article-share-bar">
          <span>
            <Share2 size={16} aria-hidden="true" style={{ display: 'inline', marginRight: 6 }} />
            Chia sẻ bài viết:
          </span>
          <button type="button" className="share-btn" onClick={handleShareFacebook}>
            Facebook
          </button>
          <button type="button" className="share-btn" onClick={handleShareZalo}>
            Zalo
          </button>
          <button type="button" className="share-btn" onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check size={14} aria-hidden="true" /> Đã sao chép link
              </>
            ) : (
              <>
                <Copy size={14} aria-hidden="true" /> Sao chép liên kết
              </>
            )}
          </button>
        </div>

        <div className="article-cta-box">
          <div>
            <h3>Mang ánh sáng gỗ ấm áp về không gian sống</h3>
            <p>
              Mỗi mẫu đèn của chúng tôi được tạo tác từ gỗ tự nhiên, thiết kế tối giản để tôn vinh
              chất mộc và cảm giác thư thái cho ngôi nhà.
            </p>
          </div>
          <Link className="button" to="/san-pham">
            Khám phá bộ sưu tập
          </Link>
        </div>
      </footer>

      {/* Related Posts */}
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
