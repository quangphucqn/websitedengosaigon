import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import type { Post } from '../types'

export function BlogDetailPage() {
  const { slug = '' } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { api<Post>(`/posts/${slug}`).then(setPost).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết.')) }, [slug])
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>
  if (!post) return <Loading label="Đang mở bài viết…" />
  return <article className="shell page-space article"><Link className="back-link" to="/bai-viet"><ArrowLeft size={17} aria-hidden="true" /> Tất cả bài viết</Link><header><p className="side-label">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p><h1>{post.title}</h1></header>{post.coverImage && <img className="article-cover" src={post.coverImage} alt="" />}<div className="article-content" dangerouslySetInnerHTML={{ __html: post.content }} /></article>
}
