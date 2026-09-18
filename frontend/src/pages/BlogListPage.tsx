import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { EmptyState } from '../components/EmptyState'
import { ErrorMessage, Loading } from '../components/Loading'
import { Pagination } from '../components/Pagination'
import type { PaginatedResponse, Post } from '../types'

export function BlogListPage() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') ?? 1)
  const [data, setData] = useState<PaginatedResponse<Post> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api<PaginatedResponse<Post>>(`/posts?page=${page}&limit=9`)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết.'))
      .finally(() => setLoading(false))
  }, [page])

  const goPage = (p: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  if (loading) return <Loading label="Đang tải câu chuyện…" />
  if (error) return <div className="shell page-space"><ErrorMessage message={error} /></div>
  if (!data?.items.length) {
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
        {data.items.map((post) => (
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
      <Pagination page={page} totalPages={data.totalPages} onPage={goPage} />
    </div>
  )
}
