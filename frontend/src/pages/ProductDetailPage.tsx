import { Check, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { ErrorMessage, Loading } from '../components/Loading'
import { ProductCard } from '../components/ProductCard'
import { Seo } from '../components/Seo'
import { useCategories } from '../lib/categories'
import { formatMoney } from '../lib/format'
import { useCartStore } from '../store/cart'
import type { PaginatedResponse, Product } from '../types'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { labelFor } = useCategories()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [activeImage, setActiveImage] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const add = useCartStore((state) => state.add)
  const [added, setAdded] = useState(false)

  const sliderRef = useRef<HTMLDivElement>(null)
  const [scrollState, setScrollState] = useState({ canLeft: false, canRight: false })

  const updateScrollState = useCallback(() => {
    if (sliderRef.current) {
      const el = sliderRef.current
      setScrollState({
        canLeft: el.scrollLeft > 6,
        canRight: el.scrollLeft + el.clientWidth < el.scrollWidth - 6,
      })
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setActiveImage(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    api<Product>(`/products/${slug}`)
      .then((loadedProduct) => {
        if (cancelled) return
        setProduct(loadedProduct)

        // Fetch related products in same category (up to 8 products for slider)
        api<PaginatedResponse<Product>>(
          `/products?category=${encodeURIComponent(loadedProduct.category)}&limit=10`,
        )
          .then((res) => {
            if (!cancelled) {
              setRelated(res.items.filter((item) => item.slug !== slug).slice(0, 8))
            }
          })
          .catch(() => {
            if (!cancelled) setRelated([])
          })
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    const el = sliderRef.current
    updateScrollState()

    el?.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      el?.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [related.length, updateScrollState])

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const firstChild = sliderRef.current.firstElementChild as HTMLElement | null
    const amount = firstChild ? firstChild.offsetWidth + 22 : 320
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  if (loading) return <Loading />
  if (error || !product) {
    return (
      <div className="shell page-space">
        <ErrorMessage message={error || 'Không tìm thấy sản phẩm.'} />
      </div>
    )
  }

  const addToCart = () => {
    if (add(product)) {
      setAdded(true)
      window.setTimeout(() => setAdded(false), 1800)
    }
  }

  const categoryName = labelFor(product.category)
  const productDescriptionClean = product.description.replace(/\s+/g, ' ').trim()
  const shortDescription =
    productDescriptionClean.length > 160
      ? `${productDescriptionClean.slice(0, 157)}...`
      : productDescriptionClean

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        inLanguage: 'vi-VN',
        name: product.name,
        image: product.images,
        description: product.description,
        sku: product._id,
        category: categoryName,
        brand: {
          '@type': 'Brand',
          name: 'Đèn Gỗ Sài Gòn',
        },
        offers: {
          '@type': 'Offer',
          url: `https://denthucong.site/san-pham/${product.slug}`,
          priceCurrency: 'VND',
          price: product.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: {
            '@type': 'Organization',
            name: 'Đèn Gỗ Sài Gòn',
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Trang chủ',
            item: 'https://denthucong.site/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: categoryName || 'Sản phẩm',
            item: `https://denthucong.site/san-pham?category=${encodeURIComponent(product.category)}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.name,
            item: `https://denthucong.site/san-pham/${product.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <div className="shell page-space product-detail">
      <Seo
        title={`${product.name} — ${categoryName}`}
        description={`${product.name}: ${shortDescription} Giá: ${formatMoney(product.price)}. Đặt mua online hoặc liên hệ xưởng Đèn Gỗ Sài Gòn.`}
        canonical={`/san-pham/${product.slug}`}
        image={product.images[0]}
        type="product"
        schema={productSchema}
      />

      <Link className="back-link" to="/san-pham">
        <ChevronLeft size={18} aria-hidden="true" /> Tất cả sản phẩm
      </Link>
      <div className="product-detail-grid">
        <section className="product-gallery">
          <div className="main-product-image">
            {product.images[activeImage] ? (
              <img
                src={product.images[activeImage]}
                alt={`${product.name} — Đèn gỗ thủ công góc nhìn ${activeImage + 1}`}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="image-placeholder" />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="thumbnails">
              {product.images.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={index === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(index)}
                  aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thu nhỏ ${index + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="product-detail-copy">
          <p className="side-label">{categoryName}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatMoney(product.price)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="product-notes">
            <p>
              <Check size={17} aria-hidden="true" /> Gỗ tự nhiên, hoàn thiện thủ công
            </p>
            <p>
              <Check size={17} aria-hidden="true" /> Bóng đèn ánh sáng vàng ấm
            </p>
          </div>
          <button type="button" className="button add-button" onClick={addToCart}>
            {added ? (
              <>
                <Check size={19} aria-hidden="true" /> Đã thêm vào giỏ
              </>
            ) : (
              <>
                <ShoppingBag size={19} aria-hidden="true" /> Thêm vào giỏ
              </>
            )}
          </button>
          <p className="shipping-note">Giao hàng nội thành 2–4 ngày · Đóng gói cẩn thận</p>
        </section>
      </div>

      {/* Related Products Slider in Same Category */}
      {related.length > 0 && (
        <section
          className="related-products-section"
          aria-labelledby="related-products-heading"
        >
          <header className="section-heading">
            <div>
              <p className="side-label">Gợi ý từ xưởng</p>
              <h2 id="related-products-heading">Sản phẩm cùng loại</h2>
            </div>
            <div className="section-heading-actions">
              <Link
                className="text-link"
                to={`/san-pham?category=${encodeURIComponent(product.category)}`}
              >
                Xem thêm {categoryName.toLowerCase()}
              </Link>
              {related.length > 2 && (
                <div
                  className="slider-nav-buttons"
                  role="group"
                  aria-label="Điều hướng sản phẩm cùng loại"
                >
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider('left')}
                    disabled={!scrollState.canLeft}
                    aria-label="Xem sản phẩm trước"
                  >
                    <ChevronLeft size={18} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="slider-nav-btn"
                    onClick={() => scrollSlider('right')}
                    disabled={!scrollState.canRight}
                    aria-label="Xem sản phẩm tiếp theo"
                  >
                    <ChevronRight size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </header>
          <div
            ref={sliderRef}
            className="home-slider-track"
            tabIndex={0}
            aria-label="Dải sản phẩm cùng loại"
          >
            {related.map((item) => (
              <div className="home-slider-item-product" key={item._id}>
                <ProductCard product={item} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
