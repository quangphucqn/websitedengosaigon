import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import type { PaginatedResponse, Post } from '../types'

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
      .then((item) => { if (!cancelled) setPost(item) })
      .catch((err: unknown) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải bài viết.') })
    api<PaginatedResponse<Post>>(`/posts?page=1&limit=6`)
      .then((data) => {
        if (!cancelled) setRelated(data.items.filter((item) => item.slug !== slug).slice(0, 3))
      })
      .catch(() => { if (!cancelled) setRelated([]) })
    return () => { cancelled = true }
  }, [slug])
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>
  if (!post) return <Loading label="Đang mở bài viết…" />
  return (
    <article className="shell page-space article">
      <Link className="back-link" to="/bai-viet"><ArrowLeft size={17} aria-hidden="true" /> Tất cả bài viết</Link>
      <header>
        <p className="side-label">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
        <h1>{post.title}</h1>
      </header>
      {post.coverImage && <img className="article-cover" src={post.coverImage} alt="" />}
      <div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      {related.length > 0 && (
        <section className="article-related" aria-labelledby="related-posts-title">
          <header className="section-heading">
            <h2 id="related-posts-title">Bài viết liên quan</h2>
            <Link className="text-link" to="/bai-viet">Tất cả bài viết</Link>
          </header>
          <div className="blog-grid">
            {related.map((item) => (
              <article className="blog-card" key={item._id}>
                <Link className="blog-cover" to={`/bai-viet/${item.slug}`}>
                  {item.coverImage && <img src={item.coverImage} alt="" />}
                </Link>
                <p>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p>
                <Link to={`/bai-viet/${item.slug}`}><h2>{item.title}</h2></Link>
                <Link className="text-link" to={`/bai-viet/${item.slug}`}>Đọc bài viết</Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
