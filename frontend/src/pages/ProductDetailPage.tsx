import { Check, ChevronLeft, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { useCategories } from '../lib/categories'
import { formatMoney } from '../lib/format'
import { useCartStore } from '../store/cart'
import type { Product } from '../types'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { labelFor } = useCategories()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const add = useCartStore((state) => state.add)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api<Product>(`/products/${slug}`).then(setProduct).catch((err: unknown) => setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.')).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loading />
  if (error || !product) return <div className="shell page-space"><ErrorMessage message={error || 'Không tìm thấy sản phẩm.'} /></div>
  const addToCart = () => { if (add(product)) { setAdded(true); window.setTimeout(() => setAdded(false), 1800) } }

  return <div className="shell page-space product-detail">
    <Link className="back-link" to="/san-pham"><ChevronLeft size={18} aria-hidden="true" /> Tất cả sản phẩm</Link>
    <div className="product-detail-grid">
      <section className="product-gallery"><div className="main-product-image">{product.images[activeImage] ? <img src={product.images[activeImage]} alt={product.name} /> : <div className="image-placeholder" />}</div>{product.images.length > 1 && <div className="thumbnails">{product.images.map((image, index) => <button type="button" key={image} className={index === activeImage ? 'is-active' : ''} onClick={() => setActiveImage(index)}><img src={image} alt={`Ảnh ${index + 1} của ${product.name}`} /></button>)}</div>}</section>
      <section className="product-detail-copy"><p className="side-label">{labelFor(product.category)}</p><h1>{product.name}</h1><p className="detail-price">{formatMoney(product.price)}</p><p className="detail-description">{product.description}</p><div className="product-notes"><p><Check size={17} aria-hidden="true" /> Gỗ tự nhiên, hoàn thiện thủ công</p><p><Check size={17} aria-hidden="true" /> Bóng đèn ánh sáng vàng ấm</p></div><button type="button" className="button add-button" onClick={addToCart}>{added ? <><Check size={19} aria-hidden="true" /> Đã thêm vào giỏ</> : <><ShoppingBag size={19} aria-hidden="true" /> Thêm vào giỏ</>}</button><p className="shipping-note">Giao hàng nội thành 2–4 ngày · Đóng gói cẩn thận</p></section>
    </div>
  </div>
}
