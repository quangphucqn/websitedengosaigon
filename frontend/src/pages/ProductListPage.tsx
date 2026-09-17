import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { categoryLabel } from '../lib/format'
import type { Product, ProductCategory } from '../types'

const categories: { value: '' | ProductCategory; label: string }[] = [
  { value: '', label: 'Tất cả' },
  { value: 'den-ban', label: 'Đèn bàn' },
  { value: 'den-treo', label: 'Đèn treo' },
  { value: 'den-dung', label: 'Đèn đứng' },
  { value: 'den-ngu', label: 'Đèn ngủ' },
]

export function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const search = params.get('search') ?? ''
  const category = (params.get('category') ?? '') as '' | ProductCategory
  const sort = params.get('sort') ?? 'newest'

  useEffect(() => {
    api<Product[]>(`/products?${params.toString()}`)
      .then(setProducts)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.'))
      .finally(() => setLoading(false))
  }, [params])

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return <div className="shell page-space product-list-page">
    <div className="page-title"><p className="side-label">Bộ sưu tập</p><h1>Chọn một vùng sáng cho căn nhà</h1><p>Các thiết kế được làm từ gỗ tự nhiên, hoàn thiện bằng tay và dùng bóng đèn ánh vàng ấm.</p></div>
    <div className="product-filters">
      <label className="search-field"><Search size={18} aria-hidden="true" /><input value={search} onChange={(event) => change('search', event.target.value)} placeholder="Tìm tên chiếc đèn" aria-label="Tìm tên sản phẩm" /></label>
      <div className="category-filter" aria-label="Lọc theo loại đèn">{categories.map((item) => <button type="button" key={item.value} className={category === item.value ? 'is-selected' : ''} onClick={() => change('category', item.value)}>{item.label}</button>)}</div>
      <label className="sort-field"><SlidersHorizontal size={17} aria-hidden="true" /><span>Sắp xếp</span><select value={sort} onChange={(event) => change('sort', event.target.value)}><option value="newest">Mới nhất</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option></select></label>
    </div>
    {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : products.length ? <><p className="result-count">{products.length} sản phẩm{category && ` · ${categoryLabel[category]}`}</p><div className="product-grid">{products.map((product) => <ProductCard key={product._id} product={product} />)}</div></> : <section className="empty-state"><h2>Chưa tìm thấy sản phẩm phù hợp</h2><p>Thử thay đổi từ khóa hoặc chọn một loại đèn khác.</p></section>}
  </div>
}
