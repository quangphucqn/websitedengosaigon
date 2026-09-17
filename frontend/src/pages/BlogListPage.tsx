import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage, Loading } from '../components/Loading'
import type { Post } from '../types'

export function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Post[]>('/posts')
      .then(setPosts)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loading label="Đang tải câu chuyện…" />
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>
  if (!posts.length) {
    return (
      <div className="shell page-space">
        <EmptyState title="Chưa có bài viết" body="Những câu chuyện về ánh sáng sẽ xuất hiện tại đây." />
      </div>
    )
  }

  return (
    <div className="shell page-space blog-list-page">
      <div className="page-title">
        <p className="side-label">Góc kể chuyện</p>
        <h1>Ánh sáng trong nhà</h1>
        <p>Những ghi chép nhỏ về chất liệu, ánh sáng và cách tạo ra một không gian đáng ở lại.</p>
      </div>
      <div className="blog-grid">
        {posts.map((post) => (
          <article className="blog-card" key={post._id}>
            <Link className="blog-cover" to={`/bai-viet/${post.slug}`}>
              {post.coverImage && <img src={post.coverImage} alt="" />}
            </Link>
            <p>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
            <Link to={`/bai-viet/${post.slug}`}><h2>{post.title}</h2></Link>
            <Link className="text-link" to={`/bai-viet/${post.slug}`}>Đọc bài viết</Link>
          </article>
        ))}
      </div>
    </div>
  )
}
