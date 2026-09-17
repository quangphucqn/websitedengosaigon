import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatMoney } from '../lib/format'
import { useCartStore } from '../store/cart'
import type { Product } from '../types'

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const add = useCartStore((state) => state.add)

  return (
    <article className={featured ? 'product-card featured-product-card' : 'product-card'}>
      <Link className="product-image" to={`/san-pham/${product.slug}`}>
        {product.images[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="image-placeholder" />}
      </Link>
      <div className="product-copy">
        <Link to={`/san-pham/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{formatMoney(product.price)}</p>
        <button type="button" className="icon-text-button" onClick={() => add(product)}>
          <ShoppingBag size={17} aria-hidden="true" />
          Thêm vào giỏ
        </button>
      </div>
    </article>
  )
}
