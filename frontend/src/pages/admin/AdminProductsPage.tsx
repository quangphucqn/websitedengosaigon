import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { ErrorMessage, Loading } from '../../components/Loading'
import { categoryLabel, formatMoney } from '../../lib/format'
import type { Product } from '../../types'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Product[]>('/products/admin/all')
      .then(setProducts)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.'))
      .finally(() => setLoading(false))
  }, [])

  const remove = async (product: Product) => {
    if (!window.confirm(`Xóa sản phẩm “${product.name}”?`)) return
    try {
      await api(`/products/${product._id}`, { method: 'DELETE' })
      setProducts((list) => list.filter((item) => item._id !== product._id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa sản phẩm.')
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div>
          <p className="side-label">Quản lý</p>
          <h1>Sản phẩm</h1>
        </div>
        <Link className="button" to="/admin/san-pham/moi"><Plus size={17} aria-hidden="true" /> Thêm sản phẩm</Link>
      </header>
      {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : (
        <table className="admin-table">
          <thead><tr><th>Sản phẩm</th><th>Loại</th><th>Giá</th><th>Kho</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  <div className="table-product">
                    {product.images[0] && <img src={product.images[0]} alt="" />}
                    <div>
                      <strong>{product.name}</strong>
                      {product.isFeatured && <span className="tag">Nổi bật</span>}
                    </div>
                  </div>
                </td>
                <td>{categoryLabel[product.category]}</td>
                <td>{formatMoney(product.price)}</td>
                <td>{product.stock}</td>
                <td><span className="tag">{product.isPublished ? 'Đang hiển thị' : 'Đang ẩn'}</span></td>
                <td className="table-actions">
                  <Link to={`/admin/san-pham/${product._id}`} aria-label="Sửa"><Pencil size={16} /></Link>
                  <button type="button" onClick={() => remove(product)} aria-label="Xóa"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
