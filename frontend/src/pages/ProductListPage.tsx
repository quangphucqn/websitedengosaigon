import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { useCategories } from '../lib/categories'
import type { PaginatedResponse, Product } from '../types'

export function ProductListPage() {
  const [params, setParams] = useSearchParams()
  const { categories, labelFor } = useCategories()
  const [data, setData] = useState<PaginatedResponse<Product> | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const search = params.get('search') ?? ''
  const category = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'newest'
  const page = Number(params.get('page') ?? 1)

  useEffect(() => {
    setLoading(true)
    api<PaginatedResponse<Product>>(`/products?${params.toString()}`)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.'))
      .finally(() => setLoading(false))
  }, [params])

  const change = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (key !== 'page') next.delete('page')
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  const goPage = (p: number) => {
    const next = new URLSearchParams(params)
    next.set('page', String(p))
    setParams(next)
  }

  return <div className="shell page-space product-list-page">
    <div className="product-filters">
      <label className="search-field"><Search size={18} aria-hidden="true" /><input value={search} onChange={(event) => change('search', event.target.value)} placeholder="Tìm tên chiếc đèn" aria-label="Tìm tên sản phẩm" /></label>
      <div className="category-filter" aria-label="Lọc theo loại đèn">
        <button type="button" className={category === '' ? 'is-selected' : ''} onClick={() => change('category', '')}>Tất cả</button>
        {categories.map((item) => (
          <button type="button" key={item._id} className={category === item.slug ? 'is-selected' : ''} onClick={() => change('category', item.slug)}>{item.name}</button>
        ))}
      </div>
      <label className="sort-field"><SlidersHorizontal size={17} aria-hidden="true" /><span>Sắp xếp</span><select value={sort} onChange={(event) => change('sort', event.target.value)}><option value="newest">Mới nhất</option><option value="price_asc">Giá thấp đến cao</option><option value="price_desc">Giá cao đến thấp</option></select></label>
    </div>
    {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : data?.items.length ? <><p className="result-count">{data.total} sản phẩm{category && ` · ${labelFor(category)}`}</p><div className="product-grid">{data.items.map((product) => <ProductCard key={product._id} product={product} />)}</div><Pagination page={page} totalPages={data.totalPages} onPage={goPage} /></> : <section className="empty-state"><h2>Chưa tìm thấy sản phẩm phù hợp</h2><p>Thử thay đổi từ khóa hoặc chọn một loại đèn khác.</p></section>}
  </div>
}
