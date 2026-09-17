import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import type { Post } from '../../types'

export function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => { api<Post[]>('/posts/admin/all').then(setPosts).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải bài viết.')).finally(() => setLoading(false)) }, [])
  const remove = async (post: Post) => {
    if (!window.confirm(`Xóa bài viết “${post.title}”?`)) return
    try { await api(`/posts/${post._id}`, { method: 'DELETE' }); setPosts((list) => list.filter((item) => item._id !== post._id)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Không thể xóa bài viết.') }
  }
  return <div className="admin-page"><header className="admin-page-head"><div><p className="side-label">Quản lý</p><h1>Bài viết</h1></div><Link className="button" to="/admin/bai-viet/moi"><Plus size={17} aria-hidden="true" /> Viết bài mới</Link></header>{loading ? <Loading /> : error ? <ErrorMessage message={error} /> : <table className="admin-table"><thead><tr><th>Bài viết</th><th>Trạng thái</th><th>Ngày tạo</th><th></th></tr></thead><tbody>{posts.map((post) => <tr key={post._id}><td><strong>{post.title}</strong></td><td><span className={post.isPublished ? 'status status-da_giao' : 'tag'}>{post.isPublished ? 'Đã đăng' : 'Đang ẩn'}</span></td><td>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</td><td className="table-actions"><Link to={`/admin/bai-viet/${post._id}`} aria-label="Sửa"><Pencil size={16} /></Link><button type="button" onClick={() => { void remove(post) }} aria-label="Xóa"><Trash2 size={16} /></button></td></tr>)}</tbody></table>}</div>
}
